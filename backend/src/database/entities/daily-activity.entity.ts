import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('daily_activities')
@Index(['userId', 'dateString'], { unique: true })
export class DailyActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  dateString: string; // YYYY-MM-DD

  @Column({ default: 0 })
  questionsCompleted: number;

  @Column({ default: 0 })
  codingProblemsSolved: number;

  @Column({ default: 0 })
  quizzesTaken: number;

  @Column({ default: 0 })
  minutesSpent: number;

  @CreateDateColumn()
  createdAt: Date;
}
