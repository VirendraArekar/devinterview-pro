import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../database/entities/user.entity';
import { CodeSubmission } from '../database/entities/code-submission.entity';
import { QuizAttempt } from '../database/entities/quiz-attempt.entity';
import { MockInterview } from '../database/entities/mock-interview.entity';
import { UserBookmark } from '../database/entities/user-bookmark.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      CodeSubmission,
      QuizAttempt,
      MockInterview,
      UserBookmark,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
