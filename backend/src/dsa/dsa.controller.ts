import { Controller, Get, UseGuards } from '@nestjs/common';
import { DsaService } from './dsa.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('api/dsa')
export class DsaController {
  constructor(private readonly dsaService: DsaService) {}

  @Public()
  @Get('dashboard')
  async getDashboard(@CurrentUser('id') userId?: number) {
    return this.dsaService.getDashboard(userId);
  }
}
