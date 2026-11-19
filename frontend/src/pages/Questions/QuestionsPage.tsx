import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { questionService, bookmarkService } from '../../services/api';
import { Question } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import {
  Search,
  Filter,
  Bookmark,
  ChevronRight,
  HelpCircle,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

export const QuestionsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedExperience, setSelectedExperience] = useState('All');
  const [selectedCompensation, setSelectedCompensation] = useState('All');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [page, setPage] = useState(1);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function fetchCategories() {
      try {
        const cats = await questionService.getCategories();
        setCategories(cats);
      } catch (e) {
        console.error(e);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      try {
        const data = await questionService.getQuestions({
          category: selectedCategory,
          difficulty: selectedDifficulty,
          experienceLevel: selectedExperience,
          targetCompensation: selectedCompensation,
          search: searchQuery,
          page,
          limit: 15,
        });
        setQuestions(data.items);
        setTotal(data.total);
      } catch (err) {
        toast.error('Failed to load interview questions');
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [selectedCategory, selectedDifficulty, selectedExperience, selectedCompensation, searchQuery, page]);

  const handleToggleBookmark = async (e: React.MouseEvent, qId: number) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await bookmarkService.toggleBookmark('QUESTION', qId);
      const next = new Set(bookmarkedIds);
      if (res.bookmarked) {
        next.add(qId);
        toast.success('Question added to bookmarks');
      } else {
        next.delete(qId);
        toast.info('Question removed from bookmarks');
      }
      setBookmarkedIds(next);
    } catch {
      toast.error('Please login to bookmark questions');
    }
  };

  const difficultyLevels = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Senior / Architect'];
  const experienceLevels = ['All', '3–5 Years', '5–8 Years', '8–12 Years', '12+ Years'];
  const compensationBands = ['All', '₹15–20 LPA', '₹20–25 LPA', '₹25–30 LPA', '₹30–35 LPA', '₹35–40 LPA'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Comprehensive Interview Question Bank
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Over {total || 30}+ enterprise questions with short interview-ready pitches, internal mechanics, and real-world examples.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search keywords, topics..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Main Grid: Sidebar Filters + Question List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Filter Column */}
        <div className="space-y-5 lg:col-span-1">
          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" />
                <span>Filters</span>
              </span>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedDifficulty('All');
                  setSelectedExperience('All');
                  setSelectedCompensation('All');
                  setSearchQuery('');
                  setPage(1);
                }}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Reset All
              </button>
            </div>

            {/* Target Compensation Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Compensation
              </label>
              <select
                value={selectedCompensation}
                onChange={(e) => {
                  setSelectedCompensation(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              >
                {compensationBands.map((band) => (
                  <option key={band} value={band}>
                    {band}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Level Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Experience Level
              </label>
              <select
                value={selectedExperience}
                onChange={(e) => {
                  setSelectedExperience(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              >
                {experienceLevels.map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Difficulty
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => {
                  setSelectedDifficulty(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              >
                {difficultyLevels.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff}
                  </option>
                ))}
              </select>
            </div>

            {/* Technology Category pills list */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Technology Category
              </label>
              <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setPage(1);
                  }}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                    selectedCategory === 'All'
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>All Technologies</span>
                  <span className="text-[10px] opacity-75">{total}</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      setPage(1);
                    }}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                      selectedCategory === cat.name
                        ? 'bg-indigo-600 text-white font-medium'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className="text-[10px] opacity-75 ml-1">{cat.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Questions List Column */}
        <div className="lg:col-span-3 space-y-4">
          {/* Active Filters Display */}
          {(selectedCategory !== 'All' ||
            selectedDifficulty !== 'All' ||
            selectedExperience !== 'All' ||
            selectedCompensation !== 'All') && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400">Active filters:</span>
              {selectedCategory !== 'All' && (
                <Badge variant="indigo">{selectedCategory}</Badge>
              )}
              {selectedDifficulty !== 'All' && (
                <Badge variant="warning">{selectedDifficulty}</Badge>
              )}
              {selectedExperience !== 'All' && (
                <Badge variant="neutral">{selectedExperience}</Badge>
              )}
              {selectedCompensation !== 'All' && (
                <Badge variant="success">{selectedCompensation}</Badge>
              )}
            </div>
          )}

          {/* Question Cards */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="p-5 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-10 w-full" />
                </Card>
              ))}
            </div>
          ) : questions.length === 0 ? (
            <Card className="p-12 text-center">
              <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No interview questions match your current filters
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try resetting your filters or searching for broader terms like Java, React, Kafka, or MySQL.
              </p>
            </Card>
          ) : (
            <div className="space-y-3.5">
              {questions.map((q) => {
                const isBookmarked = bookmarkedIds.has(q.id);
                return (
                  <Card
                    key={q.id}
                    hoverEffect
                    className="p-5 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="indigo">{q.category}</Badge>
                          <Badge
                            variant={
                              q.difficulty === 'Beginner'
                                ? 'neutral'
                                : q.difficulty === 'Intermediate'
                                ? 'primary'
                                : q.difficulty === 'Advanced'
                                ? 'warning'
                                : 'purple'
                            }
                          >
                            {q.difficulty}
                          </Badge>
                          <span className="text-[11px] text-slate-500">
                            {q.experienceLevel} • {q.targetCompensation}
                          </span>
                        </div>

                        <button
                          onClick={(e) => handleToggleBookmark(e, q.id)}
                          className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Bookmark for revision"
                        >
                          <Bookmark
                            className={`w-4 h-4 ${
                              isBookmarked ? 'fill-amber-500 text-amber-500' : ''
                            }`}
                          />
                        </button>
                      </div>

                      <Link to={`/questions/${q.slug}`} className="block">
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {q.title}
                        </h3>

                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-2 leading-relaxed">
                          {q.shortAnswer}
                        </p>
                      </Link>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                      <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{q.viewsCount || 42} views</span>
                        </span>
                        {q.tags && q.tags.length > 0 && (
                          <span className="hidden sm:inline text-slate-500 truncate max-w-xs">
                            Tags: {q.tags.slice(0, 3).join(', ')}
                          </span>
                        )}
                      </div>

                      <Link
                        to={`/questions/${q.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <span>View Model Answer</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
