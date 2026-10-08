import React from 'react';
import { Sparkles, History, RotateCcw, Zap } from 'lucide-react';

interface HeaderProps {
  historyCount: number;
  onOpenHistory: () => void;
  onReset: () => void;
  hasResult: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  historyCount,
  onOpenHistory,
  onReset,
  hasResult,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 shadow-lg shadow-amber-500/20 text-slate-950 font-black">
            <Zap className="w-5 h-5 fill-slate-950 stroke-slate-950" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          </div>

          <div className="flex flex-col text-right">
            <div className="flex items-center gap-1.5">
              <span className="font-english font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent">
                BURAQ IQ
              </span>
              <span className="text-[10px] font-english px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-widest font-semibold">
                AI Studio
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              مستخرج برومبت الصور الذكي
            </span>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          {hasResult && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 transition active:scale-95"
              title="تحليل صورة جديدة"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">صورة جديدة</span>
            </button>
          )}

          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/70 transition active:scale-95"
            title="سجل الصور المحللة"
          >
            <History className="w-4 h-4 text-amber-400" />
            <span>السجل</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
