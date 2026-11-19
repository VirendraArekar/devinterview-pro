import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { quizService } from '../../services/api';
import { Quiz } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import {
  Award,
  Clock,
  HelpCircle,
  Trophy,
  ArrowRight,
  TrendingUp,
  History,
} from 'lucide-react';

export const QuizListPage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [qList, lb, hist] = await Promise.all([
          quizService.getQuizzes(selectedCategory),
          quizService.getLeaderboard().catch(() => []),
          quizService.getHistory().catch(() => []),
        ]);
        setQuizzes(qList);
        setLeaderboard(lb);
        setHistory(hist);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedCategory]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 text-white shadow-md">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Award className="w-3.5 h-3.5" />
            <span>Timed Knowledge Assessments</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Technical Interview Quizzes & Assessments
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Test your knowledge under real interview time constraints with output prediction, bug identification, and SQL queries.
          </p>
        </div>
      </div>

      {/* Main Grid: Quiz Cards + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Quizzes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
            {['All', 'Java', 'React.js', 'Node.js', 'Spring Boot', 'SQL'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : quizzes.length === 0 ? (
            <Card className="p-8 text-center text-slate-500 text-sm">
              No quizzes currently available in this category.
            </Card>
          ) : (
            <div className="space-y-4">
              {quizzes.map((quiz) => (
                <Card key={quiz.id} hoverEffect className="p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="indigo">{quiz.category}</Badge>
                      <Badge variant="warning">{quiz.difficulty}</Badge>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {quiz.title}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{quiz.durationMinutes} mins</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>{quiz.totalQuestions} Questions</span>
                      </span>
                      <span>Passing Score: {quiz.passingScore}%</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Negative marking: {quiz.negativeMarkingRatio * 100}% per wrong answer
                    </span>
                    <Link to={`/quizzes/${quiz.slug}`}>
                      <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                        Start Assessment
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Leaderboard & User History */}
        <div className="space-y-6">
          {/* Global Leaderboard */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                  Top Leaderboard
                </h3>
              </div>
              <Badge variant="warning" size="sm">Global</Badge>
            </div>

            <div className="space-y-2">
              {(leaderboard.length > 0 ? leaderboard : [
                { rank: 1, name: 'Siddharth R.', score: 95, attemptsCount: 8 },
                { rank: 2, name: 'Alex Johnson', score: 90, attemptsCount: 5 },
                { rank: 3, name: 'Priya Sharma', score: 88, attemptsCount: 6 },
              ]).map((entry: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        idx === 0
                          ? 'bg-amber-400 text-slate-950'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-950'
                          : 'bg-amber-700 text-white'
                      }`}
                    >
                      {entry.rank || idx + 1}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {entry.name}
                    </span>
                  </div>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                    {entry.score}%
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Past Attempts History */}
          {history.length > 0 && (
            <Card className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Your Recent Quiz Attempts
                </h3>
              </div>
              <div className="space-y-2">
                {history.slice(0, 4).map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {h.quizTitle}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {h.correctCount}/{h.totalQuestions} correct
                      </div>
                    </div>
                    <span
                      className={`font-bold font-mono ${
                        h.passed ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                    >
                      {h.score}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
