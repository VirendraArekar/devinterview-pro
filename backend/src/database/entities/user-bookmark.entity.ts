import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum BookmarkType {
  QUESTION = 'QUESTION',
  CODING_PROBLEM = 'CODING_PROBLEM',
  SYSTEM_DESIGN = 'SYSTEM_DESIGN',
}

@Entity('user_bookmarks')
@Index(['userId', 'itemType', 'itemId'], { unique: true })
export class UserBookmark {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({
    type: 'varchar',
    default: BookmarkType.QUESTION,
  })
  itemType: BookmarkType;

  @Column()
  itemId: number;

  @CreateDateColumn()
  createdAt: Date;
}
