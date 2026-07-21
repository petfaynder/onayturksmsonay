"use client";

import { useState } from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/admin/sync', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        router.refresh();
      } else {
        alert("Hata: " + data.error);
      }
    } catch (e) {
      alert("Senkronizasyon başarısız.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <button 
      onClick={handleSync}
      disabled={isSyncing}
      className="p-2.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white rounded-xl shadow-md transition-all flex items-center gap-2 font-bold text-sm whitespace-nowrap"
    >
      {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
      <span className="hidden sm:inline">{isSyncing ? 'Senkronize Ediliyor...' : '5sim Senkronize Et'}</span>
    </button>
  );
}
