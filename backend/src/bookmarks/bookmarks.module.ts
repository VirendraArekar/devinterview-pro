import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookmarksService } from './bookmarks.service';
import { BookmarksController } from './bookmarks.controller';
import { UserBookmark } from '../database/entities/user-bookmark.entity';
import { UserNote } from '../database/entities/user-note.entity';
import { Question } from '../database/entities/question.entity';
import { CodingProblem } from '../database/entities/coding-problem.entity';
import { SystemDesignTopic } from '../database/entities/system-design-topic.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserBookmark,
      UserNote,
      Question,
      CodingProblem,
      SystemDesignTopic,
    ]),
  ],
  controllers: [BookmarksController],
  providers: [BookmarksService],
  exports: [BookmarksService],
})
export class BookmarksModule {}
