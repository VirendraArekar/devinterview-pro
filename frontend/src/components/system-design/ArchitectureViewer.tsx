import React, { useState } from 'react';
import { Layers, Server, Database, Shield, Zap } from 'lucide-react';
import clsx from 'clsx';

interface Layer {
  name: string;
  components: string[];
  description: string;
}

interface ComponentDetail {
  name: string;
  role: string;
  techStack: string;
  scalabilityNotes: string;
}

interface ArchitectureViewerProps {
  layers?: Layer[];
  components?: ComponentDetail[];
  mermaidCode?: string;
}

export const ArchitectureViewer: React.FC<ArchitectureViewerProps> = ({
  layers = [],
  components = [],
  mermaidCode,
}) => {
  const [activeTab, setActiveTab] = useState<'layers' | 'components' | 'raw'>('layers');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Tab controls */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-slate-300">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>System Architecture Breakdown</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('layers')}
            className={clsx(
              'px-2.5 py-1 rounded-md transition-colors',
              activeTab === 'layers'
                ? 'bg-indigo-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200',
            )}
          >
            Tiered Layers
          </button>
          <button
            onClick={() => setActiveTab('components')}
            className={clsx(
              'px-2.5 py-1 rounded-md transition-colors',
              activeTab === 'components'
                ? 'bg-indigo-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200',
            )}
          >
            Components ({components.length})
          </button>
          {mermaidCode && (
            <button
              onClick={() => setActiveTab('raw')}
              className={clsx(
                'px-2.5 py-1 rounded-md transition-colors',
                activeTab === 'raw'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200',
              )}
            >
              Mermaid Blueprint
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Tiered Layers Visual */}
      {activeTab === 'layers' && (
        <div className="p-4 space-y-3">
          {layers.map((layer, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/80 transition-all hover:border-indigo-500/50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  {layer.name}
                </span>
                <span className="text-[10px] text-slate-400">Tier {idx + 1}</span>
              </div>
              <p className="text-xs text-slate-300 mb-2.5">{layer.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {layer.components.map((comp, cIdx) => (
                  <span
                    key={cIdx}
                    className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-slate-900 text-indigo-300 border border-slate-700"
                  >
                    {comp}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Components Deep Dive */}
      {activeTab === 'components' && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {components.map((comp, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/80 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-sm font-semibold text-slate-100">{comp.name}</h4>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                    {comp.techStack}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mb-3">{comp.role}</p>
              </div>
              <div className="pt-2 border-t border-slate-700/60 text-[11px] text-slate-400 flex items-start gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>{comp.scalabilityNotes}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Mermaid Blueprint code */}
      {activeTab === 'raw' && mermaidCode && (
        <div className="p-4 bg-slate-950">
          <pre className="text-xs text-indigo-300 font-mono overflow-x-auto whitespace-pre leading-relaxed p-3 bg-slate-900 rounded-lg border border-slate-800">
            {mermaidCode}
          </pre>
        </div>
      )}
    </div>
  );
};
