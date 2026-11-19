import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CodeSubmission } from '../database/entities/code-submission.entity';
import { QuizAttempt } from '../database/entities/quiz-attempt.entity';
import { MockInterview } from '../database/entities/mock-interview.entity';
import { UserBookmark } from '../database/entities/user-bookmark.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(CodeSubmission)
    private submissionRepo: Repository<CodeSubmission>,
    @InjectRepository(QuizAttempt)
    private quizAttemptRepo: Repository<QuizAttempt>,
    @InjectRepository(MockInterview)
    private mockRepo: Repository<MockInterview>,
    @InjectRepository(UserBookmark)
    private bookmarkRepo: Repository<UserBookmark>,
  ) {}

  async getProfile(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<User> {
    await this.userRepository.update(userId, dto);
    return this.getProfile(userId);
  }

  async getUserStats(userId: number) {
    const [
      user,
      totalSubmissions,
      acceptedSubmissions,
      quizAttempts,
      mockInterviews,
      bookmarksCount,
    ] = await Promise.all([
      this.getProfile(userId),
      this.submissionRepo.count({ where: { userId } }),
      this.submissionRepo.count({
        where: { userId, status: 'Accepted' as any },
      }),
      this.quizAttemptRepo.find({ where: { userId } }),
      this.mockRepo.find({ where: { userId } }),
      this.bookmarkRepo.count({ where: { userId } }),
    ]);

    const averageQuizScore =
      quizAttempts.length > 0
        ? Math.round(
            quizAttempts.reduce((acc, curr) => acc + curr.score, 0) /
              quizAttempts.length,
          )
        : 0;

    const completedMocks = mockInterviews.filter((m) => m.status === 'Completed');
    const averageMockScore =
      completedMocks.length > 0
        ? Math.round(
            completedMocks.reduce((acc, curr) => acc + (curr.score || 0), 0) /
              completedMocks.length,
          )
        : 0;

    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      experienceLevel: user.experienceLevel,
      targetCompensation: user.targetCompensation,
      dailyStreak: user.dailyStreak || 1,
      codingStats: {
        totalSubmissions,
        acceptedSubmissions,
        acceptanceRate:
          totalSubmissions > 0
            ? Math.round((acceptedSubmissions / totalSubmissions) * 100)
            : 0,
      },
      quizStats: {
        totalAttempts: quizAttempts.length,
        averageScore: averageQuizScore,
      },
      mockStats: {
        totalCompleted: completedMocks.length,
        averageScore: averageMockScore,
      },
      bookmarksCount,
    };
  }
}
