import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('quiz_attempts')
@Index(['userId', 'quizId'])
export class QuizAttempt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  quizId: number;

  @Column({ type: 'float' })
  score: number; // percentage

  @Column()
  totalQuestions: number;

  @Column()
  correctCount: number;

  @Column()
  wrongCount: number;

  @Column()
  timeTakenSeconds: number;

  @Column({ type: 'simple-json' })
  userAnswers: Record<string, string[]>; // questionId -> selected options

  @Column({ default: false })
  passed: boolean;

  @CreateDateColumn()
  completedAt: Date;
}
