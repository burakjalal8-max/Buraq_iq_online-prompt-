import React from 'react';
import { X, Trash2, ArrowRight, ExternalLink, Calendar, Copy, Check } from 'lucide-react';
import { SavedAnalysis } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: SavedAnalysis[];
  onSelect: (item: SavedAnalysis) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelect,
  onDelete,
  onClearAll,
}) => {
  if (!isOpen) return null;

  const formatDate = (timestamp: number) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }) + ' • ' + date.toLocaleDateString('ar-IQ', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-950 border-r sm:border-l border-slate-800 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100">
                سجل البرومبتات السابقة
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-xs font-semibold">
                {history.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {history.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition"
                  title="مسح الكل"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <span className="text-4xl mb-3">🖼️</span>
                <p className="text-sm font-medium text-slate-400 mb-1">
                  لا يوجد صور محللة بعد في السجل
                </p>
                <p className="text-xs text-slate-500 max-w-xs">
                  عند رفع أي صورة واستخراج البرومبت لها، سيتم حفظها هنا للرجوع إليها لاحقاً.
                </p>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="group relative p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-amber-500/40 transition flex items-start gap-3 cursor-pointer"
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  {/* Thumbnail */}
                  <img
                    src={item.imageUrl}
                    alt={item.data.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-950 border border-slate-800"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-200 truncate mb-1">
                      {item.data.title || 'صورة مستخرجة'}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2 font-english" dir="ltr">
                      {item.data.shortPromptEn || item.data.detailedPromptEn}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{formatDate(item.timestamp)}</span>
                      <span className="text-amber-400 font-medium">عرض البرومبت ←</span>
                    </div>
                  </div>

                  {/* Delete Item */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                    title="حذف من السجل"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
