import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockInterviewService } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import {
  Award,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const MockInterviewReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      if (!id) return;
      try {
        const res = await mockInterviewService.getInterview(Number(id));
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const interview = data?.interview;
  const questions = data?.questions || [];
  const answers = data?.answers || [];

  const score = interview?.score || 0;
  const isPassed = score >= 70;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Overall Score Header Banner */}
      <Card className="p-6 sm:p-8 bg-gradient-to-br from-slate-900 to-indigo-950 text-white border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant={isPassed ? 'success' : 'warning'}>
                {isPassed ? 'Target Compensation Benchmark Met' : 'Needs Technical Refinement'}
              </Badge>
              <span className="text-xs text-slate-400">{interview?.roleCategory}</span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight">
              Mock Interview Performance Report
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              {interview?.feedbackSummary}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md">
            <span className="text-4xl font-black text-indigo-400">{score}%</span>
            <span className="text-[11px] text-slate-300 uppercase tracking-wider font-semibold mt-1">
              Overall Score
            </span>
          </div>
        </div>

        {/* Strong / Weak Topic Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 mt-6 border-t border-white/10 text-xs">
          <div>
            <span className="text-emerald-400 font-bold block mb-1">Strong Technical Domains:</span>
            <div className="flex flex-wrap gap-1.5">
              {(interview?.strongTopics || ['Core Principles', 'Architecture']).map((st: string) => (
                <span
                  key={st}
                  className="px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-800 text-[11px]"
                >
                  ✓ {st}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-amber-400 font-bold block mb-1">Recommended Revisions:</span>
            <div className="flex flex-wrap gap-1.5">
              {(interview?.weakTopics || ['Concurrency', 'Memory Leaks']).map((wt: string) => (
                <span
                  key={wt}
                  className="px-2 py-0.5 rounded-md bg-amber-950/60 text-amber-300 border border-amber-800 text-[11px]"
                >
                  ⚠ {wt}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Answer-by-Answer AI Breakdown */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
          Question-by-Question Evaluation & Model Comparison
        </h2>

        {answers.map((ans: any, idx: number) => {
          const matchingQ = questions.find((q: any) => q.id === ans.questionId);
          return (
            <Card key={ans.id || idx} className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Question {idx + 1} • {matchingQ?.category || 'General'}
                </span>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    ans.score >= 75
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  Score: {ans.score} / 100
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {ans.questionTitle || matchingQ?.title}
              </h3>

              {/* User Answer */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs">
                <div className="font-bold text-slate-500 mb-1">Your Submitted Response:</div>
                <p className="text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                  {ans.userAnswer || '(No answer provided)'}
                </p>
              </div>

              {/* AI Evaluation */}
              <div className="space-y-2 p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Technical Evaluation Feedback</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300">{ans.aiFeedback}</p>

                {ans.strengths && ans.strengths.length > 0 && (
                  <div className="pt-2 text-emerald-700 dark:text-emerald-300">
                    <span className="font-bold">Demonstrated Strengths:</span>
                    <ul className="list-disc list-inside space-y-0.5 mt-0.5">
                      {ans.strengths.map((s: string, sIdx: number) => (
                        <li key={sIdx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {ans.improvements && ans.improvements.length > 0 && (
                  <div className="pt-2 text-amber-700 dark:text-amber-300">
                    <span className="font-bold">High-Impact Areas for Improvement:</span>
                    <ul className="list-disc list-inside space-y-0.5 mt-0.5">
                      {ans.improvements.map((im: string, iIdx: number) => (
                        <li key={iIdx}>{im}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Model Answer Preview */}
              {matchingQ && (
                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Model answer includes 60s pitch, code snippets, and common pitfalls.
                  </span>
                  <Link
                    to={`/questions/${matchingQ.slug}`}
                    className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <span>Read Model Answer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-4">
        <Link to="/mock-interviews">
          <Button variant="secondary" leftIcon={<RotateCcw className="w-4 h-4" />}>
            Start Another Mock Interview
          </Button>
        </Link>
        <Link to="/questions">
          <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Revise Weak Topics
          </Button>
        </Link>
      </div>
    </div>
  );
};
