import React from 'react';
import Editor from '@monaco-editor/react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Play, Send, RotateCcw, Copy, Check } from 'lucide-react';
import { Button } from '../common/Button';

interface MonacoCodeEditorProps {
  language: string;
  code: string;
  onChange: (value: string) => void;
  onRun: () => void;
  onSubmit: () => void;
  onReset: () => void;
  isRunning?: boolean;
  isSubmitting?: boolean;
  supportedLanguages?: { id: string; label: string }[];
  onLanguageChange?: (lang: string) => void;
}

export const MonacoCodeEditor: React.FC<MonacoCodeEditorProps> = ({
  language,
  code,
  onChange,
  onRun,
  onSubmit,
  onReset,
  isRunning = false,
  isSubmitting = false,
  supportedLanguages = [
    { id: 'javascript', label: 'JavaScript (Node.js)' },
    { id: 'typescript', label: 'TypeScript' },
    { id: 'python', label: 'Python 3' },
    { id: 'java', label: 'Java 21' },
    { id: 'cpp', label: 'C++ 20' },
  ],
  onLanguageChange,
}) => {
  const theme = useSelector((state: RootState) => state.theme.mode);
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const monacoLanguageMap: Record<string, string> = {
    javascript: 'javascript',
    typescript: 'typescript',
    python: 'python',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-md">
      {/* Editor Top Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          {onLanguageChange && (
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {supportedLanguages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.label}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={onReset}
            title="Reset to starter code"
            className="flex items-center gap-1 px-2 py-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <Button
            size="sm"
            variant="secondary"
            onClick={onRun}
            isLoading={isRunning}
            leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
          >
            Run Code
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={onSubmit}
            isLoading={isSubmitting}
            leftIcon={<Send className="w-3.5 h-3.5" />}
            className="bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            Submit
          </Button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 min-h-[300px]">
        <Editor
          height="100%"
          language={monacoLanguageMap[language] || 'javascript'}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          value={code}
          onChange={(val) => onChange(val || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
            formatOnPaste: true,
            cursorBlinking: 'smooth',
            bracketPairColorization: { enabled: true },
          }}
        />
      </div>
    </div>
  );
};
