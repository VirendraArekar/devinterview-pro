import { IsNotEmpty, IsNumber, IsObject } from 'class-validator';

export class SubmitQuizDto {
  @IsNotEmpty()
  @IsObject()
  userAnswers: Record<string, string[]>; // questionId -> array of selected option IDs

  @IsNotEmpty()
  @IsNumber()
  timeTakenSeconds: number;
}
