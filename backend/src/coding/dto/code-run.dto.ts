import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class RunCodeDto {
  @IsNotEmpty()
  @IsString()
  language: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsOptional()
  customInput?: string;
}

export class SubmitCodeDto {
  @IsNotEmpty()
  @IsString()
  language: string;

  @IsNotEmpty()
  @IsString()
  code: string;
}
