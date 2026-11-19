import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { systemDesignService } from '../../services/api';
import { SystemDesignTopic } from '../../types';
import { ArchitectureViewer } from '../../components/system-design/ArchitectureViewer';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import {
  Layers,
  CheckCircle2,
  AlertTriangle,
  Database,
  Globe,
  Shield,
  Zap,
  TrendingUp,
  Cpu,
  Server,
} from 'lucide-react';
import { toast } from 'sonner';

export const SystemDesignDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [topic, setTopic] = useState<SystemDesignTopic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTopic() {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await systemDesignService.getTopic(slug);
        setTopic(res);
      } catch (err) {
        toast.error('Failed to load system design blueprint');
      } finally {
        setLoading(false);
      }
    }
    loadTopic();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold">System design topic not found</h2>
        <Link to="/system-design" className="text-indigo-600 mt-2 inline-block">
          Return to System Design List
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Breadcrumbs
        items={[
          { label: 'System Design', href: '/system-design' },
          { label: topic.title },
        ]}
      />

      {/* Header Banner */}
      <Card className="p-6 sm:p-8 space-y-4 bg-gradient-to-br from-slate-900 to-indigo-950 text-white border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="purple">{topic.type}</Badge>
          <Badge variant="warning">{topic.difficulty}</Badge>
          <span className="text-xs text-slate-300 font-medium">
            Standard: {topic.experienceLevel}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {topic.title}
        </h1>

        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
          {topic.summary}
        </p>
      </Card>

      {/* 1. Requirements Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Functional Reqs */}
        <Card className="p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Functional Requirements</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            {topic.functionalRequirements?.map((req, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-indigo-500 font-bold">•</span>
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Non-Functional Reqs */}
        <Card className="p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <Shield className="w-4 h-4" />
            <span>Non-Functional Requirements</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            {topic.nonFunctionalRequirements?.map((req, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* 2. Capacity Estimations (Back-of-the-envelope calculations) */}
      {topic.capacityEstimation && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Back-of-the-Envelope Capacity Estimations
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
              <span className="text-slate-400 text-[11px] block">Daily Active Users:</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
                {topic.capacityEstimation.dau}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
              <span className="text-slate-400 text-[11px] block">Throughput (QPS):</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
                {topic.capacityEstimation.qps}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
              <span className="text-slate-400 text-[11px] block">5-Year Storage:</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
                {topic.capacityEstimation.storage5Years}
              </span>
            </div>
          </div>

          {topic.capacityEstimation.notes && (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">
              Note: {topic.capacityEstimation.notes}
            </p>
          )}
        </Card>
      )}

      {/* 3. Interactive Architecture Diagram & Component Breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
          Distributed Architecture & Data Flow
        </h3>
        <ArchitectureViewer
          layers={topic.architectureDiagram?.layers}
          components={topic.componentBreakdown}
          mermaidCode={topic.architectureDiagram?.content}
        />
      </div>

      {/* 4. Database Schema Design */}
      {topic.databaseSchema && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Database Schema & Partitioning Keys
            </h3>
          </div>

          <div className="space-y-4">
            {topic.databaseSchema.tables?.map((table, tIdx) => (
              <div key={tIdx} className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/60 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span>Table: {table.tableName}</span>
                  <span className="text-slate-400 font-normal">Primary: {table.primaryKey}</span>
                </div>
                <div className="p-3 text-xs overflow-x-auto">
                  <table className="w-full text-left font-mono">
                    <thead>
                      <tr className="text-slate-400 text-[11px] border-b border-slate-200 dark:border-slate-800">
                        <th className="pb-1">Column</th>
                        <th className="pb-1">Type</th>
                        <th className="pb-1">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                      {table.columns.map((col, cIdx) => (
                        <tr key={cIdx} className="text-slate-700 dark:text-slate-300">
                          <td className="py-1 font-semibold">{col.name}</td>
                          <td className="py-1 text-slate-400">{col.type}</td>
                          <td className="py-1">{col.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 5. API Design */}
      {topic.apiDesign && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              RESTful & RPC API Contract
            </h3>
          </div>

          <div className="space-y-3">
            {topic.apiDesign.map((api, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    api.method === 'GET'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : api.method === 'POST'
                      ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                      : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                  }`}>
                    {api.method}
                  </span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    {api.endpoint}
                  </span>
                  <span className="text-slate-500">— {api.description}</span>
                </div>

                {api.requestBody && (
                  <div>
                    <span className="text-[11px] text-slate-400">Request:</span>
                    <pre className="p-2 rounded bg-slate-900 text-slate-200 font-mono text-[11px] mt-0.5 overflow-x-auto">
                      {api.requestBody}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 6. Scaling Strategies & Failure Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <Zap className="w-4 h-4" />
            <span>Scaling & Optimization Strategies</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            {topic.scalingStrategy?.map((strategy, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-indigo-500 font-bold">•</span>
                <span>{strategy}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5 space-y-3 border-rose-200/60 dark:border-rose-950/60">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span>Failure Scenarios & Self-Healing</span>
          </h3>
          <div className="space-y-2.5 text-xs">
            {topic.failureScenarios?.map((fail, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/40">
                <div className="font-semibold text-rose-700 dark:text-rose-300 mb-0.5">
                  Scenario: {fail.scenario}
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-[11px]">
                  Mitigation: {fail.mitigation}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 7. Architectural Trade-offs & Interview Explanation */}
      {topic.tradeOffs && topic.tradeOffs.length > 0 && (
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Senior Architectural Trade-offs & Justifications
          </h3>

          <div className="space-y-3">
            {topic.tradeOffs.map((trade, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-slate-500">Choice: {trade.choiceA} vs {trade.choiceB}</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                    Chosen: {trade.selected}
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Reasoning: {trade.justification}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Interview Walkthrough Box */}
      {topic.interviewExplanation && (
        <Card className="p-6 bg-gradient-to-br from-indigo-50/60 to-white dark:from-slate-900 dark:to-indigo-950/30 border-indigo-200 dark:border-indigo-900">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-2">
            Interviewer Pitch & Delivery Strategy
          </h3>
          <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-medium">
            {topic.interviewExplanation}
          </p>
        </Card>
      )}
    </div>
  );
};
