import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockInterviewService } from '../../services/api';
import { MockInterview, Question } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import {
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

export const MockInterviewSessionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [interview, setInterview] = useState<MockInterview | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 mins in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadSession() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await mockInterviewService.getInterview(Number(id));
        setInterview(res.interview);
        setQuestions(res.questions);
        setTimeLeft((res.interview.durationMinutes || 30) * 60);

        // Populate previous answers if any
        if (res.answers && res.answers.length > 0) {
          const map: Record<number, string> = {};
          res.answers.forEach((a) => {
            map[a.questionId] = a.userAnswer;
          });
          setUserAnswers(map);
        }
      } catch (err) {
        toast.error('Failed to load mock interview');
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [id]);

  // Timer countdown
  useEffect(() => {
    if (loading || !interview || interview.status === 'Completed') return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          toast.warning('Time is up! Submitting interview answers...');
          handleSubmitAll();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, interview]);

  const handleAnswerChange = (text: string) => {
    const qId = questions[currentIndex]?.id;
    if (!qId) return;
    setUserAnswers((prev) => ({
      ...prev,
      [qId]: text,
    }));
  };

  const handleSubmitAll = async () => {
    if (!id || questions.length === 0) return;
    setIsSubmitting(true);
    try {
      const answersPayload = questions.map((q) => ({
        questionId: q.id,
        userAnswer: userAnswers[q.id] || '',
      }));

      await mockInterviewService.complete(Number(id), answersPayload);
      toast.success('Mock interview completed! Evaluating answers...');
      navigate(`/mock-interviews/${id}/report`);
    } catch (err: any) {
      toast.error('Failed to submit mock interview');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isTimeCritical = timeLeft < 300; // <5 mins

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Session Status Bar */}
      <Card className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="indigo">{interview?.roleCategory}</Badge>
          <span className="text-xs text-slate-500 font-medium">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>

        {/* Live Timer */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold ${
            isTimeCritical
              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </Card>

      {/* Question Carousel Palette */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {questions.map((q, idx) => {
            const hasAnswer = (userAnswers[q.id] || '').trim().length > 0;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  currentIndex === idx
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                    : hasAnswer
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={handleSubmitAll}
          isLoading={isSubmitting}
          leftIcon={<Send className="w-3.5 h-3.5" />}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          Finish & Evaluate
        </Button>
      </div>

      {/* Question Details Card */}
      {currentQ && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="neutral">{currentQ.category}</Badge>
            <Badge variant="warning">{currentQ.difficulty}</Badge>
          </div>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
            {currentQ.title}
          </h2>

          <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-300">
            <strong>Interviewer Prompt:</strong> How would you explain this in a senior technical round? Structure your answer with internal mechanics, production trade-offs, and failure handling.
          </div>

          {/* User Answer Input Area */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Your Spoken / Written Response:
            </label>
            <textarea
              value={userAnswers[currentQ.id] || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Type your structured answer here. Include architectural considerations, code patterns, and real-world examples..."
              rows={10}
              className="w-full p-4 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Word count: {(userAnswers[currentQ.id] || '').trim().split(/\s+/).filter(Boolean).length} words</span>
              <span>Target: 100–300 words for optimal depth</span>
            </div>
          </div>

          {/* Navigation Controls */}
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

            <Button
              size="sm"
              variant="outline"
              disabled={currentIndex === questions.length - 1}
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
