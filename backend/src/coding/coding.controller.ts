import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CodingService } from './coding.service';
import { RunCodeDto, SubmitCodeDto } from './dto/code-run.dto';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/coding')
export class CodingController {
  constructor(private readonly codingService: CodingService) {}

  @Public()
  @Get('problems')
  async getProblems(
    @Query('category') category?: string,
    @Query('difficulty') difficulty?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.codingService.findAll({
      category,
      difficulty,
      search,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Public()
  @Get('categories')
  async getCategories() {
    return this.codingService.getCategories();
  }

  @Public()
  @Get('problems/:idOrSlug')
  async getProblem(@Param('idOrSlug') idOrSlug: string) {
    return this.codingService.findOne(idOrSlug);
  }

  @Public()
  @Post('problems/:id/run')
  async runCode(
    @Param('id') problemId: number,
    @Body() dto: RunCodeDto,
  ) {
    return this.codingService.runCode(Number(problemId), dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('problems/:id/submit')
  async submitCode(
    @Param('id') problemId: number,
    @CurrentUser('id') userId: number,
    @Body() dto: SubmitCodeDto,
  ) {
    return this.codingService.submitCode(userId, Number(problemId), dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('submissions/my')
  async getMySubmissions(
    @CurrentUser('id') userId: number,
    @Query('problemId') problemId?: number,
  ) {
    return this.codingService.getUserSubmissions(
      userId,
      problemId ? Number(problemId) : undefined,
    );
  }
}
