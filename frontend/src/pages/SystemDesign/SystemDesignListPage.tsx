import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { systemDesignService } from '../../services/api';
import { SystemDesignTopic } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { Layers, Server, Database, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const SystemDesignListPage: React.FC = () => {
  const [topics, setTopics] = useState<SystemDesignTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    async function loadTopics() {
      setLoading(true);
      try {
        const res = await systemDesignService.getTopics(filterType);
        setTopics(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTopics();
  }, [filterType]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border border-purple-900/40 text-white shadow-md">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>High-Level & Low-Level Design</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            System Design Interview Architecture Blueprints
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Master real-world high-throughput distributed systems: capacity estimations, component partitioning, failure scenarios, and trade-offs.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
        {['All', 'Real-World System', 'High-Level Design', 'Low-Level Design'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterType === type
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Grid of System Design Topics */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topics.map((t) => (
            <Card key={t.id} hoverEffect className="p-6 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="purple">{t.type}</Badge>
                  <span className="text-xs text-slate-400">
                    {t.difficulty} • {t.experienceLevel}
                  </span>
                </div>

                <Link to={`/system-design/${t.slug}`}>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {t.title}
                  </h3>
                </Link>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                  {t.summary}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Architecture, Schema, APIs & Scaling</span>
                </span>
                <Link to={`/system-design/${t.slug}`}>
                  <Button size="sm" variant="secondary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Explore Design
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
