import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('mock_interview_answers')
@Index(['mockInterviewId', 'questionId'])
export class MockInterviewAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  mockInterviewId: number;

  @Column()
  questionId: number;

  @Column()
  questionTitle: string;

  @Column({ type: 'text' })
  userAnswer: string;

  @Column({ type: 'float', default: 0 })
  score: number; // 0 - 100

  @Column({ type: 'text', nullable: true })
  aiFeedback: string;

  @Column({ type: 'simple-json', nullable: true })
  strengths: string[];

  @Column({ type: 'simple-json', nullable: true })
  improvements: string[];

  @CreateDateColumn()
  createdAt: Date;
}
