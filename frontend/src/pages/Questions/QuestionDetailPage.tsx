import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { questionService, bookmarkService } from '../../services/api';
import { Question } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import {
  Bookmark,
  Check,
  Copy,
  AlertTriangle,
  Lightbulb,
  Zap,
  Building,
  HelpCircle,
  Code,
  FileEdit,
  Save,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';

export const QuestionDetailPage: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Notes state
  const [noteContent, setNoteContent] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  useEffect(() => {
    async function loadQuestion() {
      if (!idOrSlug) return;
      setLoading(true);
      try {
        const q = await questionService.getQuestion(idOrSlug);
        setQuestion(q);

        // Load existing note if any
        try {
          const notes = await bookmarkService.getNotes('QUESTION', q.id);
          if (notes && notes.length > 0) {
            setNoteContent(notes[0].content);
          }
        } catch {}
      } catch (err) {
        toast.error('Failed to load question details');
      } finally {
        setLoading(false);
      }
    }
    loadQuestion();
  }, [idOrSlug]);

  const handleCopyCode = () => {
    if (question?.codeSnippet) {
      navigator.clipboard.writeText(question.codeSnippet);
      setCopied(true);
      toast.success('Code snippet copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleBookmark = async () => {
    if (!question) return;
    try {
      const res = await bookmarkService.toggleBookmark('QUESTION', question.id);
      setIsBookmarked(res.bookmarked);
      if (res.bookmarked) {
        toast.success('Question added to bookmarks');
      } else {
        toast.info('Question removed from bookmarks');
      }
    } catch {
      toast.error('Please login to bookmark questions');
    }
  };

  const handleSaveNote = async () => {
    if (!question) return;
    setIsSavingNote(true);
    try {
      await bookmarkService.saveNote({
        itemType: 'QUESTION',
        itemId: question.id,
        title: `Notes: ${question.title.substring(0, 40)}...`,
        content: noteContent,
      });
      toast.success('Personal revision notes saved!');
    } catch {
      toast.error('Failed to save notes. Please make sure you are logged in.');
    } finally {
      setIsSavingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <h2 className="text-xl font-bold">Question not found</h2>
        <Link to="/questions" className="text-indigo-600 mt-2 inline-block">
          Return to Question Bank
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Question Bank', href: '/questions' },
          { label: question.category, href: `/questions?category=${encodeURIComponent(question.category)}` },
          { label: question.title },
        ]}
      />

      {/* Question Header Card */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="indigo">{question.category}</Badge>
            <Badge variant="warning">{question.difficulty}</Badge>
            <Badge variant="success">{question.targetCompensation}</Badge>
            <span className="text-xs text-slate-500 font-medium">
              {question.experienceLevel} Experience
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isBookmarked ? 'primary' : 'outline'}
              onClick={handleToggleBookmark}
              leftIcon={<Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-white' : ''}`} />}
            >
              {isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </Button>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug">
          {question.title}
        </h1>

        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {question.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* 1. Short Interview-Ready Answer (60-Second Elevator Pitch) */}
      <Card className="p-6 border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Short Interview-Ready Answer
            </h2>
            <p className="text-[11px] text-slate-500">Your 60-second high-impact response for interviews</p>
          </div>
        </div>

        <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium bg-white/70 dark:bg-slate-900/70 p-4 rounded-xl border border-indigo-100 dark:border-indigo-950">
          {question.shortAnswer}
        </div>
      </Card>

      {/* 2. Detailed Technical Explanation */}
      <Card className="p-6 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <HelpCircle className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Deep-Dive Architectural Explanation
          </h2>
        </div>
        <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line space-y-2">
          {question.detailedExplanation}
        </div>
      </Card>

      {/* 3. Real-World Production Example */}
      <Card className="p-6 space-y-3 bg-slate-50/70 dark:bg-slate-900/50">
        <div className="flex items-center gap-2 mb-1">
          <Building className="w-4 h-4 text-purple-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Real-World Enterprise Production Scenario
          </h2>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {question.realWorldExample}
        </p>
      </Card>

      {/* 4. Practical Implementation & Code Snippet */}
      {question.codeSnippet && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Practical Implementation & Code Snippet
              </h2>
            </div>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 px-2.5 py-1 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>

          <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
            <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
              <code>{question.codeSnippet}</code>
            </pre>
          </div>
        </Card>
      )}

      {/* 5. Common Mistakes to Avoid & Interview Tips (Two columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Common Mistakes */}
        <Card className="p-5 border-rose-200/60 dark:border-rose-950/60 bg-rose-50/20 dark:bg-rose-950/10">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-3">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Common Pitfalls & Mistakes</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            {(question.commonMistakes || [
              'Giving a textbook definition without explaining internal memory and concurrency implications.',
              'Failing to mention production trade-offs and latency benchmarks.',
            ]).map((mistake, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Interview Tips */}
        <Card className="p-5 border-amber-200/60 dark:border-amber-950/60 bg-amber-50/20 dark:bg-amber-950/10">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-3">
            <Lightbulb className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Interview Pro Tips</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            {(question.interviewTips || [
              'Begin your answer with the short 60-second summary, then ask: "Would you like me to walk through the internal mechanics or the production failure modes?"',
              'Draw internal data structure diagrams on the whiteboard when possible.',
            ]).map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">✓</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* 6. Follow-up Interview Questions */}
      {question.followUpQuestions && question.followUpQuestions.length > 0 && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Anticipated Interviewer Follow-Up Questions
            </h3>
          </div>
          <div className="space-y-2">
            {question.followUpQuestions.map((fq, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-800 dark:text-slate-200 font-medium"
              >
                Q{idx + 1}: {fq}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 7. Personal Notes & Revision Area */}
      <Card className="p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileEdit className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              My Personal Revision Notes
            </h3>
          </div>
          <Button
            size="sm"
            onClick={handleSaveNote}
            isLoading={isSavingNote}
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            Save Notes
          </Button>
        </div>
        <textarea
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="Jot down personal reminders, your company's implementation quirks, or notes for your upcoming mock interview..."
          rows={4}
          className="w-full text-xs sm:text-sm p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
        />
      </Card>
    </div>
  );
};
