import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum SubmissionStatus {
  ACCEPTED = 'Accepted',
  WRONG_ANSWER = 'Wrong Answer',
  TIME_LIMIT_EXCEEDED = 'Time Limit Exceeded',
  MEMORY_LIMIT_EXCEEDED = 'Memory Limit Exceeded',
  RUNTIME_ERROR = 'Runtime Error',
  COMPILATION_ERROR = 'Compilation Error',
}

@Entity('code_submissions')
@Index(['userId', 'problemId'])
export class CodeSubmission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  problemId: number;

  @Column()
  language: string;

  @Column({ type: 'text' })
  code: string;

  @Column({
    type: 'varchar',
    default: SubmissionStatus.ACCEPTED,
  })
  status: SubmissionStatus;

  @Column({ default: 0 })
  runtimeMs: number;

  @Column({ default: 0 })
  memoryKb: number;

  @Column({ default: 0 })
  testCasesPassed: number;

  @Column({ default: 0 })
  totalTestCases: number;

  @Column({ type: 'text', nullable: true })
  errorOutput: string;

  @CreateDateColumn()
  createdAt: Date;
}
