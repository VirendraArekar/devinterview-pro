import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  MockInterview,
  MockInterviewStatus,
} from '../database/entities/mock-interview.entity';
import { MockInterviewAnswer } from '../database/entities/mock-interview-answer.entity';
import { Question } from '../database/entities/question.entity';
import {
  CreateMockInterviewDto,
  CompleteMockInterviewDto,
} from './dto/mock-interview.dto';

@Injectable()
export class MockInterviewsService {
  constructor(
    @InjectRepository(MockInterview)
    private mockRepo: Repository<MockInterview>,
    @InjectRepository(MockInterviewAnswer)
    private answerRepo: Repository<MockInterviewAnswer>,
    @InjectRepository(Question)
    private questionRepo: Repository<Question>,
  ) {}

  async createInterview(userId: number, dto: CreateMockInterviewDto) {
    // Map role category to search filter
    const categoryKeywords = this.getKeywordsForRole(dto.roleCategory);

    // Pick questions matching keywords
    let questions = await this.questionRepo
      .createQueryBuilder('q')
      .where('q.category IN (:...cats)', { cats: categoryKeywords })
      .orderBy('RANDOM()')
      .take(dto.totalQuestions || 5)
      .getMany();

    // Fallback if not enough matching category questions
    if (questions.length < (dto.totalQuestions || 5)) {
      const fallback = await this.questionRepo
        .createQueryBuilder('q')
        .orderBy('RANDOM()')
        .take((dto.totalQuestions || 5) - questions.length)
        .getMany();
      questions = [...questions, ...fallback];
    }

    const questionIds = questions.map((q) => q.id);

    const interview = this.mockRepo.create({
      userId,
      title: `${dto.roleCategory} Mock Interview`,
      roleCategory: dto.roleCategory,
      experienceLevel: dto.experienceLevel || '3–5 Years',
      difficulty: dto.difficulty || 'Intermediate',
      durationMinutes: dto.durationMinutes || 30,
      totalQuestions: questionIds.length,
      status: MockInterviewStatus.IN_PROGRESS,
      questionIds,
    });

    const saved = await this.mockRepo.save(interview);

    return {
      interview: saved,
      questions: questions.map((q) => ({
        id: q.id,
        title: q.title,
        category: q.category,
        difficulty: q.difficulty,
        experienceLevel: q.experienceLevel,
      })),
    };
  }

  async getInterview(id: number, userId: number) {
    const interview = await this.mockRepo.findOne({ where: { id, userId } });
    if (!interview) {
      throw new NotFoundException('Mock interview not found');
    }

    const questions = await this.questionRepo.findBy({
      id: In(interview.questionIds),
    });

    const answers = await this.answerRepo.find({
      where: { mockInterviewId: id },
    });

    return {
      interview,
      questions,
      answers,
    };
  }

  async completeInterview(
    id: number,
    userId: number,
    dto: CompleteMockInterviewDto,
  ) {
    const interview = await this.mockRepo.findOne({ where: { id, userId } });
    if (!interview) {
      throw new NotFoundException('Mock interview not found');
    }

    const questions = await this.questionRepo.findBy({
      id: In(interview.questionIds),
    });

    const evaluatedAnswers: MockInterviewAnswer[] = [];
    let totalScore = 0;
    const weakTopicsSet = new Set<string>();
    const strongTopicsSet = new Set<string>();

    for (const ans of dto.answers) {
      const question = questions.find((q) => q.id === ans.questionId);
      if (!question) continue;

      const evalResult = this.evaluateAnswer(question, ans.userAnswer);
      totalScore += evalResult.score;

      if (evalResult.score >= 75) {
        strongTopicsSet.add(question.category);
      } else {
        weakTopicsSet.add(question.category);
      }

      const answerEntity = this.answerRepo.create({
        mockInterviewId: id,
        questionId: question.id,
        questionTitle: question.title,
        userAnswer: ans.userAnswer,
        score: evalResult.score,
        aiFeedback: evalResult.feedback,
        strengths: evalResult.strengths,
        improvements: evalResult.improvements,
      });

      evaluatedAnswers.push(await this.answerRepo.save(answerEntity));
    }

    const count = dto.answers.length || 1;
    const averageScore = Math.round(totalScore / count);

    // Update interview record
    interview.status = MockInterviewStatus.COMPLETED;
    interview.score = averageScore;
    interview.completedAt = new Date();
    interview.weakTopics = Array.from(weakTopicsSet);
    interview.strongTopics = Array.from(strongTopicsSet);
    interview.feedbackSummary = this.generateSummaryFeedback(
      averageScore,
      interview.roleCategory,
      interview.strongTopics,
      interview.weakTopics,
    );

    const updatedInterview = await this.mockRepo.save(interview);

    return {
      interview: updatedInterview,
      answers: evaluatedAnswers,
      questions,
    };
  }

  async getUserHistory(userId: number) {
    return this.mockRepo.find({
      where: { userId },
      order: { startedAt: 'DESC' },
    });
  }

