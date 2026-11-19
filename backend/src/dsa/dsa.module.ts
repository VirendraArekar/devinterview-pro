import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DsaService } from './dsa.service';
import { DsaController } from './dsa.controller';
import { CodingProblem } from '../database/entities/coding-problem.entity';
import { CodeSubmission } from '../database/entities/code-submission.entity';
import { UserBookmark } from '../database/entities/user-bookmark.entity';
import { UserNote } from '../database/entities/user-note.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CodingProblem,
      CodeSubmission,
      UserBookmark,
      UserNote,
    ]),
  ],
  controllers: [DsaController],
  providers: [DsaService],
  exports: [DsaService],
})
export class DsaModule {}
