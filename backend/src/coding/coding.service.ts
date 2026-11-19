import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CodingProblem,
  CodingDifficulty,
} from '../database/entities/coding-problem.entity';
import {
  CodeSubmission,
  SubmissionStatus,
} from '../database/entities/code-submission.entity';
import { ExecutionService } from '../execution/execution.service';
import { RunCodeDto, SubmitCodeDto } from './dto/code-run.dto';

@Injectable()
export class CodingService {
  constructor(
    @InjectRepository(CodingProblem)
    private problemRepo: Repository<CodingProblem>,
    @InjectRepository(CodeSubmission)
    private submissionRepo: Repository<CodeSubmission>,
    private executionService: ExecutionService,
  ) {}

  async findAll(params: {
    category?: string;
    difficulty?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { category, difficulty, search, page = 1, limit = 20 } = params;
    const query = this.problemRepo.createQueryBuilder('p');

    if (category && category !== 'All') {
      query.andWhere('LOWER(p.category) = LOWER(:category)', { category });
    }

    if (difficulty && difficulty !== 'All') {
      query.andWhere('p.difficulty = :difficulty', { difficulty });
    }

    if (search) {
      query.andWhere(
        '(LOWER(p.title) LIKE LOWER(:search) OR LOWER(p.problemStatement) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    query.select([
      'p.id',
      'p.title',
      'p.slug',
      'p.category',
      'p.difficulty',
      'p.expectedTimeComplexity',
      'p.expectedSpaceComplexity',
      'p.acceptanceRate',
      'p.totalSubmissions',
      'p.totalAccepted',
    ]);

    query.skip((page - 1) * limit).take(limit);

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
    const raw = await this.problemRepo
      .createQueryBuilder('p')
      .select('p.category', 'category')
      .addSelect('COUNT(p.id)', 'count')
      .groupBy('p.category')
      .getRawMany();

    return raw.map((r) => ({
      name: r.category,
      count: parseInt(r.count, 10),
    }));
  }

  async findOne(idOrSlug: string | number): Promise<CodingProblem> {
    const isNumeric = !isNaN(Number(idOrSlug));
    let problem: CodingProblem | null = null;

    if (isNumeric) {
      problem = await this.problemRepo.findOne({
        where: { id: Number(idOrSlug) },
      });
    } else {
      problem = await this.problemRepo.findOne({
        where: { slug: idOrSlug.toString() },
      });
    }

    if (!problem) {
      throw new NotFoundException(`Problem '${idOrSlug}' not found`);
    }

    return problem;
  }

  async runCode(problemId: number, dto: RunCodeDto) {
    const problem = await this.findOne(problemId);

    // If user supplied customInput, test against customInput
    let testCasesToRun = problem.sampleTestCases.map((tc) => ({
      input: tc.input,
      expectedOutput: tc.output,
    }));

    if (dto.customInput && dto.customInput.trim().length > 0) {
      testCasesToRun = [
        {
          input: dto.customInput,
          expectedOutput: '', // will display output without failing check
        },
      ];
    }

    const execResult = await this.executionService.runProblem(
      dto.language,
      dto.code,
      testCasesToRun,
    );

    return execResult;
  }

  async submitCode(userId: number, problemId: number, dto: SubmitCodeDto) {
    const problem = await this.findOne(problemId);

    // Run against both sample test cases and hidden test cases
    const allTestCases = [
      ...problem.sampleTestCases.map((tc) => ({
        input: tc.input,
        expectedOutput: tc.output,
      })),
      ...(problem.hiddenTestCases || []).map((tc) => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
      })),
    ];

    const execResult = await this.executionService.runProblem(
      dto.language,
      dto.code,
      allTestCases,
    );

    let status = SubmissionStatus.WRONG_ANSWER;
    if (execResult.status === 'Accepted') status = SubmissionStatus.ACCEPTED;
    else if (execResult.status === 'Time Limit Exceeded')
      status = SubmissionStatus.TIME_LIMIT_EXCEEDED;
    else if (execResult.status === 'Compilation Error')
      status = SubmissionStatus.COMPILATION_ERROR;
    else if (execResult.status === 'Runtime Error')
      status = SubmissionStatus.RUNTIME_ERROR;

    // Save submission
    const submission = this.submissionRepo.create({
      userId,
      problemId: problem.id,
      language: dto.language,
      code: dto.code,
      status,
      runtimeMs: execResult.runtimeMs,
      memoryKb: execResult.memoryKb,
      testCasesPassed: execResult.testCasesPassed,
      totalTestCases: execResult.totalTestCases,
      errorOutput: execResult.compilationOutput || execResult.runtimeOutput,
    });

    await this.submissionRepo.save(submission);

    // Update problem statistics
    problem.totalSubmissions = (problem.totalSubmissions || 0) + 1;
    if (status === SubmissionStatus.ACCEPTED) {
      problem.totalAccepted = (problem.totalAccepted || 0) + 1;
    }
    problem.acceptanceRate = Math.round(
      (problem.totalAccepted / problem.totalSubmissions) * 100,
    );
    await this.problemRepo.save(problem);

    return {
      submissionId: submission.id,
      ...execResult,
    };
  }

  async getUserSubmissions(userId: number, problemId?: number) {
    const query = this.submissionRepo
      .createQueryBuilder('s')
      .where('s.userId = :userId', { userId });

    if (problemId) {
      query.andWhere('s.problemId = :problemId', { problemId });
    }

    return query.orderBy('s.createdAt', 'DESC').take(50).getMany();
  }

  async bulkCreate(problems: Partial<CodingProblem>[]) {
    const entities = this.problemRepo.create(problems);
    return this.problemRepo.save(entities);
  }
}
