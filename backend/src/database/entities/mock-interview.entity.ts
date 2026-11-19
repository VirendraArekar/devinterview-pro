import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum MockInterviewStatus {
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  ABANDONED = 'Abandoned',
}

@Entity('mock_interviews')
export class MockInterview {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  title: string;

  @Column()
  roleCategory: string; // e.g. 'Java Developer', 'React Developer', 'Full Stack'

  @Column({ default: '3–5 Years' })
  experienceLevel: string;

  @Column({ default: 'Intermediate' })
  difficulty: string;

  @Column({ default: 30 })
  durationMinutes: number;

  @Column({ default: 5 })
  totalQuestions: number;

  @Column({
    type: 'varchar',
    default: MockInterviewStatus.IN_PROGRESS,
  })
  status: MockInterviewStatus;

  @Column({ type: 'float', nullable: true })
  score: number;

  @Column({ type: 'text', nullable: true })
  feedbackSummary: string;

  @Column({ type: 'simple-json', nullable: true })
  weakTopics: string[];

  @Column({ type: 'simple-json', nullable: true })
  strongTopics: string[];

  @Column({ type: 'simple-json' })
  questionIds: number[];

  @CreateDateColumn()
  startedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
