import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { codingService } from '../../services/api';
import { CodingProblem } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { Pagination } from '../../components/common/Pagination';
import {
  Code2,
  Search,
  Filter,
  Layers,
  Database,
  Cpu,
  Boxes,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

const TECH_CATEGORIES = new Set([
  'Node.js',
  'React.js',
  'JavaScript',
  'Core Java',
  'Advanced Java',
  'Spring Boot',
  'Java Coding Challenges',
  'JavaScript Coding Challenges',
]);

const DB_CATEGORIES = new Set([
  'MySQL',
  'PostgreSQL',
  'MSSQL',
  'SQL Coding Challenges',
]);

export const CodingListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [activeGroup, setActiveGroup] = useState<'all' | 'tech' | 'db' | 'dsa'>('all');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await codingService.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error(err);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function loadProblems() {
      setLoading(true);
      try {
        const res = await codingService.getProblems({
          category: selectedCategory,
          difficulty: selectedDifficulty,
          search: searchQuery,
          page,
          limit: 20,
        });
        setProblems(res.items);
        setTotal(res.total);
        setTotalPages(res.totalPages || Math.ceil(res.total / 20) || 1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProblems();
  }, [selectedCategory, selectedDifficulty, searchQuery, page]);

  // Grouped categories for quick navigation
  const visibleCategories = useMemo(() => {
    if (activeGroup === 'tech') {
      return categories.filter((c) => TECH_CATEGORIES.has(c.name));
    }
    if (activeGroup === 'db') {
      return categories.filter((c) => DB_CATEGORIES.has(c.name));
    }
    if (activeGroup === 'dsa') {
      return categories.filter((c) => !TECH_CATEGORIES.has(c.name) && !DB_CATEGORIES.has(c.name));
    }
    return categories;
  }, [categories, activeGroup]);

  // Counts for tabs
  const groupCounts = useMemo(() => {
    let tech = 0;
    let db = 0;
    let dsa = 0;
    let totalAll = 0;
    for (const c of categories) {
      totalAll += c.count;
      if (TECH_CATEGORIES.has(c.name)) tech += c.count;
      else if (DB_CATEGORIES.has(c.name)) db += c.count;
      else dsa += c.count;
    }
    return { all: totalAll, tech, db, dsa };
  }, [categories]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Coding Interview Practice</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-semibold">
              {groupCounts.all > 0 ? `${groupCounts.all}+ Challenges` : 'Challenges'}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Solve curated challenges across Node.js, React, Java, Spring Boot, Databases, and Core DSA with Monaco Editor.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search problems by name..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>
      </div>

      {/* Category Grouping Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs sm:text-sm overflow-x-auto">
        <button
          onClick={() => setActiveGroup('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
            activeGroup === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Topics</span>
          <span className="text-[11px] opacity-75">({groupCounts.all})</span>
        </button>

        <button
          onClick={() => setActiveGroup('tech')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
            activeGroup === 'tech'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Languages & Frameworks</span>
          <span className="text-[11px] opacity-75">({groupCounts.tech})</span>
        </button>

        <button
          onClick={() => setActiveGroup('db')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
            activeGroup === 'db'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Databases</span>
          <span className="text-[11px] opacity-75">({groupCounts.db})</span>
        </button>

        <button
          onClick={() => setActiveGroup('dsa')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
            activeGroup === 'dsa'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Algorithms & DSA</span>
          <span className="text-[11px] opacity-75">({groupCounts.dsa})</span>
        </button>
      </div>

      {/* Filter Bar with Pills */}
      <div className="space-y-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shadow-sm">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setSelectedCategory('All');
              setPage(1);
            }}
            className={`px-3 py-1 rounded-lg transition-colors font-semibold ${
              selectedCategory === 'All'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All
          </button>
          {visibleCategories.map((c) => (
            <button
              key={c.name}
              onClick={() => {
                setSelectedCategory(c.name);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                selectedCategory === c.name
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {c.name} <span className="text-[11px] opacity-70">({c.count})</span>
            </button>
          ))}
        </div>

        {/* Secondary Filters: Difficulty */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
              Difficulty:
            </span>
            {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => {
                  setSelectedDifficulty(diff);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  selectedDifficulty === diff
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Category: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{selectedCategory}</span>
            {' • '}
            <span>{total} challenges available</span>
          </div>
        </div>
      </div>

      {/* Problem Table / Cards */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : problems.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Code2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No coding problems found matching your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4"># & Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">Complexity</th>
                  <th className="py-3 px-4">Acceptance</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {problems.map((p, idx) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      <Link
                        to={`/coding/${p.slug}`}
                        className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-2"
                      >
                        <span className="text-slate-400 font-normal w-9 text-right tabular-nums">
                          {(page - 1) * 20 + idx + 1}.
                        </span>
                        <span>{p.title}</span>
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="neutral">{p.category}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          p.difficulty === 'Easy'
                            ? 'success'
                            : p.difficulty === 'Medium'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {p.difficulty}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-500">
                      Time: {p.expectedTimeComplexity} | Space: {p.expectedSpaceComplexity}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600 dark:text-slate-400">
                      {p.acceptanceRate}%
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link to={`/coding/${p.slug}`}>
                        <Button size="sm" variant="secondary" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
                          Solve
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          pageSize={20}
          onPageChange={(p) => {
            setPage(p);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </Card>
    </div>
  );
};
