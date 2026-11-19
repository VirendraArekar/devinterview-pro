import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MockInterviewsService } from './mock-interviews.service';
import { MockInterviewsController } from './mock-interviews.controller';
import { MockInterview } from '../database/entities/mock-interview.entity';
import { MockInterviewAnswer } from '../database/entities/mock-interview-answer.entity';
import { Question } from '../database/entities/question.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MockInterview, MockInterviewAnswer, Question]),
  ],
  controllers: [MockInterviewsController],
  providers: [MockInterviewsService],
  exports: [MockInterviewsService],
})
export class MockInterviewsModule {}
