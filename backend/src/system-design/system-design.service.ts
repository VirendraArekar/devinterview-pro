import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SystemDesignTopic,
  SystemDesignType,
} from '../database/entities/system-design-topic.entity';

@Injectable()
export class SystemDesignService {
  constructor(
    @InjectRepository(SystemDesignTopic)
    private topicRepo: Repository<SystemDesignTopic>,
  ) {}

  async findAll(type?: string) {
    const query = this.topicRepo.createQueryBuilder('t');
    if (type && type !== 'All') {
      query.andWhere('t.type = :type', { type });
    }
    return query
      .select([
        't.id',
        't.title',
        't.slug',
        't.type',
        't.summary',
        't.difficulty',
        't.experienceLevel',
      ])
      .orderBy('t.id', 'ASC')
      .getMany();
  }

  async findOne(idOrSlug: string | number): Promise<SystemDesignTopic> {
    const isNumeric = !isNaN(Number(idOrSlug));
    let topic: SystemDesignTopic | null = null;

    if (isNumeric) {
      topic = await this.topicRepo.findOne({
        where: { id: Number(idOrSlug) },
      });
    } else {
      topic = await this.topicRepo.findOne({
        where: { slug: idOrSlug.toString() },
      });
    }

    if (!topic) {
      throw new NotFoundException(`System Design topic '${idOrSlug}' not found`);
    }

    return topic;
  }

  async bulkCreate(topics: Partial<SystemDesignTopic>[]) {
    const entities = this.topicRepo.create(topics);
    return this.topicRepo.save(entities);
  }
}
