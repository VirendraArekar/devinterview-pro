import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  UserBookmark,
  BookmarkType,
} from '../database/entities/user-bookmark.entity';
import { UserNote } from '../database/entities/user-note.entity';
import { Question } from '../database/entities/question.entity';
import { CodingProblem } from '../database/entities/coding-problem.entity';
import { SystemDesignTopic } from '../database/entities/system-design-topic.entity';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectRepository(UserBookmark)
    private bookmarkRepo: Repository<UserBookmark>,
    @InjectRepository(UserNote)
    private noteRepo: Repository<UserNote>,
    @InjectRepository(Question)
    private questionRepo: Repository<Question>,
    @InjectRepository(CodingProblem)
    private problemRepo: Repository<CodingProblem>,
    @InjectRepository(SystemDesignTopic)
    private topicRepo: Repository<SystemDesignTopic>,
  ) {}

  async toggleBookmark(
    userId: number,
    itemType: BookmarkType,
    itemId: number,
  ) {
    const existing = await this.bookmarkRepo.findOne({
      where: { userId, itemType, itemId },
    });

    if (existing) {
      await this.bookmarkRepo.delete(existing.id);
      return { bookmarked: false, message: 'Bookmark removed' };
    }

    const created = this.bookmarkRepo.create({ userId, itemType, itemId });
    await this.bookmarkRepo.save(created);
    return { bookmarked: true, message: 'Bookmarked successfully' };
  }

  async getBookmarks(userId: number, itemType?: BookmarkType) {
    const query = this.bookmarkRepo.createQueryBuilder('b').where('b.userId = :userId', { userId });
    if (itemType) {
      query.andWhere('b.itemType = :itemType', { itemType });
    }
    const bookmarks = await query.orderBy('b.createdAt', 'DESC').getMany();

    const questionIds = bookmarks
      .filter((b) => b.itemType === BookmarkType.QUESTION)
      .map((b) => b.itemId);
    const problemIds = bookmarks
      .filter((b) => b.itemType === BookmarkType.CODING_PROBLEM)
      .map((b) => b.itemId);
    const designIds = bookmarks
      .filter((b) => b.itemType === BookmarkType.SYSTEM_DESIGN)
      .map((b) => b.itemId);

    const [questions, problems, designs] = await Promise.all([
      questionIds.length > 0 ? this.questionRepo.findBy({ id: In(questionIds) }) : [],
      problemIds.length > 0 ? this.problemRepo.findBy({ id: In(problemIds) }) : [],
      designIds.length > 0 ? this.topicRepo.findBy({ id: In(designIds) }) : [],
    ]);

    return bookmarks.map((b) => {
      let details: any = null;
      if (b.itemType === BookmarkType.QUESTION) {
        details = questions.find((q) => q.id === b.itemId);
      } else if (b.itemType === BookmarkType.CODING_PROBLEM) {
        details = problems.find((p) => p.id === b.itemId);
      } else if (b.itemType === BookmarkType.SYSTEM_DESIGN) {
        details = designs.find((d) => d.id === b.itemId);
      }

      return {
        ...b,
        details,
      };
    });
  }

  async getNotes(userId: number, itemType?: string, itemId?: number) {
    const query = this.noteRepo.createQueryBuilder('n').where('n.userId = :userId', { userId });
    if (itemType) query.andWhere('n.itemType = :itemType', { itemType });
    if (itemId) query.andWhere('n.itemId = :itemId', { itemId });
    return query.orderBy('n.updatedAt', 'DESC').getMany();
  }

  async saveNote(
    userId: number,
    data: { itemType: string; itemId?: number; title?: string; content: string },
  ) {
    let note: UserNote | null = null;
    if (data.itemId) {
      note = await this.noteRepo.findOne({
        where: { userId, itemType: data.itemType, itemId: data.itemId },
      });
    }

    if (note) {
      note.content = data.content;
      if (data.title) note.title = data.title;
      return this.noteRepo.save(note);
    }

    const newNote = this.noteRepo.create({
      userId,
      itemType: data.itemType,
      itemId: data.itemId,
      title: data.title || 'Personal Revision Note',
      content: data.content,
    });
    return this.noteRepo.save(newNote);
  }

  async deleteNote(id: number, userId: number) {
    await this.noteRepo.delete({ id, userId });
    return { success: true, message: 'Note deleted' };
  }
}
