import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Public()
  @Get()
  async findAll(@Query('category') category?: string) {
    return this.quizzesService.findAll(category);
  }

  @Public()
  @Get('leaderboard')
  async getLeaderboard(@Query('quizId') quizId?: number) {
    return this.quizzesService.getLeaderboard(
      quizId ? Number(quizId) : undefined,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getUserHistory(@CurrentUser('id') userId: number) {
    return this.quizzesService.getUserHistory(userId);
  }

  @Public()
  @Get(':idOrSlug')
  async findOne(
    @Param('idOrSlug') idOrSlug: string,
    @Query('includeAnswers') includeAnswers?: string,
  ) {
    return this.quizzesService.findOne(idOrSlug, includeAnswers === 'true');
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/submit')
  async submitQuiz(
    @Param('id') quizId: number,
    @CurrentUser('id') userId: number,
    @Body() dto: SubmitQuizDto,
  ) {
    return this.quizzesService.submitQuiz(Number(quizId), userId, dto);
  }
}
