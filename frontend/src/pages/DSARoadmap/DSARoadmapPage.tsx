import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dsaService } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import {
  GitBranch,
  CheckCircle2,
  Circle,
  TrendingUp,
  Award,
  ChevronRight,
  BookOpen,
  Zap,
} from 'lucide-react';

export const DSARoadmapPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRoadmap() {
      try {
        const res = await dsaService.getDashboard();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadRoadmap();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const summary = data?.summary || { totalProblems: 5, solvedProblems: 1, unsolvedProblems: 4 };
  const difficulty = data?.difficulty || {
    easy: { total: 2, solved: 1 },
    medium: { total: 3, solved: 0 },
    hard: { total: 0, solved: 0 },
  };
  const roadmap = data?.roadmap || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 text-white shadow-md">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <GitBranch className="w-3.5 h-3.5" />
            <span>Curated Curriculum</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            DSA Preparation Tracker & Guided Roadmap
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            From foundational two-pointer paradigms to advanced dynamic programming and graph architectures.
          </p>
        </div>

        {/* Progress Circular/Summary */}
        <div className="flex items-center gap-6 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
          <div>
            <div className="text-2xl font-black text-indigo-400">
              {summary.solvedProblems} / {summary.totalProblems}
            </div>
            <div className="text-xs text-slate-400">Total Solved</div>
          </div>
          <div className="h-10 w-[1px] bg-white/10" />
          <div>
            <div className="text-2xl font-black text-emerald-400">
              {Math.round((summary.solvedProblems / (summary.totalProblems || 1)) * 100)}%
            </div>
            <div className="text-xs text-slate-400">Curriculum Mastery</div>
          </div>
        </div>
      </div>

      {/* Difficulty Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <span className="text-xs font-bold text-slate-500">Easy Fundamentals</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {difficulty.easy.solved} / {difficulty.easy.total}
            </span>
            <span className="text-xs text-emerald-600 font-bold">
              {Math.round((difficulty.easy.solved / (difficulty.easy.total || 1)) * 100)}%
            </span>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500">
          <span className="text-xs font-bold text-slate-500">Medium Product-Standard</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {difficulty.medium.solved} / {difficulty.medium.total}
            </span>
            <span className="text-xs text-amber-600 font-bold">
              {Math.round((difficulty.medium.solved / (difficulty.medium.total || 1)) * 100)}%
            </span>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-rose-500">
          <span className="text-xs font-bold text-slate-500">Hard Architect-Level</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {difficulty.hard.solved} / {difficulty.hard.total || 1}
            </span>
            <span className="text-xs text-rose-600 font-bold">
              {Math.round((difficulty.hard.solved / (difficulty.hard.total || 1)) * 100)}%
            </span>
          </div>
        </Card>
      </div>

      {/* Guided Roadmap Milestones Timeline */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Step-by-Step Learning Stages
        </h2>

        <div className="space-y-4">
          {roadmap.map((stage: any, sIdx: number) => (
            <Card key={stage.id} className="p-5 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                      {sIdx + 1}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {stage.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 ml-8">{stage.description}</p>
                </div>

                <div className="flex items-center gap-3 ml-8 sm:ml-0">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {stage.solvedCount} / {stage.totalProblems} Completed
                  </span>
                  <div className="w-24 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                      style={{ width: `${stage.progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Problem list in this stage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                {stage.problems.map((p: any) => (
                  <Link
                    key={p.id}
                    to={`/coding/${p.slug}`}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      {p.isSolved ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      )}
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">
                        {p.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Badge
                        size="sm"
                        variant={
                          p.difficulty === 'Easy'
                            ? 'success'
                            : p.difficulty === 'Medium'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {p.difficulty}
                      </Badge>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
