import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  category: string;

  @Column({ default: 'Intermediate' })
  difficulty: string;

  @Column({ default: 15 })
  durationMinutes: number;

  @Column({ default: 10 })
  totalQuestions: number;

  @Column({ default: 70 })
  passingScore: number; // percentage

  @Column({ type: 'float', default: 0.25 })
  negativeMarkingRatio: number; // e.g. 0.25 deducts 25% for wrong answer

  @Column({ default: true })
  isPublished: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
