"use client";

import { useState } from 'react';
import { CheckCircle2, Edit2, Loader2, Save, X, Ban } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminCountryRow({ country }: { country: any }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [margin5sim, setMargin5sim] = useState(country.margin5sim === null ? '' : country.margin5sim.toString());
  const [marginHerosms, setMarginHerosms] = useState(country.marginHerosms === null ? '' : country.marginHerosms.toString());
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async (updateData: any) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/countries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: country.id, ...updateData }),
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
      {/* Country Name */}
      <td className="p-4">
        <div className="font-bold text-slate-800 flex items-center gap-2">
          {country.name}
        </div>
        <div className="text-xs text-slate-500">Kodu: {country.providerCode}</div>
      </td>

      {/* 5Sim Margin */}
      <td className="p-4 font-black text-teal-600">
        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <input 
              type="number" 
              value={margin5sim} 
              onChange={(e) => setMargin5sim(e.target.value)}
              placeholder="Global"
              className="w-16 px-1.5 py-0.5 text-xs border border-teal-300 rounded outline-none"
            />
            <span>%</span>
          </div>
        ) : (
          country.margin5sim !== null ? `%${country.margin5sim}` : <span className="text-slate-400 font-normal text-xs">Global</span>
        )}
      </td>

      {/* HeroSMS Margin */}
      <td className="p-4 font-black text-indigo-600">
        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <input 
              type="number" 
              value={marginHerosms} 
              onChange={(e) => setMarginHerosms(e.target.value)}
              placeholder="Global"
              className="w-16 px-1.5 py-0.5 text-xs border border-indigo-300 rounded outline-none"
            />
            <span>%</span>
          </div>
        ) : (
          country.marginHerosms !== null ? `%${country.marginHerosms}` : <span className="text-slate-400 font-normal text-xs">Global</span>
        )}
      </td>

      {/* Status */}
      <td className="p-4">
        {country.isActive ? (
          <span className="text-emerald-500 font-bold flex items-center gap-1 text-sm"><CheckCircle2 className="h-4 w-4"/> Aktif</span>
        ) : (
          <span className="text-rose-500 font-bold flex items-center gap-1 text-sm"><Ban className="h-4 w-4"/> Pasif</span>
        )}
      </td>

      {/* Actions */}
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
                setMargin5sim(country.margin5sim === null ? '' : country.margin5sim.toString()); 
                setMarginHerosms(country.marginHerosms === null ? '' : country.marginHerosms.toString()); 
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

        <button 
          onClick={() => handleUpdate({ isActive: !country.isActive })}
          disabled={isLoading}
          className={`p-2 rounded-lg shadow-sm transition-colors ${
            !country.isActive 
              ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700' 
              : 'bg-rose-100 hover:bg-rose-200 text-rose-700'
          }`}
          title={!country.isActive ? "Aktif Et" : "Kapat"}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : !country.isActive ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
        </button>
      </td>
    </tr>
  );
}
