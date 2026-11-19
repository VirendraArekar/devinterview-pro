import { Controller, Get, Param, Query } from '@nestjs/common';
import { SystemDesignService } from './system-design.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('api/system-design')
export class SystemDesignController {
  constructor(private readonly systemDesignService: SystemDesignService) {}

  @Public()
  @Get()
  async findAll(@Query('type') type?: string) {
    return this.systemDesignService.findAll(type);
  }

  @Public()
  @Get(':idOrSlug')
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.systemDesignService.findOne(idOrSlug);
  }
}
