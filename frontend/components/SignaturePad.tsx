
import React, { useRef, useEffect, useState } from 'react';
import { Trash2, X } from 'lucide-react';

interface Props {
  onSave: (signature: string | null) => void;
  initialValue: string | null;
}

export const SignaturePad: React.FC<Props> = ({ onSave, initialValue }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Function to initialize/re-render signature on canvas
  const renderInitialSignature = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    if (initialValue) {
      const img = new Image();
      img.onload = () => {
        // Clear before drawing initial to avoid overlaps if re-rendered
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.offsetWidth, canvas.offsetHeight);
      };
      img.src = initialValue;
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Scale for high resolution
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    ctx.scale(ratio, ratio);
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    renderInitialSignature(ctx, canvas);
  }, [initialValue]); // Re-run if initialValue changes externally (e.g. form reset)

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL());
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath(); // Reset drawing path
      onSave(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative border-2 border-dashed border-gray-300 rounded-lg bg-white overflow-hidden h-40">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseMove={draw}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchEnd={stopDrawing}
          onTouchMove={draw}
          className="w-full h-full cursor-crosshair touch-none"
        />
        {(initialValue || isDrawing) && (
          <button 
            onClick={clear}
            className="absolute top-2 left-2 p-1.5 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors shadow-sm"
            title="مسح التوقيع"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <p className="text-[10px] text-gray-400 text-center italic">وقع داخل المربع أعلاه</p>
    </div>
  );
};
