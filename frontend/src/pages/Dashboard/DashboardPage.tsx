import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { analyticsService, dailyService, questionService, codingService } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import {
  Flame,
  Award,
  Code2,
  HelpCircle,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [highlights, setHighlights] = useState<any>(null);
  const [weeklyReport, setWeeklyReport] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [recommendedQuestions, setRecommendedQuestions] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [hl, wr, an, recQ] = await Promise.all([
          dailyService.getHighlights(),
          dailyService.getWeeklyReport().catch(() => null),
          analyticsService.getOverview().catch(() => null),
          questionService.getRecommended('Java', 4),
        ]);
        setHighlights(hl);
        setWeeklyReport(wr);
        setAnalytics(an);
        setRecommendedQuestions(recQ);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const chartData = weeklyReport?.days || [
    { day: 'Mon', questionsCompleted: 4, codingProblemsSolved: 2 },
    { day: 'Tue', questionsCompleted: 5, codingProblemsSolved: 3 },
    { day: 'Wed', questionsCompleted: 3, codingProblemsSolved: 1 },
    { day: 'Thu', questionsCompleted: 6, codingProblemsSolved: 4 },
    { day: 'Fri', questionsCompleted: 2, codingProblemsSolved: 2 },
    { day: 'Sat', questionsCompleted: 7, codingProblemsSolved: 5 },
    { day: 'Sun', questionsCompleted: 5, codingProblemsSolved: 3 },
  ];

  const radarData = analytics?.categoryProficiency || [
    { category: 'Java', score: 85, fullMark: 100 },
    { category: 'Spring Boot', score: 78, fullMark: 100 },
    { category: 'React.js', score: 82, fullMark: 100 },
    { category: 'Node.js', score: 74, fullMark: 100 },
    { category: 'Kafka', score: 70, fullMark: 100 },
    { category: 'System Design', score: 68, fullMark: 100 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome & Compensation Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Target Salary Band: {user?.targetCompensation || '₹25–35 LPA'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Developer'}! 👋
            </h1>
            <p className="text-sm text-indigo-100/90 leading-relaxed">
              You are on the senior software engineering fast-track. Complete your daily challenges
              to maintain your {user?.dailyStreak || 7}-day streak.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/mock-interviews">
              <Button
                variant="primary"
                leftIcon={<Sparkles className="w-4 h-4 text-amber-300" />}
                className="bg-white text-indigo-900 hover:bg-indigo-50 shadow-md font-semibold"
              >
                Launch Mock Interview
              </Button>
            </Link>
            <Link to="/coding">
              <Button
                variant="outline"
                className="border-indigo-300/40 text-white hover:bg-white/10"
              >
                Solve Coding Challenge
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative background blur glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Daily Streak
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500">
              <Flame className="w-5 h-5 fill-current" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {user?.dailyStreak || 7}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5">days</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>Top 5% consistency this month</span>
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Interview Questions
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <HelpCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {analytics?.coding?.totalProblems || 17}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5">mastered</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Across 30+ tech categories
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Coding Challenges
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Code2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {analytics?.coding?.solvedProblems || 5}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5">solved</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            {analytics?.coding?.acceptedSubmissions ? '100% Acceptance rate' : 'Ready to solve'}
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Interview Readiness
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {analytics?.readinessScore || 78}%
            </span>
          </div>
          <div className="mt-2 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
            Targeting {user?.targetCompensation || '₹25–35 LPA'}
          </div>
        </Card>
      </div>

      {/* Daily Highlights: Question of the Day & Coding Problem */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Question of the Day */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  <Calendar className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Question of the Day
                </span>
              </div>
              {highlights?.questionOfTheDay && (
                <Badge variant="primary">{highlights.questionOfTheDay.category}</Badge>
              )}
            </div>

            {loading ? (
              <Skeleton className="h-16 w-full" />
            ) : highlights?.questionOfTheDay ? (
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                  {highlights.questionOfTheDay.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-4">
                  {highlights.questionOfTheDay.shortAnswer}
                </p>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400">
              {highlights?.questionOfTheDay?.difficulty || 'Intermediate'} •{' '}
              {highlights?.questionOfTheDay?.targetCompensation || '₹25–30 LPA'}
            </span>
            {highlights?.questionOfTheDay && (
              <Link to={`/questions/${highlights.questionOfTheDay.slug}`}>
                <Button size="sm" variant="secondary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Review Answer
                </Button>
              </Link>
            )}
          </div>
        </Card>

        {/* Coding Challenge of the Day */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <Code2 className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Coding Challenge of the Day
                </span>
              </div>
              {highlights?.codingProblemOfTheDay && (
                <Badge variant="emerald">{highlights.codingProblemOfTheDay.difficulty}</Badge>
              )}
            </div>

            {loading ? (
              <Skeleton className="h-16 w-full" />
            ) : highlights?.codingProblemOfTheDay ? (
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                  {highlights.codingProblemOfTheDay.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Category: {highlights.codingProblemOfTheDay.category} • Acceptance Rate:{' '}
                  {highlights.codingProblemOfTheDay.acceptanceRate}%
                </p>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400">
              Languages: Java, JS, TS, Python, C++
            </span>
            {highlights?.codingProblemOfTheDay && (
              <Link to={`/coding/${highlights.codingProblemOfTheDay.slug}`}>
                <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Solve in Editor
                </Button>
              </Link>
            )}
          </div>
        </Card>
      </div>

      {/* Analytics Visuals: Weekly Activity & Skill Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity Bar Chart */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Weekly Learning Velocity
              </h3>
              <p className="text-xs text-slate-500">Questions answered & coding challenges solved</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600 inline-block" /> Questions
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Coding
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="questionsCompleted" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="codingProblemsSolved" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Proficiency Radar */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Domain Proficiency
            </h3>
            <p className="text-xs text-slate-500 mb-2">Technical competency evaluation</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="category" stroke="#94a3b8" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={9} />
                <Radar
                  name="Proficiency"
                  dataKey="score"
                  stroke="#818cf8"
                  fill="#6366f1"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
            <Link to="/analytics" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              View Detailed Analytics →
            </Link>
          </div>
        </Card>
      </div>

      {/* Recommended Topics / Fast Track */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Curated High-Yield Interview Questions
          </h2>
          <Link
            to="/questions"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>Explore All 30+ Categories</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendedQuestions.map((q) => (
            <Card key={q.id} hoverEffect className="p-4 flex flex-col justify-between">
              <Link to={`/questions/${q.slug}`} className="block">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="indigo">{q.category}</Badge>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {q.experienceLevel} • {q.targetCompensation}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 hover:text-indigo-600 transition-colors">
                  {q.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5">
                  {q.shortAnswer}
                </p>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
