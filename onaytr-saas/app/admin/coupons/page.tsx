"use client";
import { useState, useEffect } from "react";
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight, Loader2, CheckCircle, XCircle } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  minAmount: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  description: string | null;
  createdAt: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", type: "PERCENT", value: "", minAmount: "", maxUses: "", expiresAt: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/admin/coupons");
    const d = await r.json();
    setCoupons(d.coupons || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg("");
    try {
      const r = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          type: form.type,
          value: +form.value,
          minAmount: form.minAmount ? +form.minAmount : 0,
          maxUses: form.maxUses ? +form.maxUses : null,
          expiresAt: form.expiresAt || null,
          description: form.description || null,
        }),
      });
      if (r.ok) { setMsg("Kupon oluşturuldu!"); setShowForm(false); setForm({ code: "", type: "PERCENT", value: "", minAmount: "", maxUses: "", expiresAt: "", description: "" }); load(); }
      else { const d = await r.json(); setMsg(d.error || "Hata"); }
    } finally { setSubmitting(false); }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch("/api/admin/coupons", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, isActive: !isActive }) });
    load();
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("Kuponu silmek istediginizden emin misiniz?")) return;
    await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 display-font flex items-center gap-3"><Tag className="h-8 w-8 text-teal-600" />Kuponlar</h1>
          <p className="text-slate-500 mt-1">Promosyon ve indirim kodlarini yonetin.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md">
          <Plus className="h-4 w-4" /> Yeni Kupon
        </button>
      </div>

      {msg && <div className="mb-4 p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-700 font-semibold text-sm">{msg}</div>}

      {showForm && (
        <form onSubmit={handleCreate} className="glass-panel p-6 border border-white/60 rounded-2xl mb-8 grid grid-cols-2 gap-4">
          <div><label className="text-sm font-bold text-slate-600 mb-1 block">Kupon Kodu *</label>
            <input required value={form.code} onChange={e => setForm(f => ({...f, code: e.target.value.toUpperCase()}))} placeholder="YENI10" className="w-full bg-white/80 border border-white rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-teal-400 uppercase" /></div>
          <div><label className="text-sm font-bold text-slate-600 mb-1 block">Tip *</label>
            <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))} className="w-full bg-white/80 border border-white rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none">
              <option value="PERCENT">Yuzde (%)</option>
              <option value="FIXED">Sabit (TL)</option>
            </select></div>
          <div><label className="text-sm font-bold text-slate-600 mb-1 block">Deger *</label>
            <input required type="number" value={form.value} onChange={e => setForm(f => ({...f, value: e.target.value}))} placeholder={form.type === "PERCENT" ? "10 (yuzde)" : "25 (TL)"} className="w-full bg-white/80 border border-white rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-teal-400" /></div>
          <div><label className="text-sm font-bold text-slate-600 mb-1 block">Min. Yükleme (TL)</label>
            <input type="number" value={form.minAmount} onChange={e => setForm(f => ({...f, minAmount: e.target.value}))} placeholder="0" className="w-full bg-white/80 border border-white rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-teal-400" /></div>
          <div><label className="text-sm font-bold text-slate-600 mb-1 block">Maks. Kullanim</label>
            <input type="number" value={form.maxUses} onChange={e => setForm(f => ({...f, maxUses: e.target.value}))} placeholder="Sinirsiz" className="w-full bg-white/80 border border-white rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-teal-400" /></div>
          <div><label className="text-sm font-bold text-slate-600 mb-1 block">Son Kullanim</label>
            <input type="date" value={form.expiresAt} onChange={e => setForm(f => ({...f, expiresAt: e.target.value}))} className="w-full bg-white/80 border border-white rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-teal-400" /></div>
          <div className="col-span-2"><label className="text-sm font-bold text-slate-600 mb-1 block">Aciklama</label>
            <input value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Yilbasi kampanyasi..." className="w-full bg-white/80 border border-white rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-teal-400" /></div>
          <div className="col-span-2 flex gap-3">
            <button type="submit" disabled={submitting} className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> Olustur</>}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all">Iptal</button>
          </div>
        </form>
      )}

      <div className="glass-panel border border-white/60 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/80 text-left">
              <th className="px-5 py-3 font-black text-slate-600 text-xs uppercase">Kod</th>
              <th className="px-5 py-3 font-black text-slate-600 text-xs uppercase">Deger</th>
              <th className="px-5 py-3 font-black text-slate-600 text-xs uppercase">Min.</th>
              <th className="px-5 py-3 font-black text-slate-600 text-xs uppercase">Kullanim</th>
              <th className="px-5 py-3 font-black text-slate-600 text-xs uppercase">Son Tarih</th>
              <th className="px-5 py-3 font-black text-slate-600 text-xs uppercase">Durum</th>
              <th className="px-5 py-3 font-black text-slate-600 text-xs uppercase">Islemler</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="py-12 text-center text-slate-400">Yukleniyor...</td></tr>
            ) : coupons.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-slate-400">Henuz kupon yok.</td></tr>
            ) : coupons.map(c => (
              <tr key={c.id} className="border-t border-slate-100/80 hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3.5 font-black text-slate-800 font-mono tracking-widest">{c.code}</td>
                <td className="px-5 py-3.5 font-bold text-teal-600">{c.type === "PERCENT" ? `%${c.value}` : `${c.value}TL`}</td>
                <td className="px-5 py-3.5 text-slate-500">{c.minAmount > 0 ? `${c.minAmount}TL` : "-"}</td>
                <td className="px-5 py-3.5 text-slate-600 font-medium">{c.usedCount}/{c.maxUses ?? "Sinirsiz"}</td>
                <td className="px-5 py-3.5 text-slate-500">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("tr-TR") : "-"}</td>
                <td className="px-5 py-3.5">
                  {c.isActive ? <span className="flex items-center gap-1 text-teal-600 font-bold text-xs"><CheckCircle className="h-3.5 w-3.5" />Aktif</span>
                    : <span className="flex items-center gap-1 text-slate-400 font-bold text-xs"><XCircle className="h-3.5 w-3.5" />Pasif</span>}
                </td>
                <td className="px-5 py-3.5 flex items-center gap-2">
                  <button onClick={() => toggleActive(c.id, c.isActive)} title={c.isActive ? "Devre Disi" : "Etkinlestir"} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500">
                    {c.isActive ? <ToggleRight className="h-5 w-5 text-teal-500" /> : <ToggleLeft className="h-5 w-5" />}
                  </button>
                  <button onClick={() => deleteCoupon(c.id)} className="p-1.5 rounded-lg hover:bg-rose-50 transition-colors text-rose-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}