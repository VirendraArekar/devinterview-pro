import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateMockInterviewDto {
  @IsNotEmpty()
  @IsString()
  roleCategory: string;

  @IsOptional()
  @IsString()
  experienceLevel?: string = '3–5 Years';

  @IsOptional()
  @IsString()
  difficulty?: string = 'Intermediate';

  @IsOptional()
  @IsNumber()
  durationMinutes?: number = 30;

  @IsOptional()
  @IsNumber()
  totalQuestions?: number = 5;
}

export class SubmitAnswerDto {
  @IsNotEmpty()
  @IsNumber()
  questionId: number;

  @IsNotEmpty()
  @IsString()
  userAnswer: string;
}

export class CompleteMockInterviewDto {
  @IsNotEmpty()
  answers: {
    questionId: number;
    userAnswer: string;
  }[];
}
