import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { FilterQuestionsDto } from './dto/filter-questions.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/entities/user.entity';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('api/questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Public()
  @Get()
  async findAll(@Query() query: FilterQuestionsDto) {
    return this.questionsService.findAll(query);
  }

  @Public()
  @Get('categories')
  async getCategories() {
    return this.questionsService.getCategories();
  }

  @Public()
  @Get('recommended')
  async getRecommended(@Query('category') category?: string) {
    return this.questionsService.getRecommended(category);
  }

  @Public()
  @Get(':idOrSlug')
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.questionsService.findOne(idOrSlug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @Post()
  async create(@Body() body: any) {
    return this.questionsService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('import')
  async bulkImport(@Body('questions') questions: any[]) {
    const count = await this.questionsService.bulkCreate(questions);
    return { success: true, count, message: `Imported ${count} questions` };
  }
}
