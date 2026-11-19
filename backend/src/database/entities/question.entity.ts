import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum DifficultyLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  SENIOR = 'Senior / Architect',
}

@Entity('questions')
@Index(['category', 'difficulty'])
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  category: string;

  @Column({ nullable: true })
  subcategory: string;

  @Column({
    type: 'varchar',
    default: DifficultyLevel.INTERMEDIATE,
  })
  difficulty: DifficultyLevel;

  @Column({ default: '3–5 Years' })
  experienceLevel: string;

  @Column({ default: '₹20–25 LPA' })
  targetCompensation: string;

  @Column({ type: 'text' })
  shortAnswer: string;

  @Column({ type: 'text' })
  detailedExplanation: string;

  @Column({ type: 'text' })
  realWorldExample: string;

  @Column({ type: 'text' })
  implementationExample: string;

  @Column({ type: 'text', nullable: true })
  codeSnippet: string;

  @Column({ nullable: true, default: 'javascript' })
  codeLanguage: string;

  @Column({ type: 'simple-json', nullable: true })
  commonMistakes: string[];

  @Column({ type: 'simple-json', nullable: true })
  followUpQuestions: string[];

  @Column({ type: 'simple-json', nullable: true })
  interviewTips: string[];

  @Column({ type: 'simple-json', nullable: true })
  tags: string[];

  @Column({ default: 0 })
  viewsCount: number;

  @Column({ default: true })
  isPublished: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
