import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../database/entities/question.entity';
import { FilterQuestionsDto } from './dto/filter-questions.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}

  async findAll(filters: FilterQuestionsDto) {
    const {
      category,
      difficulty,
      experienceLevel,
      targetCompensation,
      search,
      page = 1,
      limit = 15,
    } = filters;

    const query = this.questionRepository.createQueryBuilder('q');

    if (category && category !== 'All') {
      query.andWhere('LOWER(q.category) = LOWER(:category)', { category });
    }

    if (difficulty && difficulty !== 'All') {
      query.andWhere('LOWER(q.difficulty) = LOWER(:difficulty)', { difficulty });
    }

    if (experienceLevel && experienceLevel !== 'All') {
      query.andWhere('q.experienceLevel = :experienceLevel', { experienceLevel });
    }

    if (targetCompensation && targetCompensation !== 'All') {
      query.andWhere('q.targetCompensation = :targetCompensation', {
        targetCompensation,
      });
    }

    if (search) {
      query.andWhere(
        '(LOWER(q.title) LIKE LOWER(:search) OR LOWER(q.shortAnswer) LIKE LOWER(:search) OR LOWER(q.detailedExplanation) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    query.orderBy('q.id', 'ASC');
    query.skip((page - 1) * limit);
    query.take(limit);

    const [items, total] = await query.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getCategories() {
    const rawCategories = await this.questionRepository
      .createQueryBuilder('q')
      .select('q.category', 'category')
      .addSelect('COUNT(q.id)', 'count')
      .groupBy('q.category')
      .getRawMany();

    return rawCategories.map((c) => ({
      name: c.category,
      count: parseInt(c.count, 10),
    }));
  }

  async findOne(idOrSlug: string | number): Promise<Question> {
    const isNumeric = !isNaN(Number(idOrSlug));
    let question: Question | null = null;

    if (isNumeric) {
      question = await this.questionRepository.findOne({
        where: { id: Number(idOrSlug) },
      });
    } else {
      question = await this.questionRepository.findOne({
        where: { slug: idOrSlug.toString() },
      });
    }

    if (!question) {
      throw new NotFoundException(`Question '${idOrSlug}' not found`);
    }

    // Increment views counter
    await this.questionRepository.increment({ id: question.id }, 'viewsCount', 1);

    return question;
  }

  async getRecommended(category?: string, limit = 5): Promise<Question[]> {
    const query = this.questionRepository.createQueryBuilder('q');
    if (category) {
      query.where('q.category = :category', { category });
    }
    return query.orderBy('q.viewsCount', 'DESC').take(limit).getMany();
  }

  async create(data: Partial<Question>): Promise<Question> {
    const question = this.questionRepository.create(data);
    return this.questionRepository.save(question);
  }

  async bulkCreate(dataList: Partial<Question>[]): Promise<number> {
    const entities = this.questionRepository.create(dataList);
    await this.questionRepository.save(entities);
    return entities.length;
  }
}
