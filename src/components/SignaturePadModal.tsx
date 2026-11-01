import React, { useRef, useEffect } from 'react';
import SignaturePad from 'signature_pad';
import { X, Check, RotateCcw, PenTool } from 'lucide-react';

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureDataUrl: string) => void;
  initialSignature?: string;
}

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const padRef = useRef<SignaturePad | null>(null);

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    
    // Set actual canvas internal dimensions matching display
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(ratio, ratio);
    }

    const pad = new SignaturePad(canvas, {
      minWidth: 1.5,
      maxWidth: 3.5,
      penColor: '#0f172a',
      backgroundColor: 'rgba(255, 255, 255, 0)', // Transparent background for realistic stamp/signature
    });

    padRef.current = pad;

    return () => {
      pad.off();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClear = () => {
    padRef.current?.clear();
  };

  const handleSave = () => {
    if (!padRef.current || padRef.current.isEmpty()) {
      alert('يرجى التوقيع أولاً أو الضغط على إلغاء');
      return;
    }
    const dataUrl = padRef.current.toDataURL('image/png');
    onSave(dataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        dir="rtl"
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800">
            <PenTool className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold">لوحة التوقيع الرقمي للمستلم</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-500 my-3">
          ارسم التوقيع أدناه باستخدام الفأرة، شاشة اللمس، أو قلم الهاتف/اللوح:
        </p>

        {/* Signature Pad Area */}
        <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 relative overflow-hidden h-52 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="w-full h-full touch-none cursor-crosshair"
          />
          <div className="absolute bottom-3 left-4 text-xs text-slate-400 pointer-events-none">
            منطقة التوقيع الإلكتروني
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 mt-6">
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            مسح وإعادة
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all"
            >
              <Check className="w-4 h-4" />
              حفظ التوقيع
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
