import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { PromptDisplay } from './components/PromptDisplay';
import { HistoryDrawer } from './components/HistoryDrawer';
import { Toast } from './components/Toast';
import { PromptAnalysisResult, SavedAnalysis } from './types';
import { Sparkles, ArrowDown, ShieldCheck, Zap, Globe, Smartphone, HelpCircle } from 'lucide-react';

const STORAGE_KEY = 'buraq_iq_prompt_history';

export default function App() {
  const [selectedImage, setSelectedImage] = useState<{
    base64: string;
    mimeType: string;
    previewUrl: string;
  } | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PromptAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [history, setHistory] = useState<SavedAnalysis[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load history', e);
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = (imageUrl: string, data: PromptAnalysisResult) => {
    try {
      const newItem: SavedAnalysis = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        imageUrl,
        data,
      };
      const updated = [newItem, ...history.filter((h) => h.data.detailedPromptEn !== data.detailedPromptEn)].slice(0, 20);
      setHistory(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage limit reached', e);
    }
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleStartAnalysis = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage.base64,
          mimeType: selectedImage.mimeType,
        }),
      });

      const resJson = await response.json();

      if (!response.ok || !resJson.success) {
        throw new Error(resJson.error || 'حدث خطأ أثناء معالجة الصورة.');
      }

      setAnalysisResult(resJson.data);
      saveToHistory(selectedImage.previewUrl, resJson.data);
      showToast('تم استخراج البرومبت بنجاح باللغتين العربية والإنجليزية!');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'تعذر الاتصال بالخادم، يرجى المحاولة مرة أخرى.');
      showToast(err.message || 'فشل استخراج البرومبت', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setErrorMsg(null);
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    showToast('تم حذف العنصر من السجل');
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
    showToast('تم مسح السجل بالكامل');
  };

  const handleSelectHistoryItem = (item: SavedAnalysis) => {
    setSelectedImage({
      base64: '',
      mimeType: 'image/jpeg',
      previewUrl: item.imageUrl,
    });
    setAnalysisResult(item.data);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-tajawal selection:bg-amber-500/30 selection:text-amber-200">
      {/* Toast Alert */}
      <Toast message={toastMsg} type={toastType} />

      {/* Main Top Header */}
      <Header
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onReset={handleReset}
        hasResult={Boolean(analysisResult || selectedImage)}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8 flex flex-col items-center">
        {/* Hero Section (compact & focused) */}
        {!analysisResult && (
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 flex flex-col items-center animate-in fade-in duration-300">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Buraq IQ Vision Prompt Engine</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl font-black text-slate-100 tracking-tight leading-tight mb-2.5">
              ارفع أي صورة واحصل على{' '}
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 bg-clip-text text-transparent">
                البرومبت الاحترافي
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-base text-slate-400 max-w-lg leading-relaxed">
              تحليل فوري دقيق يمنحك البرومبت باللغة <strong className="text-slate-200">الإنجليزية</strong> لبرامج التوليد وباللغة <strong className="text-slate-200">العربية</strong> لفهم تفاصيل المشهد بالكامل.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                <Globe className="w-3 h-3 text-amber-400" />
                <span>إنجليزي + عربي فقط</span>
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Midjourney & Flux & SD</span>
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                <Smartphone className="w-3 h-3 text-amber-400" />
                <span>مصمم ومثالي للهاتف</span>
              </span>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="w-full mb-4 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-xs underline hover:text-white"
            >
              إغلاق
            </button>
          </div>
        )}

        {/* Dynamic State: Either Uploader or PromptDisplay */}
        {!analysisResult ? (
          <div className="w-full max-w-xl">
            <ImageUploader
              onImageSelected={(data) => {
                setSelectedImage(data);
                setErrorMsg(null);
              }}
              selectedPreview={selectedImage?.previewUrl || null}
              onClear={handleReset}
              isAnalyzing={isAnalyzing}
              onStartAnalysis={handleStartAnalysis}
            />
          </div>
        ) : (
          <PromptDisplay
            data={analysisResult}
            previewUrl={selectedImage?.previewUrl || ''}
            onReset={handleReset}
            onShowToast={(msg) => showToast(msg)}
          />
        )}
      </main>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={handleSelectHistoryItem}
        onDelete={handleDeleteHistoryItem}
        onClearAll={handleClearHistory}
      />

      {/* Minimal Footer */}
      <footer className="w-full py-4 border-t border-slate-900 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-english">
            <span>Buraq IQ AI Studio</span>
            <span>•</span>
            <span className="text-amber-500/80">Reverse Prompt Intelligence</span>
          </div>
          <span className="text-[11px] text-slate-400">
            مخصص ومناسب لجميع أبعاد الهواتف الذكية والأجهزة اللوحية والكمبيوتر
          </span>
        </div>
      </footer>
    </div>
  );
}
