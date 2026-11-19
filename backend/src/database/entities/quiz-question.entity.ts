import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum QuizQuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  MULTIPLE_SELECT = 'multiple_select',
  TRUE_FALSE = 'true_false',
  OUTPUT_PREDICTION = 'output_prediction',
  FIND_THE_BUG = 'find_the_bug',
  SQL_QUERY = 'sql_query',
}

@Entity('quiz_questions')
@Index(['quizId'])
export class QuizQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quizId: number;

  @Column({ type: 'text' })
  questionText: string;

  @Column({
    type: 'varchar',
    default: QuizQuestionType.MULTIPLE_CHOICE,
  })
  type: QuizQuestionType;

  @Column({ type: 'text', nullable: true })
  codeSnippet: string;

  @Column({ nullable: true })
  codeLanguage: string;

  @Column({ type: 'simple-json' })
  options: {
    id: string; // e.g. 'A', 'B', 'C', 'D'
    text: string;
  }[];

  @Column({ type: 'simple-json' })
  correctAnswers: string[]; // array of ids like ['A'] or ['A', 'C']

  @Column({ type: 'text' })
  explanation: string;

  @Column({ default: 1 })
  points: number;

  @CreateDateColumn()
  createdAt: Date;
}
