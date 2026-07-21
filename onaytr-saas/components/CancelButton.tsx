"use client";

import { useEffect, useState } from 'react';
import { Loader2, XCircle, Clock } from 'lucide-react';

interface CancelButtonProps {
  createdAt: string | Date;
  onCancel: () => void;
  isCancelling: boolean;
}

export default function CancelButton({ createdAt, onCancel, isCancelling }: CancelButtonProps) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const createdTime = new Date(createdAt).getTime();
      const now = Date.now();
      const diffMs = now - createdTime;
      const threeMinutesMs = 3 * 60 * 1000;
      const remainingMs = threeMinutesMs - diffMs;
      return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const rem = calculateTimeLeft();
      setTimeLeft(rem);
      if (rem <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [createdAt]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (timeLeft > 0) {
    return (
      <span 
        className="flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-100/80 px-2 py-1.5 rounded-lg border border-slate-200/50 cursor-not-allowed select-none"
        title="Numarayı iptal etmek için 3 dakika geçmesi gerekmektedir."
      >
        <Clock className="h-3 w-3" />
        İptal ({formatTime(timeLeft)})
      </span>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onCancel();
      }}
      disabled={isCancelling}
      className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-500 border border-rose-200/50 hover:border-rose-500 px-2 py-1.5 rounded-lg transition-all shadow-xs disabled:opacity-50"
    >
      {isCancelling ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <XCircle className="h-3.5 w-3.5" />
      )}
      İptal Et
    </button>
  );
}
