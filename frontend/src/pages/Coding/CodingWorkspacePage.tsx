import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { codingService } from '../../services/api';
import { CodingProblem, ExecutionResult } from '../../types';
import { MonacoCodeEditor } from '../../components/editor/MonacoCodeEditor';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import {
  Code2,
  Play,
  Send,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  FileText,
  Terminal,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export const CodingWorkspacePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [problem, setProblem] = useState<CodingProblem | null>(null);
  const [loading, setLoading] = useState(true);

  // Left panel tab
  const [leftTab, setLeftTab] = useState<'description' | 'hints' | 'solution'>('description');

  // Language & Code state
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');

  // Runner state
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState(0);
  const [customInput, setCustomInput] = useState('');
  const [useCustomInput, setUseCustomInput] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [execResult, setExecResult] = useState<ExecutionResult | null>(null);
  const [bottomTab, setBottomTab] = useState<'testcases' | 'result'>('testcases');

  useEffect(() => {
    async function loadProblem() {
      if (!slug) return;
      setLoading(true);
      try {
        const p = await codingService.getProblem(slug);
        setProblem(p);
        // Default starter code
        const defaultCode =
          p.starterCode?.[language as keyof typeof p.starterCode] ||
          p.starterCode?.javascript ||
          '// Write your solution here\nfunction solve(input) {\n  \n}';
        setCode(defaultCode);
      } catch (err) {
        toast.error('Failed to load problem');
      } finally {
        setLoading(false);
      }
    }
    loadProblem();
  }, [slug]);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    if (problem?.starterCode) {
      const template =
        problem.starterCode[newLang as keyof typeof problem.starterCode] ||
        `// ${newLang} solution\n`;
      setCode(template);
    }
    toast.info(`Switched environment to ${newLang.toUpperCase()}`);
  };

  const handleReset = () => {
    if (problem?.starterCode) {
      const template =
        problem.starterCode[language as keyof typeof problem.starterCode] || '';
      setCode(template);
      toast.info('Reset code to starter template');
    }
  };

  const handleRunCode = async () => {
    if (!problem) return;
    setIsRunning(true);
    setBottomTab('result');
    try {
      const res = await codingService.runCode(problem.id, {
        language,
        code,
        customInput: useCustomInput ? customInput : undefined,
      });
      setExecResult(res);

      if (res.passed) {
        toast.success(`Passed all ${res.testCasesPassed} sample test cases!`);
      } else {
        toast.error(`Execution status: ${res.status}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Execution failed');
    } finally {
      setIsRunning(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!problem) return;
    setIsSubmitting(true);
    setBottomTab('result');
    try {
      const res = await codingService.submitCode(problem.id, {
        language,
        code,
      });
      setExecResult(res);

      if (res.passed) {
        toast.success('🎉 Solution Accepted! Problem solved!');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        toast.error(`Submission: ${res.status} (${res.testCasesPassed}/${res.totalTestCases} passed)`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Submission failed. Please login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
        <Skeleton className="h-full w-full rounded-xl" />
        <Skeleton className="h-full w-full rounded-xl" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold">Problem not found</h2>
        <Link to="/coding" className="text-indigo-600 mt-2 inline-block">
          Return to Coding Practice
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5.5rem)] -m-4 sm:-m-6 lg:-m-8">
      {/* Top Breadcrumb Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Link
            to="/coding"
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Problem List</span>
          </Link>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="font-bold text-slate-900 dark:text-white truncate">
            {problem.title}
          </span>
          <Badge
            variant={
              problem.difficulty === 'Easy'
                ? 'success'
                : problem.difficulty === 'Medium'
                ? 'warning'
                : 'danger'
            }
          >
            {problem.difficulty}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 hidden sm:inline">
            Acceptance: {problem.acceptanceRate}%
          </span>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0 overflow-hidden">
        {/* Left Column: Problem Description & Tabs (5 cols) */}
        <div className="lg:col-span-5 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center gap-1 px-4 py-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setLeftTab('description')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                leftTab === 'description'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Description</span>
            </button>
            <button
              onClick={() => setLeftTab('hints')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                leftTab === 'hints'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Hints ({problem.hints?.length || 0})</span>
            </button>
            <button
              onClick={() => setLeftTab('solution')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                leftTab === 'solution'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Solution</span>
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs sm:text-sm">
            {leftTab === 'description' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {problem.title}
                  </h2>
                  <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {problem.problemStatement}
                  </div>
                </div>

                {/* Sample Test Cases */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Examples
                  </h3>
                  {problem.sampleTestCases.map((tc, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1.5 font-mono text-xs"
                    >
                      <div className="text-slate-500 text-[11px] font-sans font-semibold">
                        Example {idx + 1}:
                      </div>
                      <div>
                        <span className="text-slate-400">Input: </span>
                        <span className="text-slate-800 dark:text-slate-200">{tc.input}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Output: </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {tc.output}
                        </span>
                      </div>
                      {tc.explanation && (
                        <div className="font-sans text-slate-500 text-[11px] pt-1">
                          Explanation: {tc.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                {problem.constraints && problem.constraints.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Constraints
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 font-mono text-xs">
                      {problem.constraints.map((c, idx) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Expected Complexity */}
                <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Target Complexity:</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    Time: {problem.expectedTimeComplexity} | Space: {problem.expectedSpaceComplexity}
                  </span>
                </div>
              </div>
            )}

            {leftTab === 'hints' && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Algorithmic Hints
                </h3>
                {problem.hints && problem.hints.length > 0 ? (
                  problem.hints.map((hint, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
                    >
                      <span className="font-bold text-amber-700 dark:text-amber-400 mr-1.5">
                        Hint {idx + 1}:
                      </span>
                      {hint}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500">No hints for this problem.</p>
                )}
              </div>
            )}

            {leftTab === 'solution' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Solution Analysis & Approach
                </h3>
                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {problem.solutionExplanation || 'Optimal solution utilizing hashing and two pointers.'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Monaco Editor + Test Cases Panel (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-slate-950 overflow-hidden">
          {/* Top: Monaco Editor (takes ~60% height) */}
          <div className="flex-1 min-h-[300px]">
            <MonacoCodeEditor
              language={language}
              code={code}
              onChange={setCode}
              onRun={handleRunCode}
              onSubmit={handleFinalSubmit}
              onReset={handleReset}
              isRunning={isRunning}
              isSubmitting={isSubmitting}
              onLanguageChange={handleLanguageChange}
            />
          </div>

          {/* Bottom: Test Cases & Execution Results Panel (takes ~40% height) */}
          <div className="h-64 flex flex-col bg-slate-900 border-t border-slate-800 text-xs">
            {/* Panel Tab Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBottomTab('testcases')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-colors ${
                    bottomTab === 'testcases'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Test Cases</span>
                </button>
                <button
                  onClick={() => setBottomTab('result')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-colors ${
                    bottomTab === 'result'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>
                    Execution Result{' '}
                    {execResult && (
                      <span
                        className={`ml-1 text-[10px] font-bold ${
                          execResult.passed ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        ({execResult.status})
                      </span>
                    )}
                  </span>
                </button>
              </div>

              {execResult && (
                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{execResult.runtimeMs}ms</span>
                  </span>
                  <span>
                    Memory: {execResult.memoryKb}KB
                  </span>
                </div>
              )}
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto p-4">
              {bottomTab === 'testcases' ? (
                <div className="space-y-3">
                  {/* Case selector pills */}
                  <div className="flex items-center gap-2">
                    {problem.sampleTestCases.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setUseCustomInput(false);
                          setActiveTestCaseIndex(idx);
                        }}
                        className={`px-3 py-1 rounded-lg font-mono text-xs transition-colors ${
                          !useCustomInput && activeTestCaseIndex === idx
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setUseCustomInput(true)}
                      className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                        useCustomInput
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Custom Input
                    </button>
                  </div>

                  {/* Selected Case I/O */}
                  {!useCustomInput ? (
                    <div className="space-y-2 font-mono text-xs">
                      <div>
                        <span className="text-slate-400 text-[11px]">Input = </span>
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 mt-1">
                          {problem.sampleTestCases[activeTestCaseIndex]?.input}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px]">Expected Output = </span>
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 mt-1 font-bold">
                          {problem.sampleTestCases[activeTestCaseIndex]?.output}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="text-slate-400 text-[11px]">Enter custom test input:</span>
                      <textarea
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder='e.g. {"nums": [2, 7, 11, 15], "target": 9}'
                        rows={3}
                        className="w-full mt-1.5 p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  )}
                </div>
              ) : (
                /* Execution Result Output */
                <div>
                  {!execResult ? (
                    <div className="text-center py-8 text-slate-500">
                      <Terminal className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p>Run code or Submit to view execution metrics and test results.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Status badge & summary */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                        <div className="flex items-center gap-2">
                          {execResult.passed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-400" />
                          )}
                          <span
                            className={`font-bold text-sm ${
                              execResult.passed ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {execResult.status}
                          </span>
                        </div>
                        <span className="font-mono text-xs text-slate-300">
                          {execResult.testCasesPassed} / {execResult.totalTestCases} Test Cases Passed
                        </span>
                      </div>

                      {/* Compilation or Runtime Error outputs */}
                      {execResult.compilationOutput && (
                        <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-900 text-rose-300 font-mono text-xs">
                          <div className="font-bold mb-1">Compilation Output:</div>
                          <pre className="whitespace-pre-wrap">{execResult.compilationOutput}</pre>
                        </div>
                      )}

                      {/* Test case breakdown */}
                      {execResult.testResults && execResult.testResults.length > 0 && (
                        <div className="space-y-2">
                          {execResult.testResults.map((tr) => (
                            <div
                              key={tr.testIndex}
                              className={`p-2.5 rounded-lg border font-mono text-xs ${
                                tr.passed
                                  ? 'bg-emerald-950/20 border-emerald-900/60 text-slate-200'
                                  : 'bg-rose-950/20 border-rose-900/60 text-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[11px] mb-1">
                                <span className="font-bold">Test Case {tr.testIndex}</span>
                                <span className={tr.passed ? 'text-emerald-400' : 'text-rose-400'}>
                                  {tr.passed ? 'PASSED' : 'FAILED'} ({tr.runtimeMs}ms)
                                </span>
                              </div>
                              <div className="text-[11px]">
                                <span className="text-slate-400">Actual: </span>
                                <span>{tr.actualOutput || 'none'}</span>
                              </div>
                              <div className="text-[11px]">
                                <span className="text-slate-400">Expected: </span>
                                <span className="text-emerald-400">{tr.expectedOutput}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