  private evaluateAnswer(
    question: Question,
    userAnswer: string,
  ): {
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  } {
    const cleanAnswer = (userAnswer || '').trim();
    if (cleanAnswer.length < 15) {
      return {
        score: 20,
        feedback:
          'The response was too brief or incomplete. In an interview, substantiate your answers with architectural reasoning and practical examples.',
        strengths: ['Attempted to provide an answer.'],
        improvements: [
          'Elaborate on core technical principles.',
          'Provide a concrete code snippet or real-world example.',
          'Address performance trade-offs.',
        ],
      };
    }

    // Keyword & concept density analysis
    const keywords = [
      ...question.title.toLowerCase().split(/\s+/),
      ...(question.tags || []).map((t) => t.toLowerCase()),
      question.category.toLowerCase(),
    ].filter((w) => w.length > 3);

    const userText = cleanAnswer.toLowerCase();
    let matchedKeywords = 0;
    for (const kw of keywords) {
      if (userText.includes(kw)) matchedKeywords++;
    }

    const keywordRatio = keywords.length > 0 ? matchedKeywords / keywords.length : 0.5;

    // Length and depth score (sweet spot is 100-350 words)
    const wordCount = cleanAnswer.split(/\s+/).length;
    let lengthScore = 30;
    if (wordCount >= 40 && wordCount <= 250) lengthScore = 40;
    else if (wordCount > 250) lengthScore = 35;
    else lengthScore = 20;

    // Structure score (mentions examples, trade-offs, or production scenarios)
    let structureBonus = 0;
    if (/example|production|trade-off|scalability|performance|concurrency/i.test(userText)) {
      structureBonus += 15;
    }
    if (/because|therefore|in order to|prevents|solves/i.test(userText)) {
      structureBonus += 15;
    }

    const baseScore = Math.min(
      95,
      Math.max(35, Math.round(keywordRatio * 35 + lengthScore + structureBonus)),
    );

    const strengths: string[] = [];
    const improvements: string[] = [];

    if (keywordRatio > 0.4) {
      strengths.push('Good use of standard domain terminology and foundational concepts.');
    } else {
      improvements.push(`Incorporate more exact technical keywords relevant to ${question.category}.`);
    }

    if (structureBonus > 0) {
      strengths.push('Highlighted real-world trade-offs and structural implications effectively.');
    } else {
      improvements.push('Reference a production use-case or architectural trade-off to demonstrate senior depth.');
    }

    if (wordCount >= 60) {
      strengths.push('Provided a comprehensive, well-articulated explanation.');
    } else {
      improvements.push('Deepen the explanation with concrete mechanics and failure scenarios.');
    }

    return {
      score: baseScore,
      feedback: `You demonstrated a ${
        baseScore >= 75 ? 'strong' : 'moderate'
      } understanding of ${question.title}. To reach senior-level distinction (₹25–40 LPA standard), emphasize internal mechanics and failure modes.`,
      strengths,
      improvements,
    };
  }

  private generateSummaryFeedback(
    score: number,
    role: string,
    strong: string[],
    weak: string[],
  ): string {
    if (score >= 80) {
      return `Outstanding performance for a ${role} interview! You exhibited deep architectural comprehension and clear technical communication. Prioritize continuous refinement in: ${
        weak.length > 0 ? weak.join(', ') : 'system edge cases'
      }.`;
    } else if (score >= 60) {
      return `Solid foundational knowledge for ${role}. Your conceptual grasp is clear, but answers need deeper dive into memory, concurrency, and real-world failure patterns. Focus revision on: ${
        weak.length > 0 ? weak.join(', ') : 'advanced trade-offs'
      }.`;
    } else {
      return `Good start! For ${role} interviews at competitive packages (₹20–35 LPA), focus on articulating internal mechanics, coding idioms, and reviewing our curated question explanations.`;
    }
  }

  private getKeywordsForRole(role: string): string[] {
    const r = role.toLowerCase();
    if (r.includes('java') || r.includes('spring')) {
      return ['Java', 'Spring Boot', 'Spring Framework', 'Hibernate', 'Microservices', 'MySQL'];
    }
    if (r.includes('react') || r.includes('frontend')) {
      return ['React.js', 'Next.js', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'Redux Toolkit'];
    }
    if (r.includes('node') || r.includes('nest')) {
      return ['Node.js', 'NestJS', 'TypeScript', 'REST APIs', 'PostgreSQL', 'Redis'];
    }
    if (r.includes('system') || r.includes('architect')) {
      return ['Apache Kafka', 'Event-Driven Architecture', 'Distributed Systems', 'Redis', 'Microservices'];
    }
    if (r.includes('devops') || r.includes('cloud')) {
      return ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'GitHub Actions'];
    }
    return ['Java', 'React.js', 'Node.js', 'MySQL', 'Docker', 'Apache Kafka'];
  }
}
