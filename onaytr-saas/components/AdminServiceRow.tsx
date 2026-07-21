"use client";

import { useState } from 'react';
import { CheckCircle2, Edit2, Loader2, Save, X, Ban, ShieldAlert, Layers } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminServiceRow({ service }: { service: any }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [margin5sim, setMargin5sim] = useState(service.margin5sim === null ? '' : service.margin5sim.toString());
  const [marginHerosms, setMarginHerosms] = useState(service.marginHerosms === null ? '' : service.marginHerosms.toString());
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async (updateData: any) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: service.id, ...updateData }),
      });
      if (res.ok) {
        router.refresh();
        setIsEditing(false);
      } else {
        alert("Bir hata oluştu");
      }
    } catch (e) {
      alert("Bağlantı hatası");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <tr className="border-b border-white/20 hover:bg-white/40 transition-colors">
      <td className="p-4">
        <Link 
          href={`/admin/services/${service.id}`}
          className="font-bold text-slate-800 hover:text-teal-600 transition-colors"
        >
          {service.name}
        </Link>
        <div className="text-xs text-slate-500">Kodu: {service.providerCode}</div>
      </td>
      <td className="p-4">
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
              <span>5Sim:</span>
              <input 
                type="number" 
                value={margin5sim} 
                onChange={(e) => setMargin5sim(e.target.value)}
                placeholder="Global"
                className="w-16 px-1.5 py-0.5 text-xs border border-teal-300 rounded outline-none"
              />
              <span>%</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
              <span>Hero:</span>
              <input 
                type="number" 
                value={marginHerosms} 
                onChange={(e) => setMarginHerosms(e.target.value)}
                placeholder="Global"
                className="w-16 px-1.5 py-0.5 text-xs border border-teal-300 rounded outline-none"
              />
              <span>%</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col text-xs gap-1 font-bold">
            <span className="text-teal-700">
              5Sim: {service.margin5sim !== null ? `%${service.margin5sim}` : <span className="text-slate-400 font-normal">Global</span>}
            </span>
            <span className="text-indigo-700">
              Hero: {service.marginHerosms !== null ? `%${service.marginHerosms}` : <span className="text-slate-400 font-normal">Global</span>}
            </span>
          </div>
        )}
      </td>
      <td className="p-4">
        {service.isActive ? (
          <span className="text-emerald-500 font-bold flex items-center gap-1 text-sm"><CheckCircle2 className="h-4 w-4"/> Aktif</span>
        ) : (
          <span className="text-rose-500 font-bold flex items-center gap-1 text-sm"><Ban className="h-4 w-4"/> Pasif</span>
        )}
      </td>
      <td className="p-4 text-right flex items-center justify-end gap-2">
        {isEditing ? (
          <>
            <button 
              onClick={() => handleUpdate({ margin5sim: margin5sim === '' ? null : margin5sim, marginHerosms: marginHerosms === '' ? null : marginHerosms })}
              disabled={isLoading}
              className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-sm transition-colors"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            </button>
            <button 
              onClick={() => { 
                setIsEditing(false); 
                setMargin5sim(service.margin5sim === null ? '' : service.margin5sim.toString()); 
                setMarginHerosms(service.marginHerosms === null ? '' : service.marginHerosms.toString()); 
              }}
              className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-lg shadow-sm transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button 
            onClick={() => setIsEditing(true)}
            className="p-2 bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-lg shadow-sm transition-colors"
            title="Özel Kâr Marjı Ayarla"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        )}

        <Link 
          href={`/admin/services/${service.id}`}
          className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg shadow-sm transition-colors"
          title="İstatistikler ve Detaylar"
        >
          <Layers className="h-4 w-4" />
        </Link>

        <button 
          onClick={() => handleUpdate({ isActive: !service.isActive })}
          disabled={isLoading}
          className={`p-2 rounded-lg shadow-sm transition-colors ${
            !service.isActive 
              ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700' 
              : 'bg-rose-100 hover:bg-rose-200 text-rose-700'
          }`}
          title={!service.isActive ? "Aktif Et" : "Kapat"}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : !service.isActive ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
        </button>
      </td>
    </tr>
  );
}
