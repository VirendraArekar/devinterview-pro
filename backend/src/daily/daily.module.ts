import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyService } from './daily.service';
import { DailyController } from './daily.controller';
import { Question } from '../database/entities/question.entity';
import { CodingProblem } from '../database/entities/coding-problem.entity';
import { Quiz } from '../database/entities/quiz.entity';
import { DailyActivity } from '../database/entities/daily-activity.entity';
import { User } from '../database/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Question,
      CodingProblem,
      Quiz,
      DailyActivity,
      User,
    ]),
  ],
  controllers: [DailyController],
  providers: [DailyService],
  exports: [DailyService],
})
export class DailyModule {}
