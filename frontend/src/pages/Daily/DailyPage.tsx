import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dailyService } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import {
  Flame,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
  Code2,
  Award,
  Zap,
} from 'lucide-react';

export const DailyPage: React.FC = () => {
  const [highlights, setHighlights] = useState<any>(null);
  const [weeklyReport, setWeeklyReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Custom schedule state
  const [sprintGoal, setSprintGoal] = useState('30-Day Senior Java & Microservices Sprint (₹30 LPA)');
  const [sprintDays, setSprintDays] = useState(30);

  useEffect(() => {
    async function loadData() {
      try {
        const [hl, wr] = await Promise.all([
          dailyService.getHighlights(),
          dailyService.getWeeklyReport().catch(() => null),
        ]);
        setHighlights(hl);
        setWeeklyReport(wr);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner with Streak & Motivational Quote */}
      <Card className="p-6 sm:p-8 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 border-amber-200/50 dark:border-amber-900/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
              <span>Daily Preparation Routine</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Daily Practice & Systematic Revision
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic max-w-xl">
              "{highlights?.motivationalQuote || 'Consistency is what transforms average into senior excellence.'}"
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-xs flex-shrink-0">
            <div className="text-3xl font-black text-amber-500 flex items-center justify-center gap-1">
              <Flame className="w-6 h-6 fill-amber-500" />
              <span>7</span>
            </div>
            <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mt-0.5">
              Days Active
            </div>
          </div>
        </div>
      </Card>

      {/* Today's 3-Part Daily Routine */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
          Today's 3-Part Milestone Checklist
        </h2>

        {/* 1. Daily Question */}
        {highlights?.questionOfTheDay && (
          <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-indigo-600">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="indigo">Part 1: Concept Pitch</Badge>
                <span className="text-xs text-slate-400">
                  {highlights.questionOfTheDay.category}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {highlights.questionOfTheDay.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                {highlights.questionOfTheDay.shortAnswer}
              </p>
            </div>
            <Link to={`/questions/${highlights.questionOfTheDay.slug}`}>
              <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Solve (10m)
              </Button>
            </Link>
          </Card>
        )}

        {/* 2. Daily Coding Challenge */}
        {highlights?.codingProblemOfTheDay && (
          <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-emerald-600">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="emerald">Part 2: Coding Practice</Badge>
                <Badge size="sm" variant="warning">
                  {highlights.codingProblemOfTheDay.difficulty}
                </Badge>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {highlights.codingProblemOfTheDay.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {highlights.codingProblemOfTheDay.category} • Multi-language execution
              </p>
            </div>
            <Link to={`/coding/${highlights.codingProblemOfTheDay.slug}`}>
              <Button size="sm" variant="secondary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Code in Monaco (15m)
              </Button>
            </Link>
          </Card>
        )}

        {/* 3. Daily Quiz */}
        {highlights?.dailyQuiz && (
          <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-purple-600">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="purple">Part 3: 5-Minute Quiz</Badge>
                <span className="text-xs text-slate-400">
                  {highlights.dailyQuiz.durationMinutes} mins • {highlights.dailyQuiz.totalQuestions} Questions
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {highlights.dailyQuiz.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Category: {highlights.dailyQuiz.category}
              </p>
            </div>
            <Link to={`/quizzes/${highlights.dailyQuiz.slug}`}>
              <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Take Quiz (5m)
              </Button>
            </Link>
          </Card>
        )}
      </div>

      {/* Custom Preparation Sprint Scheduler */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <Zap className="w-4 h-4" />
          <h3 className="text-sm font-bold uppercase tracking-wider">
            Custom Interview Sprint Schedule
          </h3>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Targeting a specific offer window? Commit to a customized daily pace and we will automatically schedule revision reminders.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold block mb-1">Target Sprint Plan:</label>
            <select
              value={sprintGoal}
              onChange={(e) => setSprintGoal(e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <option value="30-Day Senior Java & Microservices Sprint (₹30 LPA)">
                30-Day Senior Java & Microservices Sprint (₹30 LPA)
              </option>
              <option value="45-Day Full-Stack React & Node.js Sprint (₹25 LPA)">
                45-Day Full-Stack React & Node.js Sprint (₹25 LPA)
              </option>
              <option value="60-Day Senior Distributed Systems & Architect Sprint (₹40 LPA)">
                60-Day Senior Distributed Systems & Architect Sprint (₹40 LPA)
              </option>
            </select>
          </div>

          <div>
            <label className="font-semibold block mb-1">Pace:</label>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium">
              3 Questions + 1 Coding Challenge + 1 System Design / Day
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
