import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Camera, Image as ImageIcon, Sparkles, X, Wand2, Compass } from 'lucide-react';
import { optimizeImageForUpload, urlToBase64 } from '../utils/imageUtils';

interface SampleItem {
  id: string;
  title: string;
  category: string;
  url: string;
}

const SAMPLE_IMAGES: SampleItem[] = [
  {
    id: 'cyberpunk-neon',
    title: 'مدينة مستقبلية وسايبربانك',
    category: 'خيال علمي',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'cosmic-aurora',
    title: 'أضواء الشفق القطبي الكوني',
    category: 'طبيعة ساحرة',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'luxury-architecture',
    title: 'فيلا معمارية مودرن وإضاءة دافئة',
    category: 'عمارة وديكور',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'portrait-lighting',
    title: 'بورتريه سينمائي احترافي',
    category: 'تصوير واستوديو',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
  },
];

interface ImageUploaderProps {
  onImageSelected: (data: { base64: string; mimeType: string; previewUrl: string }) => void;
  selectedPreview: string | null;
  onClear: () => void;
  isAnalyzing: boolean;
  onStartAnalysis: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  selectedPreview,
  onClear,
  isAnalyzing,
  onStartAnalysis,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [loadingSample, setLoadingSample] = useState<string | null>(null);
  const [processError, setProcessError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Global paste event listener for quick Ctrl+V on desktop or mobile clipboards
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleFileProcess(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleFileProcess = async (file: File) => {
    setProcessError(null);
    try {
      if (!file.type.startsWith('image/')) {
        setProcessError('يرجى اختيار ملف صورة صالح (PNG, JPEG, WebP).');
        return;
      }

      const { base64, mimeType } = await optimizeImageForUpload(file);
      const previewUrl = `data:${mimeType};base64,${base64}`;
      onImageSelected({ base64, mimeType, previewUrl });
    } catch (err: any) {
      console.error(err);
      setProcessError('تعذر معالجة هذه الصورة، يرجى تجربة صورة أخرى.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = async (sample: SampleItem) => {
    setLoadingSample(sample.id);
    setProcessError(null);
    try {
      const res = await urlToBase64(sample.url);
      onImageSelected({
        base64: res.base64,
        mimeType: res.mimeType,
        previewUrl: res.dataUrl,
      });
    } catch (err) {
      console.error(err);
      setProcessError('تعذر تحميل الصورة النموذجية. جرب رفع صورة من جهازك.');
    } finally {
      setLoadingSample(null);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileProcess(e.target.files[0]);
          }
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileProcess(e.target.files[0]);
          }
        }}
      />

      {/* Main Upload Area */}
      {!selectedPreview ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative group rounded-3xl transition-all duration-300 border-2 border-dashed p-6 sm:p-10 flex flex-col items-center justify-center text-center cursor-pointer ${
            isDragging
              ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
              : 'border-slate-800 hover:border-amber-500/40 bg-slate-900/40 hover:bg-slate-900/70'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          {/* Glowing Aura Effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none" />

          {/* Central Icon Circle */}
          <div className="relative mb-4 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/60 shadow-xl group-hover:border-amber-500/50 group-hover:shadow-amber-500/10 transition">
            <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 group-hover:scale-110 transition duration-300" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-md">
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
            </div>
          </div>

          <h3 className="text-base sm:text-xl font-bold text-slate-100 mb-1.5 flex items-center gap-2">
            <span>ارفع أي صورة لاستخراج البرومبت</span>
          </h3>

          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mb-5 leading-relaxed">
            انقر هنا للاختيار من جهازك، أو اسحب الصورة وأفلتها، أو الصق من الحافظة (Ctrl+V)
          </p>

          {/* Action buttons for mobile / desktop */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition"
            >
              <ImageIcon className="w-4 h-4" />
              <span>اختيار صورة</span>
            </button>

            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95 transition"
              title="التقاط صورة بكاميرا الهاتف"
            >
              <Camera className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">الكاميرا</span>
            </button>
          </div>

          <div className="mt-4 text-[11px] text-slate-400 font-english">
            يدعم JPG • PNG • WebP • دقة عالية
          </div>
        </div>
      ) : (
        /* Preview with Action Confirmation */
        <div className="relative rounded-3xl overflow-hidden glass-card border border-amber-500/30 p-3 sm:p-4 flex flex-col gap-3.5 shadow-2xl shadow-amber-500/5">
          {/* Image Container with controls */}
          <div className="relative w-full max-h-[380px] sm:max-h-[460px] rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800">
            <img
              src={selectedPreview}
              alt="صورة للتحليل"
              className="w-full h-auto max-h-[380px] sm:max-h-[460px] object-contain rounded-xl"
            />

            {/* Clear Button */}
            {!isAnalyzing && (
              <button
                type="button"
                onClick={onClear}
                className="absolute top-3 left-3 p-2 rounded-xl bg-slate-900/80 hover:bg-rose-950/80 text-slate-200 hover:text-rose-300 border border-slate-700/80 backdrop-blur-md transition active:scale-90"
                title="إلغاء واختيار صورة أخرى"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Status Overlay when analyzing */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
                  </div>
                </div>
                <h4 className="text-base font-bold text-amber-300 mb-1">
                  جاري تفكيك الصورة بالذكاء الاصطناعي...
                </h4>
                <p className="text-xs text-slate-400 max-w-xs">
                  يقوم محرك Buraq IQ بقراءة الكاميرا، الألوان، النمط، والإضاءة لصياغة البرومبت بالإنجليزية والعربية
                </p>
              </div>
            )}
          </div>

          {/* Prompt Extraction Trigger */}
          {!isAnalyzing && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
              <div className="flex items-center gap-2 text-xs text-slate-300 px-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>الصورة جاهزة للتحليل الفوري</span>
              </div>

              <button
                type="button"
                onClick={onStartAnalysis}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-98 transition"
              >
                <Wand2 className="w-4 h-4 stroke-[2.5]" />
                <span>استخراج البرومبت الآن (عربي وإنجليزي)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error Notice */}
      {processError && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <span>⚠️</span>
          <span>{processError}</span>
        </div>
      )}

      {/* Preset Quick Samples (Great for instant mobile demonstration!) */}
      {!selectedPreview && (
        <div className="flex flex-col gap-2 pt-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>أو جرّب إحدى الصور الجاهزة للاختبار فوراً:</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {SAMPLE_IMAGES.map((sample) => (
              <button
                key={sample.id}
                type="button"
                disabled={loadingSample !== null}
                onClick={() => handleSelectSample(sample)}
                className="group relative flex flex-col rounded-2xl overflow-hidden border border-slate-800 hover:border-amber-500/50 bg-slate-900/60 p-1.5 transition text-right active:scale-95 disabled:opacity-50"
              >
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-950">
                  <img
                    src={sample.url}
                    alt={sample.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    loading="lazy"
                  />
                  {loadingSample === sample.id && (
                    <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-xs text-[9px] font-medium text-amber-300 border border-amber-500/20">
                    {sample.category}
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-300 group-hover:text-amber-300 mt-1.5 px-1 truncate w-full">
                  {sample.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
