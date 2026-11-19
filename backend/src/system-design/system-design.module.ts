import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemDesignService } from './system-design.service';
import { SystemDesignController } from './system-design.controller';
import { SystemDesignTopic } from '../database/entities/system-design-topic.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SystemDesignTopic])],
  controllers: [SystemDesignController],
  providers: [SystemDesignService],
  exports: [SystemDesignService],
})
export class SystemDesignModule {}
