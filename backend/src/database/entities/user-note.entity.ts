import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('user_notes')
@Index(['userId', 'itemType', 'itemId'])
export class UserNote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  itemType: string; // 'QUESTION' | 'CODING_PROBLEM' | 'SYSTEM_DESIGN' | 'GENERAL'

  @Column({ nullable: true })
  itemId: number;

  @Column({ default: 'Personal Note' })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
