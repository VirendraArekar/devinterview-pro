import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { DailyService } from './daily.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/daily')
export class DailyController {
  constructor(private readonly dailyService: DailyService) {}

  @Public()
  @Get('highlights')
  async getDailyHighlights() {
    return this.dailyService.getDailyHighlights();
  }

  @UseGuards(JwtAuthGuard)
  @Get('weekly-report')
  async getWeeklyReport(@CurrentUser('id') userId: number) {
    return this.dailyService.getWeeklyReport(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('activity')
  async recordActivity(
    @CurrentUser('id') userId: number,
    @Body() body: any,
  ) {
    return this.dailyService.recordActivity(userId, body);
  }
}
