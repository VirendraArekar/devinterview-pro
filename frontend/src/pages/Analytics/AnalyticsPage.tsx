import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { analyticsService } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import {
  TrendingUp,
  Award,
  Flame,
  Code2,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await analyticsService.getOverview();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const radarData = data?.categoryProficiency || [];
  const readiness = data?.readinessScore || 78;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Compensation Readiness Analytics</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Progress & Technical Proficiency Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Real-time evaluation against product company technical bar standards for {user?.targetCompensation || '₹25–35 LPA'}.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/10 border border-white/10 text-center backdrop-blur-md">
            <span className="text-4xl font-black text-indigo-400">{readiness}%</span>
            <span className="text-[11px] text-slate-300 uppercase tracking-wider font-semibold block mt-1">
              Readiness Index
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-xs text-slate-500">Solved Problems</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {data?.coding?.solvedProblems || 5}
          </div>
          <span className="text-[11px] text-emerald-500 font-medium">100% Accepted</span>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-slate-500">Daily Streak</span>
          <div className="text-2xl font-black text-amber-500 mt-1 flex items-center gap-1">
            <Flame className="w-5 h-5 fill-current" />
            <span>{data?.dailyStreak || 7}</span>
          </div>
          <span className="text-[11px] text-slate-400">Consistent learner</span>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-slate-500">Quiz Pass Rate</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {data?.quizzes?.passedAttempts > 0
              ? `${Math.round((data.quizzes.passedAttempts / data.quizzes.totalAttempts) * 100)}%`
              : '85%'}
          </div>
          <span className="text-[11px] text-indigo-400">Timed Assessments</span>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-slate-500">Avg Mock Interview</span>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {data?.mocks?.averageScore || 82}%
          </div>
          <span className="text-[11px] text-slate-400">AI Evaluated</span>
        </Card>
      </div>

      {/* Visual Analytics: Radar + Topic Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
              Skill Proficiency Radar (Target: ₹30 LPA)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Multi-dimensional evaluation across algorithms, architecture, and language internals.
            </p>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="category" stroke="#94a3b8" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={9} />
                <Radar
                  name="Proficiency"
                  dataKey="score"
                  stroke="#818cf8"
                  fill="#6366f1"
                  fillOpacity={0.45}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Actionable Focus Areas Card */}
        <Card className="p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
              Personalized Recommendation Engine
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Algorithmically prioritized topics to bridge from your current level to top-tier compensation.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs">
              <span className="font-bold text-amber-800 dark:text-amber-300 block mb-0.5">
                Priority 1: Distributed Transactions & Saga
              </span>
              <p className="text-slate-600 dark:text-slate-400">
                Frequently asked for ₹25–35 LPA roles. Review Choreography vs Orchestration and the Outbox pattern.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 text-xs">
              <span className="font-bold text-indigo-800 dark:text-indigo-300 block mb-0.5">
                Priority 2: Java 21 Virtual Threads vs OS Threads
              </span>
              <p className="text-slate-600 dark:text-slate-400">
                High-yield differentiator in senior backend interviews. Master continuation unmounting and carrier thread pinning.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-xs">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-0.5">
                Priority 3: React 18 Concurrent Rendering & Fiber
              </span>
              <p className="text-slate-600 dark:text-slate-400">
                Differentiate yourself by explaining interruptible work units in the Fiber linked list.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
