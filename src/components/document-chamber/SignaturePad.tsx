import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Eraser } from 'lucide-react';
import { Button } from '../ui/Button';

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
  signerName?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSave,
  onCancel,
  signerName = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasStroke, setHasStroke] = useState(false);

  const getPoint = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPoint(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasStroke(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPoint(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => setIsDrawing(false);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasStroke(false);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 560;
    canvas.height = 200;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasStroke) return;
    onSave(canvas.toDataURL('image/png'));
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Draw your signature below. This is a demo e-signature — not legally binding.
      </p>
      <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white overflow-hidden touch-none">
        <canvas
          ref={canvasRef}
          className="w-full h-[200px] cursor-crosshair"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>
      {signerName && (
        <p className="text-xs text-gray-500">
          Signing as: <span className="font-medium text-gray-800">{signerName}</span>
        </p>
      )}
      <div className="flex flex-wrap justify-between gap-2">
        <Button type="button" variant="outline" size="sm" leftIcon={<Eraser size={16} />} onClick={clear}>
          Clear
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={!hasStroke}>
            Apply signature
          </Button>
        </div>
      </div>
    </div>
  );
};
