import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum CodingDifficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard',
}

@Entity('coding_problems')
@Index(['category', 'difficulty'])
export class CodingProblem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  category: string;

  @Column({
    type: 'varchar',
    default: CodingDifficulty.MEDIUM,
  })
  difficulty: CodingDifficulty;

  @Column({ type: 'text' })
  problemStatement: string;

  @Column({ type: 'text' })
  inputDescription: string;

  @Column({ type: 'text' })
  outputDescription: string;

  @Column({ type: 'simple-json', nullable: true })
  constraints: string[];

  @Column({ type: 'simple-json' })
  sampleTestCases: {
    input: string;
    output: string;
    explanation?: string;
  }[];

  @Column({ type: 'simple-json' })
  hiddenTestCases: {
    input: string;
    expectedOutput: string;
  }[];

  @Column({ type: 'simple-json' })
  starterCode: {
    java?: string;
    javascript?: string;
    typescript?: string;
    python?: string;
    cpp?: string;
    c?: string;
  };

  @Column({ default: 'O(N)' })
  expectedTimeComplexity: string;

  @Column({ default: 'O(1)' })
  expectedSpaceComplexity: string;

  @Column({ type: 'simple-json', nullable: true })
  hints: string[];

  @Column({ type: 'text', nullable: true })
  solutionExplanation: string;

  @Column({ type: 'simple-json', nullable: true })
  optimizedSolutions: {
    java?: string;
    javascript?: string;
    typescript?: string;
    python?: string;
    cpp?: string;
  };

  @Column({ type: 'simple-json', nullable: true })
  relatedQuestions: string[];

  @Column({ type: 'float', default: 65.5 })
  acceptanceRate: number;

  @Column({ default: 0 })
  totalSubmissions: number;

  @Column({ default: 0 })
  totalAccepted: number;

  @Column({ default: true })
  isPublished: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
