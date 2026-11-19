import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizzesService } from './quizzes.service';
import { QuizzesController } from './quizzes.controller';
import { Quiz } from '../database/entities/quiz.entity';
import { QuizQuestion } from '../database/entities/quiz-question.entity';
import { QuizAttempt } from '../database/entities/quiz-attempt.entity';
import { User } from '../database/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Quiz, QuizQuestion, QuizAttempt, User]),
  ],
  controllers: [QuizzesController],
  providers: [QuizzesService],
  exports: [QuizzesService],
})
export class QuizzesModule {}
