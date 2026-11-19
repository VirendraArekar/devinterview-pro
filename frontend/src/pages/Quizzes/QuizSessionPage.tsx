import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { quizService } from '../../services/api';
import { Quiz, QuizQuestion } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import {
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';

export const QuizSessionPage: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins default
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    async function loadQuiz() {
      if (!idOrSlug) return;
      setLoading(true);
      try {
        const res = await quizService.getQuiz(idOrSlug);
        setQuiz(res.quiz);
        setQuestions(res.questions);
        setTimeLeft((res.quiz.durationMinutes || 15) * 60);
      } catch (err) {
        toast.error('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, [idOrSlug]);

  useEffect(() => {
    if (loading || result) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.warning('Time expired! Submitting answers automatically.');
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, result]);

  const handleOptionToggle = (questionId: number, optionId: string, isMulti: boolean) => {
    const qKey = questionId.toString();
    const current = selectedAnswers[qKey] || [];

    if (isMulti) {
      if (current.includes(optionId)) {
        setSelectedAnswers({
          ...selectedAnswers,
          [qKey]: current.filter((id) => id !== optionId),
        });
      } else {
        setSelectedAnswers({
          ...selectedAnswers,
          [qKey]: [...current, optionId],
        });
      }
    } else {
      setSelectedAnswers({
        ...selectedAnswers,
        [qKey]: [optionId],
      });
    }
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    setIsSubmitting(true);
    try {
      const timeSpent = (quiz.durationMinutes * 60) - timeLeft;
      const res = await quizService.submitQuiz(quiz.id, {
        userAnswers: selectedAnswers,
        timeTakenSeconds: timeSpent > 0 ? timeSpent : 60,
      });
      setResult(res);

      if (res.passed) {
        toast.success(`Congratulations! Passed with ${res.score}%`);
        confetti({ particleCount: 80, spread: 60 });
      } else {
        toast.error(`Score: ${res.score}% (Passing score is ${res.passingScore}%)`);
      }
    } catch (err) {
      toast.error('Failed to submit quiz. Please make sure you are logged in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold">Quiz not found</h2>
        <Link to="/quizzes" className="text-indigo-600 mt-2 inline-block">
          Return to Quizzes
        </Link>
      </div>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const currentQ = questions[currentIndex];
  const isMultiSelect = currentQ?.type === 'multiple_select';
  const selectedForCurrent = selectedAnswers[currentQ?.id?.toString()] || [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header & Timer */}
      <Card className="p-4 flex items-center justify-between">
        <div>
          <Badge variant="indigo">{quiz.category}</Badge>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-1">
            {quiz.title}
          </h1>
        </div>

        {!result ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>
        ) : (
          <Badge variant={result.passed ? 'success' : 'danger'}>
            Final Score: {result.score}%
          </Badge>
        )}
      </Card>

      {/* When Quiz is Submitted -> Result & Detailed Explanations Review */}
      {result ? (
        <div className="space-y-6">
          <Card className="p-6 text-center space-y-3 bg-gradient-to-br from-slate-900 to-indigo-950 text-white border-slate-800">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto text-2xl font-black text-indigo-400">
              {result.score}%
            </div>
            <h2 className="text-xl font-bold">
              {result.passed ? 'Assessment Passed! 🎉' : 'Assessment Needs Work'}
            </h2>
            <p className="text-xs text-slate-300">
              You answered {result.correctCount} out of {result.totalQuestions} questions correctly.
            </p>
          </Card>

          {/* Question Explanations Review */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Detailed Question Analysis & Explanations
            </h3>

            {result.questionReview?.map((q: any, idx: number) => (
              <Card
                key={q.id}
                className={`p-5 space-y-3 border-l-4 ${
                  q.isCorrect ? 'border-l-emerald-500' : 'border-l-rose-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">
                    Question {idx + 1}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      q.isCorrect ? 'text-emerald-500' : 'text-rose-500'
                    }`}
                  >
                    {q.isCorrect ? 'Correct (+1)' : 'Incorrect (-0.25)'}
                  </span>
                </div>

                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {q.questionText}
                </p>

                {q.codeSnippet && (
                  <pre className="p-3 rounded-lg bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto">
                    {q.codeSnippet}
                  </pre>
                )}

                {/* Options display */}
                <div className="space-y-1.5 pt-1">
                  {q.options.map((opt: any) => {
                    const isSelected = q.userSelected?.includes(opt.id);
                    const isExpected = q.correctAnswers?.includes(opt.id);

                    return (
                      <div
                        key={opt.id}
                        className={`p-2.5 rounded-lg text-xs font-medium border flex items-center justify-between ${
                          isExpected
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                            : isSelected
                            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-800 dark:text-rose-300'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{opt.id}.</span>
                          <span>{opt.text}</span>
                        </div>
                        {isExpected && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        {!isExpected && isSelected && <XCircle className="w-4 h-4 text-rose-500" />}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation text */}
                <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-300">
                  <span className="font-bold block mb-0.5">Explanation:</span>
                  {q.explanation}
                </div>
              </Card>
            ))}
          </div>

          <div className="pt-4 flex items-center justify-between">
            <Link to="/quizzes">
              <Button variant="secondary" leftIcon={<RotateCcw className="w-4 h-4" />}>
                Back to All Quizzes
              </Button>
            </Link>
            <Link to="/questions">
              <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Revise Questions
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Live Quiz Answering Mode */
        <div className="space-y-4">
          {/* Question Index Palette */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {questions.map((q, idx) => {
                const isAnswered = (selectedAnswers[q.id.toString()] || []).length > 0;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                      currentIndex === idx
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                        : isAnswered
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <span className="text-xs text-slate-400">
              {isMultiSelect ? 'Multiple Options (Checkboxes)' : 'Single Choice'}
            </span>
          </div>

          {/* Current Question Card */}
          {currentQ && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Question {currentIndex + 1} of {questions.length}</span>
                <span className="uppercase text-[10px] font-mono tracking-wider">
                  Type: {currentQ.type.replace('_', ' ')}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                {currentQ.questionText}
              </h2>

              {/* Code Snippet if applicable */}
              {currentQ.codeSnippet && (
                <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                  <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
                    <code>{currentQ.codeSnippet}</code>
                  </pre>
                </div>
              )}

              {/* Options */}
              <div className="space-y-2 pt-2">
                {currentQ.options.map((opt) => {
                  const isChecked = selectedForCurrent.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleOptionToggle(currentQ.id, opt.id, isMultiSelect)}
                      className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${
                        isChecked
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500 shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs bg-slate-100 dark:bg-slate-800">
                          {opt.id}
                        </span>
                        <span>{opt.text}</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-${
                          isMultiSelect ? 'md' : 'full'
                        } border flex items-center justify-center ${
                          isChecked
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-400'
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Nav Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Previous
                </Button>

                {currentIndex === questions.length - 1 ? (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleSubmit}
                    isLoading={isSubmitting}
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Submit Assessment
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                  >
                    Next
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
