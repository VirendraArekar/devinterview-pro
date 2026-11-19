import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Question } from '../database/entities/question.entity';
import { CodingProblem } from '../database/entities/coding-problem.entity';
import { CodeSubmission } from '../database/entities/code-submission.entity';
import { QuizAttempt } from '../database/entities/quiz-attempt.entity';
import { MockInterview } from '../database/entities/mock-interview.entity';
import { User } from '../database/entities/user.entity';
import { DailyActivity } from '../database/entities/daily-activity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Question,
      CodingProblem,
      CodeSubmission,
      QuizAttempt,
      MockInterview,
      User,
      DailyActivity,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
