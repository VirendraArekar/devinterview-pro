import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { MockInterviewsService } from './mock-interviews.service';
import {
  CreateMockInterviewDto,
  CompleteMockInterviewDto,
} from './dto/mock-interview.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/mock-interviews')
@UseGuards(JwtAuthGuard)
export class MockInterviewsController {
  constructor(private readonly mockService: MockInterviewsService) {}

  @Post('create')
  async create(
    @CurrentUser('id') userId: number,
    @Body() dto: CreateMockInterviewDto,
  ) {
    return this.mockService.createInterview(userId, dto);
  }

  @Get('history')
  async getHistory(@CurrentUser('id') userId: number) {
    return this.mockService.getUserHistory(userId);
  }

  @Get(':id')
  async getInterview(
    @Param('id') id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.mockService.getInterview(Number(id), userId);
  }

  @Post(':id/complete')
  async complete(
    @Param('id') id: number,
    @CurrentUser('id') userId: number,
    @Body() dto: CompleteMockInterviewDto,
  ) {
    return this.mockService.completeInterview(Number(id), userId, dto);
  }
}
