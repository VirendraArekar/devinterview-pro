import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../database/entities/question.entity';
import { CodingProblem } from '../database/entities/coding-problem.entity';
import { Quiz } from '../database/entities/quiz.entity';
import { DailyActivity } from '../database/entities/daily-activity.entity';
import { User } from '../database/entities/user.entity';

@Injectable()
export class DailyService {
  constructor(
    @InjectRepository(Question)
    private questionRepo: Repository<Question>,
    @InjectRepository(CodingProblem)
    private problemRepo: Repository<CodingProblem>,
    @InjectRepository(Quiz)
    private quizRepo: Repository<Quiz>,
    @InjectRepository(DailyActivity)
    private activityRepo: Repository<DailyActivity>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async getDailyHighlights() {
    const today = new Date();
    // Deterministic seed based on day of year so all users get the same Daily Question
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
        1000 /
        60 /
        60 /
        24,
    );

    const [allQuestions, allProblems, allQuizzes] = await Promise.all([
      this.questionRepo.find({ select: ['id', 'title', 'slug', 'category', 'difficulty', 'targetCompensation', 'shortAnswer'] }),
      this.problemRepo.find({ select: ['id', 'title', 'slug', 'category', 'difficulty', 'acceptanceRate'] }),
      this.quizRepo.find({ select: ['id', 'title', 'slug', 'category', 'difficulty', 'durationMinutes', 'totalQuestions'] }),
    ]);

    const questionOfTheDay =
      allQuestions.length > 0
        ? allQuestions[dayOfYear % allQuestions.length]
        : null;

    const codingProblemOfTheDay =
      allProblems.length > 0
        ? allProblems[dayOfYear % allProblems.length]
        : null;

    const dailyQuiz =
      allQuizzes.length > 0 ? allQuizzes[dayOfYear % allQuizzes.length] : null;

    return {
      date: today.toISOString().split('T')[0],
      dayOfYear,
      questionOfTheDay,
      codingProblemOfTheDay,
      dailyQuiz,
      motivationalQuote: this.getMotivationalQuote(dayOfYear),
    };
  }

  async recordActivity(
    userId: number,
    activity: {
      questionsDelta?: number;
      problemsDelta?: number;
      quizzesDelta?: number;
      minutesDelta?: number;
    },
  ) {
    const todayStr = new Date().toISOString().split('T')[0];

    let entry = await this.activityRepo.findOne({
      where: { userId, dateString: todayStr },
    });

    if (!entry) {
      entry = this.activityRepo.create({
        userId,
        dateString: todayStr,
        questionsCompleted: 0,
        codingProblemsSolved: 0,
        quizzesTaken: 0,
        minutesSpent: 0,
      });
    }

    if (activity.questionsDelta) {
      entry.questionsCompleted += activity.questionsDelta;
    }
    if (activity.problemsDelta) {
      entry.codingProblemsSolved += activity.problemsDelta;
    }
    if (activity.quizzesDelta) {
      entry.quizzesTaken += activity.quizzesDelta;
    }
    if (activity.minutesDelta) {
      entry.minutesSpent += activity.minutesDelta;
    }

    await this.activityRepo.save(entry);

    // Update streak on user
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (user && user.lastActiveDate !== todayStr) {
      user.dailyStreak = (user.dailyStreak || 0) + 1;
      user.lastActiveDate = todayStr;
      await this.userRepo.save(user);
    }

    return entry;
  }

  async getWeeklyReport(userId: number) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);

    const activities = await this.activityRepo
      .createQueryBuilder('a')
      .where('a.userId = :userId', { userId })
      .andWhere('a.dateString >= :startDate', {
        startDate: start.toISOString().split('T')[0],
      })
      .orderBy('a.dateString', 'ASC')
      .getMany();

    // Map 7 days
    const days: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const found = activities.find((a) => a.dateString === ds);

      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      days.push({
        date: ds,
        day: dayName,
        questionsCompleted: found ? found.questionsCompleted : 0,
        codingProblemsSolved: found ? found.codingProblemsSolved : 0,
        quizzesTaken: found ? found.quizzesTaken : 0,
        minutesSpent: found ? found.minutesSpent : 0,
      });
    }

    const totalQuestions = days.reduce((a, b) => a + b.questionsCompleted, 0);
    const totalProblems = days.reduce((a, b) => a + b.codingProblemsSolved, 0);
    const totalQuizzes = days.reduce((a, b) => a + b.quizzesTaken, 0);
    const totalMinutes = days.reduce((a, b) => a + b.minutesSpent, 0);

    return {
      days,
      summary: {
        totalQuestions,
        totalProblems,
        totalQuizzes,
        totalMinutes,
      },
    };
  }

  private getMotivationalQuote(seed: number): string {
    const quotes = [
      'Consistency is what transforms average into excellence. 30 minutes a day compounds into 40 LPA mastery.',
      'In technical interviews, knowing "how" gets you the offer, but knowing "why" gets you the top compensation band.',
      'Senior engineers do not write more code; they anticipate failure modes, design for resilience, and measure trade-offs.',
      'Small daily wins accumulate into massive career breakthroughs. Keep the streak alive!',
      'Great system designers treat latency numbers and network fallacies as first-class citizens.',
    ];
    return quotes[seed % quotes.length];
  }
}
