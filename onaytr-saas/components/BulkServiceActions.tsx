"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Percent, Loader2, Save } from 'lucide-react';

export default function BulkServiceActions() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // 5sim bulk margin state
  const [margin5simVal, setMargin5simVal] = useState('');
  const [show5simInput, setShow5simInput] = useState(false);

  // HeroSMS bulk margin state
  const [marginHerosmsVal, setMarginHerosmsVal] = useState('');
  const [showHerosmsInput, setShowHerosmsInput] = useState(false);

  const handleBulkActive = async (isActive: boolean) => {
    const confirmMsg = `Tüm servisleri toplu olarak ${isActive ? 'AKTİF' : 'PASİF'} yapmak istediğinize emin misiniz?`;
    if (!confirm(confirmMsg)) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: 'all', isActive }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Toplu işlem sırasında bir hata oluştu.");
      }
    } catch (e) {
      alert("Bağlantı hatası oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkMargin = async (e: React.FormEvent, provider: '5sim' | 'herosms') => {
    e.preventDefault();
    const val = provider === '5sim' ? margin5simVal : marginHerosmsVal;
    if (val === undefined) return;

    const confirmMsg = `Tüm servislerin ${provider === '5sim' ? '5Sim' : 'HeroSMS'} özel kâr oranını %${val || 'global (temizle)'} yapmak istediğinize emin misiniz?`;
    if (!confirm(confirmMsg)) return;

    setIsLoading(true);
    try {
      const parsedMargin = val.toLowerCase() === 'global' || val === '' ? null : val;
      const payload: any = { ids: 'all' };
      if (provider === '5sim') {
        payload.margin5sim = parsedMargin;
      } else {
        payload.marginHerosms = parsedMargin;
      }

      const res = await fetch('/api/admin/services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        if (provider === '5sim') {
          setMargin5simVal('');
          setShow5simInput(false);
        } else {
          setMarginHerosmsVal('');
          setShowHerosmsInput(false);
        }
        router.refresh();
      } else {
        alert("Toplu kâr oranı güncellemesi başarısız.");
      }
    } catch (e) {
      alert("Bağlantı hatası oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Bulk Status Toggles */}
      <button
        onClick={() => handleBulkActive(true)}
        disabled={isLoading}
        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-100 hover:bg-emerald-200 disabled:opacity-50 text-emerald-700 text-sm font-bold rounded-xl transition-colors shadow-sm"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        Tümünü Aktif Et
      </button>
      <button
        onClick={() => handleBulkActive(false)}
        disabled={isLoading}
        className="flex items-center gap-1.5 px-3 py-2 bg-rose-100 hover:bg-rose-200 disabled:opacity-50 text-rose-700 text-sm font-bold rounded-xl transition-colors shadow-sm"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
        Tümünü Pasif Et
      </button>

      {/* 5sim Bulk Margin Input/Button */}
      {show5simInput ? (
        <form onSubmit={(e) => handleBulkMargin(e, '5sim')} className="flex items-center gap-2 animate-in slide-in-from-left duration-200">
          <div className="relative flex items-center">
            <span className="absolute left-2.5 text-teal-650 text-xs font-black">5Sim %</span>
            <input
              type="text"
              value={margin5simVal}
              onChange={(e) => setMargin5simVal(e.target.value)}
              placeholder="Oran veya 'global'"
              className="w-40 pl-14 pr-3 py-2 bg-white border border-teal-200 focus:border-teal-400 rounded-xl text-slate-800 text-sm outline-none shadow-sm font-bold"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="p-2 bg-teal-550 hover:bg-teal-600 text-white rounded-xl shadow-sm transition-colors"
            title="Uygula"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setShow5simInput(false)}
            className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-xl shadow-sm transition-colors"
            title="İptal"
          >
            <X className="h-4 w-4" />
          </button>
        </form>
      ) : (
        <button
          onClick={() => {
            setShow5simInput(true);
            setShowHerosmsInput(false);
          }}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-2 bg-teal-50 hover:bg-teal-100 disabled:opacity-50 text-teal-700 text-sm font-bold rounded-xl transition-colors shadow-sm"
        >
          <Percent className="h-4 w-4" />
          5Sim Toplu Kâr Ayarla
        </button>
      )}

      {/* HeroSMS Bulk Margin Input/Button */}
      {showHerosmsInput ? (
        <form onSubmit={(e) => handleBulkMargin(e, 'herosms')} className="flex items-center gap-2 animate-in slide-in-from-left duration-200">
          <div className="relative flex items-center">
            <span className="absolute left-2.5 text-indigo-650 text-xs font-black">Hero %</span>
            <input
              type="text"
              value={marginHerosmsVal}
              onChange={(e) => setMarginHerosmsVal(e.target.value)}
              placeholder="Oran veya 'global'"
              className="w-40 pl-14 pr-3 py-2 bg-white border border-indigo-200 focus:border-indigo-400 rounded-xl text-slate-800 text-sm outline-none shadow-sm font-bold"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="p-2 bg-indigo-550 hover:bg-indigo-600 text-white rounded-xl shadow-sm transition-colors"
            title="Uygula"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setShowHerosmsInput(false)}
            className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-xl shadow-sm transition-colors"
            title="İptal"
          >
            <X className="h-4 w-4" />
          </button>
        </form>
      ) : (
        <button
          onClick={() => {
            setShowHerosmsInput(true);
            setShow5simInput(false);
          }}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 text-indigo-700 text-sm font-bold rounded-xl transition-colors shadow-sm"
        >
          <Percent className="h-4 w-4" />
          HeroSMS Toplu Kâr Ayarla
        </button>
      )}
    </div>
  );
}
