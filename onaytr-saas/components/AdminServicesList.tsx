"use client";

import { useState, useEffect } from 'react';
import { CheckCircle2, Edit2, Loader2, Save, X, Ban, GripVertical, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Service {
  id: string;
  name: string;
  logoUrl: string | null;
  isActive: boolean;
  margin5sim: number | null;
  marginHerosms: number | null;
  sortOrder: number;
  providerCode: string;
}

export default function AdminServicesList({ initialServices }: { initialServices: Service[] }) {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>(initialServices);
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMargin5sim, setEditMargin5sim] = useState('');
  const [editMarginHerosms, setEditMarginHerosms] = useState('');
  const [rowLoadingId, setRowLoadingId] = useState<string | null>(null);

  // Sync state if initialServices change
  useEffect(() => {
    setServices(initialServices);
  }, [initialServices]);

  // Filter services by search query
  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.providerCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (searchQuery) {
      e.preventDefault();
      return;
    }
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...services];
    const [draggedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, draggedItem);

    // Re-calculate sortOrder sequential
    const updated = reordered.map((item, idx) => ({
      ...item,
      sortOrder: idx + 1
    }));

    setServices(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);

    // Save ordering to API
    try {
      await fetch('/api/admin/services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sortOrders: updated.map(s => ({ id: s.id, sortOrder: s.sortOrder }))
        })
      });
      router.refresh();
    } catch (e) {
      console.error("Order save failed:", e);
      alert("Sıralama kaydedilemedi");
    }
  };

  const handleUpdate = async (id: string, updateData: any) => {
    setRowLoadingId(id);
    try {
      const res = await fetch('/api/admin/services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updateData }),
      });
      if (res.ok) {
        router.refresh();
        setEditingId(null);
      } else {
        alert("Bir hata oluştu");
      }
    } catch (e) {
      alert("Bağlantı hatası");
    } finally {
      setRowLoadingId(null);
    }
  };

  const isEditingAll = editingId === 'all';
  const isLoading = rowLoadingId !== null;

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="text-sm font-bold text-slate-500">
          {filteredServices.length} adet servis gösteriliyor
        </div>
      </div>

      <div className="glass-panel overflow-hidden border border-white/60 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/40 border-b border-white/60 text-slate-600 text-sm font-bold">
                <th className="p-4 w-12">Sıra</th>
                <th className="p-4">Servis</th>
                <th className="p-4">5Sim Kâr (%)</th>
                <th className="p-4">HeroSMS Kâr (%)</th>
                <th className="p-4">Durum</th>
                <th className="p-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((service, index) => {
                const isEditing = editingId === service.id;
                const isRowLoading = rowLoadingId === service.id;

                return (
                  <tr 
                    key={service.id}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`border-b border-white/20 hover:bg-white/40 transition-colors ${
                      dragOverIndex === index ? 'bg-teal-50/50 border-t-2 border-t-teal-400' : ''
                    } ${draggedIndex === index ? 'opacity-40' : ''}`}
                  >
                    {/* Drag Handle */}
                    <td className="p-4 align-middle">
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        className={`drag-handle p-1 hover:bg-slate-100 rounded cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 ${
                          searchQuery ? 'opacity-30 cursor-not-allowed' : ''
                        }`}
                        title={searchQuery ? "Arama yaparken sıralama değiştirilemez" : "Sürükle bırak"}
                      >
                        <GripVertical className="h-5 w-5" />
                      </div>
                    </td>

                    {/* Service Name */}
                    <td className="p-4">
                      <div className="font-bold text-slate-800 flex items-center gap-2">
                        {service.name}
                      </div>
                      <div className="text-xs text-slate-500">Kodu: {service.providerCode}</div>
                    </td>

                    {/* 5Sim Margin */}
                    <td className="p-4 font-black text-teal-600">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input 
                            type="number" 
                            value={editMargin5sim} 
                            onChange={(e) => setEditMargin5sim(e.target.value)}
                            placeholder="Global"
                            className="w-16 px-1.5 py-0.5 text-xs border border-teal-300 rounded outline-none"
                          />
                          <span>%</span>
                        </div>
                      ) : (
                        service.margin5sim !== null ? `%${service.margin5sim}` : <span className="text-slate-400 font-normal text-xs">Global</span>
                      )}
                    </td>

                    {/* HeroSMS Margin */}
                    <td className="p-4 font-black text-indigo-600">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input 
                            type="number" 
                            value={editMarginHerosms} 
                            onChange={(e) => setEditMarginHerosms(e.target.value)}
                            placeholder="Global"
                            className="w-16 px-1.5 py-0.5 text-xs border border-indigo-300 rounded outline-none"
                          />
                          <span>%</span>
                        </div>
                      ) : (
                        service.marginHerosms !== null ? `%${service.marginHerosms}` : <span className="text-slate-400 font-normal text-xs">Global</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      {service.isActive ? (
                        <span className="text-emerald-500 font-bold flex items-center gap-1 text-sm">
                          <CheckCircle2 className="h-4 w-4"/> Aktif
                        </span>
                      ) : (
                        <span className="text-rose-500 font-bold flex items-center gap-1 text-sm">
                          <Ban className="h-4 w-4"/> Pasif
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right flex items-center justify-end gap-2">
                      {isEditing ? (
                        <>
                          <button 
                            onClick={() => handleUpdate(service.id, { 
                              margin5sim: editMargin5sim === '' ? null : editMargin5sim, 
                              marginHerosms: editMarginHerosms === '' ? null : editMarginHerosms 
                            })}
                            disabled={isLoading}
                            className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-sm transition-colors"
                          >
                            {isRowLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          </button>
                          <button 
                            onClick={() => { 
                              setEditingId(null); 
                              setEditMargin5sim(service.margin5sim === null ? '' : service.margin5sim.toString()); 
                              setEditMarginHerosms(service.marginHerosms === null ? '' : service.marginHerosms.toString()); 
                            }}
                            className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-lg shadow-sm transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => { 
                            setEditingId(service.id); 
                            setEditMargin5sim(service.margin5sim === null ? '' : service.margin5sim.toString()); 
                            setEditMarginHerosms(service.marginHerosms === null ? '' : service.marginHerosms.toString()); 
                          }}
                          className="p-2 bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-lg shadow-sm transition-colors"
                          title="Özel Kâr Marjı Ayarla"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}

                      <button 
                        onClick={() => handleUpdate(service.id, { isActive: !service.isActive })}
                        disabled={isLoading}
                        className={`p-2 rounded-lg shadow-sm transition-colors ${
                          !service.isActive 
                            ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700' 
                            : 'bg-rose-100 hover:bg-rose-200 text-rose-700'
                        }`}
                        title={!service.isActive ? "Aktif Et" : "Kapat"}
                      >
                        {isRowLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : !service.isActive ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                      </button>

                      <button
                        onClick={() => router.push(`/admin/services/${service.id}`)}
                        className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg shadow-sm transition-colors"
                        title="İstatistikler ve Fiyat Listesi"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              
              {filteredServices.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-bold">
                    Servis bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
