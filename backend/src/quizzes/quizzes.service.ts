import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from '../database/entities/quiz.entity';
import { QuizQuestion } from '../database/entities/quiz-question.entity';
import { QuizAttempt } from '../database/entities/quiz-attempt.entity';
import { User } from '../database/entities/user.entity';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(Quiz)
    private quizRepo: Repository<Quiz>,
    @InjectRepository(QuizQuestion)
    private questionRepo: Repository<QuizQuestion>,
    @InjectRepository(QuizAttempt)
    private attemptRepo: Repository<QuizAttempt>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async findAll(category?: string) {
    const query = this.quizRepo.createQueryBuilder('q');
    if (category && category !== 'All') {
      query.andWhere('LOWER(q.category) = LOWER(:category)', { category });
    }
    return query.orderBy('q.id', 'ASC').getMany();
  }

  async findOne(idOrSlug: string | number, includeAnswers = false) {
    const isNumeric = !isNaN(Number(idOrSlug));
    let quiz: Quiz | null = null;

    if (isNumeric) {
      quiz = await this.quizRepo.findOne({ where: { id: Number(idOrSlug) } });
    } else {
      quiz = await this.quizRepo.findOne({ where: { slug: idOrSlug.toString() } });
    }

    if (!quiz) {
      throw new NotFoundException(`Quiz '${idOrSlug}' not found`);
    }

    const questions = await this.questionRepo.find({
      where: { quizId: quiz.id },
      order: { id: 'ASC' },
    });

    const sanitizedQuestions = questions.map((q) => {
      if (includeAnswers) return q;
      const { correctAnswers, explanation, ...safeQ } = q;
      return safeQ;
    });

    return {
      quiz,
      questions: sanitizedQuestions,
    };
  }

  async submitQuiz(quizId: number, userId: number, dto: SubmitQuizDto) {
    const quiz = await this.quizRepo.findOne({ where: { id: quizId } });
    if (!quiz) throw new NotFoundException('Quiz not found');

    const questions = await this.questionRepo.find({
      where: { quizId },
      order: { id: 'ASC' },
    });

    let correctCount = 0;
    let wrongCount = 0;
    const questionReview = [];

    for (const q of questions) {
      const selected = (dto.userAnswers[q.id.toString()] || []).sort();
      const expected = (q.correctAnswers || []).slice().sort();

      const isCorrect =
        selected.length > 0 &&
        selected.length === expected.length &&
        selected.every((val, idx) => val === expected[idx]);

      if (isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
      }

      questionReview.push({
        id: q.id,
        questionText: q.questionText,
        type: q.type,
        codeSnippet: q.codeSnippet,
        options: q.options,
        userSelected: selected,
        correctAnswers: q.correctAnswers,
        isCorrect,
        explanation: q.explanation,
      });
    }

    const total = questions.length || 1;
    // Calculate score factoring negative marking
    const netPoints = Math.max(
      0,
      correctCount - wrongCount * (quiz.negativeMarkingRatio || 0.25),
    );
    const scorePercentage = Math.round((netPoints / total) * 100);
    const passed = scorePercentage >= quiz.passingScore;

    const attempt = this.attemptRepo.create({
      userId,
      quizId,
      score: scorePercentage,
      totalQuestions: total,
      correctCount,
      wrongCount,
      timeTakenSeconds: dto.timeTakenSeconds,
      userAnswers: dto.userAnswers,
      passed,
      completedAt: new Date(),
    });

    await this.attemptRepo.save(attempt);

    return {
      attemptId: attempt.id,
      score: scorePercentage,
      passed,
      passingScore: quiz.passingScore,
      correctCount,
      wrongCount,
      totalQuestions: total,
      timeTakenSeconds: dto.timeTakenSeconds,
      questionReview,
    };
  }

  async getLeaderboard(quizId?: number) {
    const query = this.attemptRepo
      .createQueryBuilder('a')
      .innerJoin(User, 'u', 'u.id = a.userId')
      .select([
        'u.id as userId',
        'u.name as name',
        'u.avatar as avatar',
        'MAX(a.score) as highScore',
        'COUNT(a.id) as attemptsCount',
        'MIN(a.timeTakenSeconds) as bestTime',
      ])
      .groupBy('u.id')
      .orderBy('highScore', 'DESC')
      .addOrderBy('bestTime', 'ASC')
      .limit(20);

    if (quizId) {
      query.where('a.quizId = :quizId', { quizId });
    }

    const raw = await query.getRawMany();
    return raw.map((r, index) => ({
      rank: index + 1,
      userId: r.userId,
      name: r.name,
      avatar: r.avatar,
      score: Math.round(Number(r.highScore)),
      attemptsCount: Number(r.attemptsCount),
      bestTime: Number(r.bestTime),
    }));
  }

  async getUserHistory(userId: number) {
    const attempts = await this.attemptRepo
      .createQueryBuilder('a')
      .innerJoinAndSelect(Quiz, 'q', 'q.id = a.quizId')
      .where('a.userId = :userId', { userId })
      .orderBy('a.completedAt', 'DESC')
      .take(25)
      .getRawMany();

    return attempts.map((row) => ({
      id: row.a_id,
      quizId: row.a_quizId,
      quizTitle: row.q_title,
      category: row.q_category,
      score: row.a_score,
      passed: Boolean(row.a_passed),
      correctCount: row.a_correctCount,
      totalQuestions: row.a_totalQuestions,
      timeTakenSeconds: row.a_timeTakenSeconds,
      completedAt: row.a_completedAt,
    }));
  }

  async bulkCreateQuizzes(
    quizData: { quiz: Partial<Quiz>; questions: Partial<QuizQuestion>[] }[],
  ) {
    for (const item of quizData) {
      const quiz = await this.quizRepo.save(this.quizRepo.create(item.quiz));
      const questions = item.questions.map((q) => ({
        ...q,
        quizId: quiz.id,
      }));
      await this.questionRepo.save(this.questionRepo.create(questions));
    }
  }
}
