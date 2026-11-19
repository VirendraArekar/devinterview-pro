import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { mockInterviewService } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  Sparkles,
  Clock,
  HelpCircle,
  Award,
  ChevronRight,
  ShieldCheck,
  Play,
  History,
} from 'lucide-react';
import { toast } from 'sonner';

export const MockInterviewSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const [roleCategory, setRoleCategory] = useState('Java Developer');
  const [experienceLevel, setExperienceLevel] = useState('5–8 Years');
  const [difficulty, setDifficulty] = useState('Advanced');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [isCreating, setIsCreating] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    async function loadHistory() {
      try {
        const hist = await mockInterviewService.getHistory();
        setHistory(hist);
      } catch (err) {
        console.error(err);
      }
    }
    loadHistory();
  }, []);

  const handleStartInterview = async () => {
    setIsCreating(true);
    try {
      const res = await mockInterviewService.create({
        roleCategory,
        experienceLevel,
        difficulty,
        durationMinutes,
        totalQuestions,
      });
      toast.success('Mock interview initialized! Good luck!');
      navigate(`/mock-interviews/${res.interview.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to initialize mock interview. Please login.');
    } finally {
      setIsCreating(false);
    }
  };

  const roles = [
    'Java Developer',
    'React Developer',
    'Node.js Developer',
    'Full Stack Developer',
    'Spring Boot Developer',
    'Backend Developer',
    'System Design',
    'Database Engineer',
    'DevOps Engineer',
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-950 text-white shadow-lg space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Interactive AI Evaluation Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Role-Based Technical Mock Interview
        </h1>
        <p className="text-xs sm:text-sm text-indigo-100/90 max-w-2xl leading-relaxed">
          Simulate rigorous mid-to-senior technical rounds (₹15–40 LPA standard). Answer under timed conditions, compare against model responses, and receive granular AI feedback on technical depth and communication.
        </p>
      </div>

      {/* Setup Wizard Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2 space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
            Interview Configuration
          </h2>

          {/* 1. Target Role */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              1. Select Interview Track / Role
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {roles.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleCategory(r)}
                  className={`p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                    roleCategory === r
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-xs ring-1 ring-indigo-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Experience & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                2. Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                {['3–5 Years', '5–8 Years', '8–12 Years', '12+ Years'].map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                3. Difficulty Tier
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                {['Intermediate', 'Advanced', 'Senior / Architect'].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Duration & Question Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                4. Session Duration
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option value={15}>15 Minutes (Express Sprint)</option>
                <option value={30}>30 Minutes (Standard Round)</option>
                <option value={45}>45 Minutes (Full Deep Dive)</option>
                <option value={60}>60 Minutes (Comprehensive)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                5. Number of Questions
              </label>
              <select
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions (Recommended)</option>
                <option value={8}>8 Questions</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <Button
              size="lg"
              variant="primary"
              onClick={handleStartInterview}
              isLoading={isCreating}
              leftIcon={<Play className="w-4 h-4 fill-current" />}
              className="w-full py-3 text-sm font-bold shadow-md bg-indigo-600 hover:bg-indigo-700"
            >
              Start Live Mock Interview
            </Button>
          </div>
        </Card>

        {/* Right Info / Past History Column */}
        <div className="space-y-4">
          <Card className="p-5 space-y-3 bg-gradient-to-br from-indigo-50/40 to-white dark:from-slate-900 dark:to-indigo-950/20">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Evaluation Rubric</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 font-bold">1.</span>
                <span><strong>Technical Accuracy:</strong> Core concepts, memory models, and internal mechanics.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 font-bold">2.</span>
                <span><strong>Production Reasoning:</strong> Latency benchmarks, trade-offs, and failure handling.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 font-bold">3.</span>
                <span><strong>Conciseness:</strong> Providing clear, structured answers without wandering.</span>
              </li>
            </ul>
          </Card>

          {/* Past Mock Sessions */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <History className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Recent Sessions</h3>
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-slate-400">No mock interviews completed yet.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {history.slice(0, 5).map((h) => (
                  <Link
                    key={h.id}
                    to={`/mock-interviews/${h.id}/report`}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {h.roleCategory}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Score: {h.score !== null ? `${h.score}%` : 'Incomplete'}
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
