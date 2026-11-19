import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CodingProblem } from '../database/entities/coding-problem.entity';
import { CodeSubmission } from '../database/entities/code-submission.entity';
import { UserBookmark } from '../database/entities/user-bookmark.entity';
import { UserNote } from '../database/entities/user-note.entity';

@Injectable()
export class DsaService {
  constructor(
    @InjectRepository(CodingProblem)
    private problemRepo: Repository<CodingProblem>,
    @InjectRepository(CodeSubmission)
    private submissionRepo: Repository<CodeSubmission>,
    @InjectRepository(UserBookmark)
    private bookmarkRepo: Repository<UserBookmark>,
    @InjectRepository(UserNote)
    private noteRepo: Repository<UserNote>,
  ) {}

  async getDashboard(userId?: number) {
    const allProblems = await this.problemRepo.find({
      select: ['id', 'title', 'slug', 'category', 'difficulty', 'acceptanceRate'],
    });

    let solvedProblemIds = new Set<number>();
    let attemptedProblemIds = new Set<number>();
    let userBookmarks: number[] = [];

    if (userId) {
      const submissions = await this.submissionRepo.find({
        where: { userId },
        select: ['problemId', 'status'],
      });

      submissions.forEach((s) => {
        attemptedProblemIds.add(s.problemId);
        if (s.status === 'Accepted') {
          solvedProblemIds.add(s.problemId);
        }
      });

      const bookmarks = await this.bookmarkRepo.find({
        where: { userId, itemType: 'CODING_PROBLEM' as any },
        select: ['itemId'],
      });
      userBookmarks = bookmarks.map((b) => b.itemId);
    }

    // Difficulty breakdown
    const easyTotal = allProblems.filter((p) => p.difficulty === 'Easy').length;
    const mediumTotal = allProblems.filter((p) => p.difficulty === 'Medium').length;
    const hardTotal = allProblems.filter((p) => p.difficulty === 'Hard').length;

    const easySolved = allProblems.filter(
      (p) => p.difficulty === 'Easy' && solvedProblemIds.has(p.id),
    ).length;
    const mediumSolved = allProblems.filter(
      (p) => p.difficulty === 'Medium' && solvedProblemIds.has(p.id),
    ).length;
    const hardSolved = allProblems.filter(
      (p) => p.difficulty === 'Hard' && solvedProblemIds.has(p.id),
    ).length;

    // Topic-wise progress
    const categoryMap = new Map<string, { total: number; solved: number }>();
    allProblems.forEach((p) => {
      const cur = categoryMap.get(p.category) || { total: 0, solved: 0 };
      cur.total++;
      if (solvedProblemIds.has(p.id)) cur.solved++;
      categoryMap.set(p.category, cur);
    });

    const topicProgress = Array.from(categoryMap.entries()).map(
      ([category, stats]) => ({
        category,
        total: stats.total,
        solved: stats.solved,
        percentage: Math.round((stats.solved / (stats.total || 1)) * 100),
      }),
    );

    return {
      summary: {
        totalProblems: allProblems.length,
        solvedProblems: solvedProblemIds.size,
        attemptedProblems: attemptedProblemIds.size,
        unsolvedProblems: allProblems.length - solvedProblemIds.size,
      },
      difficulty: {
        easy: { total: easyTotal, solved: easySolved },
        medium: { total: mediumTotal, solved: mediumSolved },
        hard: { total: hardTotal, solved: hardSolved },
      },
      topicProgress,
      userBookmarks,
      roadmap: this.getCuratedRoadmap(allProblems, solvedProblemIds),
    };
  }

  private getCuratedRoadmap(
    allProblems: CodingProblem[],
    solvedSet: Set<number>,
  ) {
    const stages = [
      {
        id: 'stage-1',
        title: 'Stage 1: Algorithmic Foundations & Pointers',
        description: 'Two Pointers, Sliding Window, Prefix Sum, and String Manipulation fundamentals.',
        categories: ['Arrays', 'Strings', 'Two Pointers', 'Sliding Window'],
      },
      {
        id: 'stage-2',
        title: 'Stage 2: Linear Data Structures & Hash Maps',
        description: 'Hash Tables, Collision Handling, Linked Lists, Stack Monotonicity, and Queue buffers.',
        categories: ['HashMap', 'Linked Lists', 'Stacks', 'Queues'],
      },
      {
        id: 'stage-3',
        title: 'Stage 3: Binary Search, Sorting & Recursion',
        description: 'Search on monotonic functions, Divide & Conquer, Backtracking state exploration.',
        categories: ['Binary Search', 'Sorting', 'Recursion', 'Backtracking'],
      },
      {
        id: 'stage-4',
        title: 'Stage 4: Hierarchical Trees & Graph Traversals',
        description: 'Binary Search Trees, LCA, BFS/DFS, Dijkstra, Connected Components, Topological Sorting.',
        categories: ['Trees', 'Binary Search Trees', 'Graphs'],
      },
      {
        id: 'stage-5',
        title: 'Stage 5: Dynamic Programming & Heaps',
        description: '1D/2D DP memoization & tabulation, Priority Queues, Greedy choices, Bitwise masking.',
        categories: ['Dynamic Programming', 'Greedy Algorithms', 'Heap / Priority Queue', 'Bit Manipulation'],
      },
      {
        id: 'stage-6',
        title: 'Stage 6: Enterprise Real-World Coding & SQL',
        description: 'Complex SQL window functions, CTEs, Java Concurrency problems, and JavaScript async challenges.',
        categories: ['SQL Coding Challenges', 'Java Coding Challenges', 'JavaScript Coding Challenges'],
      },
    ];

    return stages.map((stage) => {
      const stageProblems = allProblems.filter((p) =>
        stage.categories.includes(p.category),
      );
      const solvedCount = stageProblems.filter((p) => solvedSet.has(p.id)).length;
      return {
        ...stage,
        totalProblems: stageProblems.length,
        solvedCount,
        progressPercentage: Math.round(
          (solvedCount / (stageProblems.length || 1)) * 100,
        ),
        problems: stageProblems.slice(0, 6).map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          category: p.category,
          difficulty: p.difficulty,
          isSolved: solvedSet.has(p.id),
        })),
      };
    });
  }
}
