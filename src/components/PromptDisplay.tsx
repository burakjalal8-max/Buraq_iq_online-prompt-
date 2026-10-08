import React, { useState } from 'react';
import {
  Copy,
  Check,
  Sparkles,
  Layers,
  Terminal,
  Share2,
  Download,
  Ratio,
  Maximize2,
  Tag,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { PromptAnalysisResult } from '../types';

interface PromptDisplayProps {
  data: PromptAnalysisResult;
  previewUrl: string;
  onReset: () => void;
  onShowToast: (msg: string) => void;
}

export const PromptDisplay: React.FC<PromptDisplayProps> = ({
  data,
  previewUrl,
  onReset,
  onShowToast,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [promptLengthMode, setPromptLengthMode] = useState<'detailed' | 'short'>('detailed');
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const copyToClipboard = async (text: string, key: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      onShowToast(`تم نسخ ${label} بنجاح!`);
      setTimeout(() => setCopiedKey(null), 2200);
    } catch {
      onShowToast('حدث خطأ أثناء النسخ');
    }
  };

  const handleDownloadText = () => {
    const content = `================================================
BURAQ IQ AI STUDIO - PROMPT EXTRACTION REPORT
================================================
العنوان / Title:
${data.title}

النسبة / Aspect Ratio: ${data.aspectRatio}
الوسوم / Style Tags: ${data.styleTags.join(', ')}

------------------------------------------------
1. ENGLISH PROMPT (DETAILED):
------------------------------------------------
${data.detailedPromptEn}

------------------------------------------------
2. ARABIC PROMPT (DETAILED / بالعربية):
------------------------------------------------
${data.detailedPromptAr}

------------------------------------------------
3. SHORT PROMPTS / البرومبت المختصر:
------------------------------------------------
[English]: ${data.shortPromptEn}
[العربية]: ${data.shortPromptAr}

------------------------------------------------
4. MIDJOURNEY COMMAND:
------------------------------------------------
${data.midjourneyCommand}

------------------------------------------------
5. FLUX PROMPT:
------------------------------------------------
${data.fluxPrompt}

------------------------------------------------
6. NEGATIVE PROMPT / البرومبت السلبي:
------------------------------------------------
[En]: ${data.negativePromptEn}
[Ar]: ${data.negativePromptAr}
================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buraq-iq-prompt-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('تم تحميل ملف البرومبت بنجاح');
  };

  const currentEnPrompt = promptLengthMode === 'detailed' ? data.detailedPromptEn : data.shortPromptEn;
  const currentArPrompt = promptLengthMode === 'detailed' ? data.detailedPromptAr : data.shortPromptAr;

  return (
    <div className="w-full flex flex-col gap-6 pb-24 sm:pb-12 animate-in fade-in slide-in-from-bottom-3 duration-500">
      {/* Top Banner with Image preview & summary */}
      <div className="glass-panel rounded-3xl p-4 sm:p-5 border border-amber-500/30 flex flex-col sm:flex-row items-center gap-4 shadow-xl">
        {/* Thumbnail with zoom click */}
        <div
          className="relative group w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-950 shrink-0 cursor-pointer border border-slate-700 shadow-md"
          onClick={() => setShowImageModal(true)}
          title="انقر لتكبير الصورة"
        >
          <img
            src={previewUrl}
            alt="الصورة المحللة"
            className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
          />
          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <Maximize2 className="w-5 h-5 text-white drop-shadow" />
          </div>
          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-slate-950/80 text-[10px] text-amber-300 font-english font-medium border border-amber-500/20">
            {data.aspectRatio || '1:1'}
          </span>
        </div>

        {/* Title and stats */}
        <div className="flex-1 flex flex-col text-center sm:text-right w-full">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-amber-400" />
              <span>تم استخراج البرومبت بنجاح</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
              <Ratio className="w-3 h-3 text-slate-400" />
              <span className="font-english">{data.aspectRatio || '1:1'}</span>
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-extrabold text-slate-100 mb-2">
            {data.title || 'تحليل الصورة المستخرجة'}
          </h2>

          {/* Quick Style Chips */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
            {data.styleTags?.slice(0, 4).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-900/90 text-slate-300 border border-slate-800"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Download & Actions on top */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
          <button
            onClick={handleDownloadText}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition active:scale-95"
            title="تنزيل كملف نصي TXT"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>تنزيل TXT</span>
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition active:scale-95"
          >
            <span>صورة أخرى</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher: Detailed vs Short */}
      <div className="flex items-center justify-between p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPromptLengthMode('detailed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              promptLengthMode === 'detailed'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>البرومبت المفصل (شامل ودقيق)</span>
          </button>

          <button
            onClick={() => setPromptLengthMode('short')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              promptLengthMode === 'short'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>البرومبت الموجز (سريع)</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400 px-3 hidden sm:inline">
          جاهز للنسخ في Midjourney و Flux و Stable Diffusion
        </span>
      </div>

      {/* Primary Display: Side-by-side or stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 1. ENGLISH PROMPT CARD */}
        <div className="glass-card rounded-3xl p-4 sm:p-5 border border-slate-800 flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/40 transition">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <h3 className="text-sm sm:text-base font-bold text-slate-100 font-english">
                English Prompt
              </h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-english border border-cyan-500/20 uppercase font-semibold">
                Midjourney / Flux / SD
              </span>
            </div>

            <button
              onClick={() => copyToClipboard(currentEnPrompt, 'en', 'البرومبت الإنجليزي')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
                copiedKey === 'en'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {copiedKey === 'en' ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>تم النسخ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الإنجليزي</span>
                </>
              )}
            </button>
          </div>

          {/* Content (in LTR for English perfection) */}
          <div
            dir="ltr"
            className="font-code text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950/80 rounded-2xl p-4 border border-slate-800/90 selection:bg-cyan-500/30 selection:text-cyan-200 select-all max-h-[280px] overflow-y-auto"
          >
            {currentEnPrompt}
          </div>

          {/* Footer details */}
          <div className="mt-3 pt-2.5 flex items-center justify-between text-[11px] text-slate-400 font-english" dir="ltr">
            <span>{currentEnPrompt.split(/\s+/).filter(Boolean).length} words • {currentEnPrompt.length} chars</span>
            <span className="text-cyan-400 font-medium">Ready for generation</span>
          </div>
        </div>

        {/* 2. ARABIC PROMPT CARD */}
        <div className="glass-card rounded-3xl p-4 sm:p-5 border border-slate-800 flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/40 transition">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <h3 className="text-sm sm:text-base font-bold text-slate-100">
                البرومبت باللغة العربية
              </h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                صياغة احترافية دقيقة
              </span>
            </div>

            <button
              onClick={() => copyToClipboard(currentArPrompt, 'ar', 'البرومبت العربي')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
                copiedKey === 'ar'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {copiedKey === 'ar' ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>تم النسخ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ العربي</span>
                </>
              )}
            </button>
          </div>

          {/* Content (Arabic RTL) */}
          <div className="font-tajawal text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950/80 rounded-2xl p-4 border border-slate-800/90 selection:bg-amber-500/30 selection:text-amber-200 select-all max-h-[280px] overflow-y-auto">
            {currentArPrompt}
          </div>

          {/* Footer details */}
          <div className="mt-3 pt-2.5 flex items-center justify-between text-[11px] text-slate-400">
            <span>{currentArPrompt.split(/\s+/).filter(Boolean).length} كلمة • {currentArPrompt.length} حرف</span>
            <span className="text-amber-400 font-medium">وصف شامل لكل عناصر ومكونات المشهد</span>
          </div>
        </div>
      </div>

      {/* Ready Commands Section (Midjourney & Flux) */}
      <div className="glass-card rounded-3xl p-4 sm:p-5 border border-slate-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-200">
              أوامر التوليد المباشرة (Ready Commands)
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Midjourney Command */}
          <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col justify-between gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-english font-bold text-amber-400">
                Midjourney v6.1 Command
              </span>
              <button
                onClick={() =>
                  copyToClipboard(data.midjourneyCommand || `/imagine prompt: ${data.detailedPromptEn} --ar ${data.aspectRatio || '16:9'} --v 6.1`, 'mj', 'أمر Midjourney')
                }
                className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-95 transition"
              >
                {copiedKey === 'mj' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>نسخ الأمر</span>
              </button>
            </div>
            <div dir="ltr" className="font-code text-[11px] text-slate-300 line-clamp-3 select-all">
              {data.midjourneyCommand || `/imagine prompt: ${data.detailedPromptEn} --ar ${data.aspectRatio || '16:9'} --v 6.1`}
            </div>
          </div>

          {/* Flux Prompt */}
          <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col justify-between gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-english font-bold text-cyan-400">
                Flux.1 (Dev / Schnell) Prompt
              </span>
              <button
                onClick={() => copyToClipboard(data.fluxPrompt || data.detailedPromptEn, 'flux', 'برومبت Flux')}
                className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-95 transition"
              >
                {copiedKey === 'flux' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>نسخ</span>
              </button>
            </div>
            <div dir="ltr" className="font-code text-[11px] text-slate-300 line-clamp-3 select-all">
              {data.fluxPrompt || data.detailedPromptEn}
            </div>
          </div>
        </div>
      </div>

      {/* Accordion for Technical Details & Negative Prompt */}
      <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full p-4 flex items-center justify-between text-right hover:bg-slate-800/40 transition"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-slate-200">
              تفاصيل فنية إضافية (البرومبت السلبي • العناصر الفكوكية • الوسوم)
            </span>
          </div>
          {showTechnicalDetails ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showTechnicalDetails && (
          <div className="p-4 pt-0 border-t border-slate-800/70 flex flex-col gap-4">
            {/* Key Visual Breakdown */}
            {data.keyElements && data.keyElements.length > 0 && (
              <div className="pt-3">
                <h4 className="text-xs font-bold text-slate-300 mb-2.5">
                  تفكيك العناصر البصرية للصورة:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {data.keyElements.map((el, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                      <span className="block text-xs font-bold text-amber-300 mb-1">{el.name}</span>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{el.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Negative Prompt */}
            <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/20 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-300">
                  البرومبت السلبي المقترح (Negative Prompt لتجنب العيوب والتشوه)
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(data.negativePromptEn, 'neg', 'البرومبت السلبي')
                  }
                  className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 transition"
                >
                  <Copy className="w-3 h-3" />
                  <span>نسخ</span>
                </button>
              </div>
              <p dir="ltr" className="font-code text-xs text-rose-200/90 selection:bg-rose-500/40">
                {data.negativePromptEn}
              </p>
              <p className="text-[11px] text-slate-400">
                {data.negativePromptAr}
              </p>
            </div>

            {/* All Style Tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              {data.styleTags?.map((tag, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-900 border border-slate-800 text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Bar for Mobile - Super handy when scrolling! */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800 sm:hidden">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <button
            onClick={() => copyToClipboard(currentEnPrompt, 'en-float', 'البرومبت الإنجليزي')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md transition active:scale-95"
          >
            {copiedKey === 'en-float' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>نسخ الإنجليزي</span>
          </button>

          <button
            onClick={() => copyToClipboard(currentArPrompt, 'ar-float', 'البرومبت العربي')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition active:scale-95"
          >
            {copiedKey === 'ar-float' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>نسخ العربي</span>
          </button>

          <button
            onClick={onReset}
            className="p-2.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 active:scale-95"
            title="صورة جديدة"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl border border-slate-700 shadow-2xl">
            <img
              src={previewUrl}
              alt="صورة مكبرة"
              className="w-full h-full object-contain max-h-[85vh]"
            />
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
