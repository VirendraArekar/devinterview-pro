import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CodingService } from './coding.service';
import { CodingController } from './coding.controller';
import { CodingProblem } from '../database/entities/coding-problem.entity';
import { CodeSubmission } from '../database/entities/code-submission.entity';
import { ExecutionModule } from '../execution/execution.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CodingProblem, CodeSubmission]),
    ExecutionModule,
  ],
  controllers: [CodingController],
  providers: [CodingService],
  exports: [CodingService],
})
export class CodingModule {}
