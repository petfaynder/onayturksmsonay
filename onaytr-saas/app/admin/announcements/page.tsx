"use client";
import { useState, useEffect } from "react";
import { Megaphone, Plus, Trash2, Edit3, ToggleLeft, ToggleRight, Loader2, CheckCircle, XCircle, Save } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", content: "", isActive: true });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/announcements");
      const d = await r.json();
      setAnnouncements(d.announcements || []);
    } catch (e) {
      console.error("Hata:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg("");
    try {
      const url = "/api/admin/announcements";
      const method = editingId ? "PATCH" : "POST";
      const bodyData = editingId 
        ? { id: editingId, title: form.title, content: form.content, isActive: form.isActive }
        : { title: form.title, content: form.content, isActive: form.isActive };

      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (r.ok) {
        setMsg(editingId ? "Duyuru güncellendi!" : "Duyuru oluşturuldu!");
        setShowForm(false);
        setEditingId(null);
        setForm({ title: "", content: "", isActive: true });
        load();
      } else {
        const d = await r.json();
        setMsg(d.error || "Bir hata oluştu");
      }
    } catch (error) {
      setMsg("Bağlantı hatası oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (ann: Announcement) => {
    setEditingId(ann.id);
    setForm({ title: ann.title, content: ann.content, isActive: ann.isActive });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    await fetch("/api/admin/announcements", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !currentStatus }),
    });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu duyuruyu silmek istediğinizden emin misiniz?")) return;
    await fetch(`/api/admin/announcements?id=${id}`, { method: "DELETE" });
    load();
  };

  const cancelEdit = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ title: "", content: "", isActive: true });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 display-font flex items-center gap-3">
            <Megaphone className="h-8 w-8 text-teal-600" />
            Duyuru Yönetimi
          </h1>
          <p className="text-slate-500 mt-1">Kullanıcı paneli duyurularını ekleyin, düzenleyin ve yönetin.</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => { setShowForm(true); setEditingId(null); setForm({ title: "", content: "", isActive: true }); }} 
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Yeni Duyuru
          </button>
        )}
      </div>

      {msg && (
        <div className="mb-4 p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-700 font-semibold text-sm">
          {msg}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreateOrUpdate} className="glass-panel p-6 border border-white/60 rounded-2xl mb-8 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-slate-800 display-font">
            {editingId ? "Duyuruyu Düzenle" : "Yeni Duyuru Oluştur"}
          </h2>
          
          <div>
            <label className="text-sm font-bold text-slate-600 mb-1 block">Duyuru Başlığı *</label>
            <input 
              required 
              value={form.title} 
              onChange={e => setForm(f => ({...f, title: e.target.value}))} 
              placeholder="Örn: Sistem Bakımı Hakkında Duyuru" 
              className="w-full bg-white/80 border border-slate-200 focus:border-teal-400 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none" 
            />
          </div>
          
          <div>
            <label className="text-sm font-bold text-slate-600 mb-1 block">Duyuru İçeriği *</label>
            <textarea 
              required 
              rows={4}
              value={form.content} 
              onChange={e => setForm(f => ({...f, content: e.target.value}))} 
              placeholder="Kullanıcı panelinde yayınlanacak duyuru detayları..." 
              className="w-full bg-white/80 border border-slate-200 focus:border-teal-400 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none resize-y" 
            />
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="isActiveCheckbox"
              checked={form.isActive} 
              onChange={e => setForm(f => ({...f, isActive: e.target.checked}))}
              className="h-4 w-4 rounded border-slate-350 text-teal-600 focus:ring-teal-500"
            />
            <label htmlFor="isActiveCheckbox" className="text-sm font-bold text-slate-600 cursor-pointer select-none">
              Hemen yayına al (Aktif olsun)
            </label>
          </div>

          <div className="flex gap-3 mt-2">
            <button 
              type="submit" 
              disabled={submitting} 
              className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editingId ? (
                <><Save className="h-4 w-4" /> Güncelle</>
              ) : (
                <><Plus className="h-4 w-4" /> Oluştur</>
              )}
            </button>
            <button 
              type="button" 
              onClick={cancelEdit} 
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all cursor-pointer"
            >
              İptal
            </button>
          </div>
        </form>
      )}

      <div className="glass-panel border border-white/60 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/80 text-left">
              <th className="px-5 py-3 font-black text-slate-650 text-xs uppercase">Başlık</th>
              <th className="px-5 py-3 font-black text-slate-650 text-xs uppercase">İçerik</th>
              <th className="px-5 py-3 font-black text-slate-650 text-xs uppercase">Tarih</th>
              <th className="px-5 py-3 font-black text-slate-650 text-xs uppercase">Durum</th>
              <th className="px-5 py-3 font-black text-slate-650 text-xs uppercase">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="py-12 text-center text-slate-400">Yükleniyor...</td></tr>
            ) : announcements.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-slate-400">Henüz duyuru bulunmuyor.</td></tr>
            ) : announcements.map(ann => (
              <tr key={ann.id} className="border-t border-slate-100/80 hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3.5 font-bold text-slate-800 max-w-[200px] truncate">{ann.title}</td>
                <td className="px-5 py-3.5 text-slate-500 max-w-[320px] truncate">{ann.content}</td>
                <td className="px-5 py-3.5 text-slate-500 font-medium">
                  {new Date(ann.createdAt).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </td>
                <td className="px-5 py-3.5">
                  {ann.isActive ? (
                    <span className="flex items-center gap-1 text-teal-600 font-bold text-xs">
                      <CheckCircle className="h-3.5 w-3.5" /> Aktif
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-400 font-bold text-xs">
                      <XCircle className="h-3.5 w-3.5" /> Pasif
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5 flex items-center gap-2">
                  <button 
                    onClick={() => toggleActive(ann.id, ann.isActive)} 
                    title={ann.isActive ? "Pasifleştir" : "Etkinleştir"} 
                    className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 cursor-pointer"
                  >
                    {ann.isActive ? <ToggleRight className="h-5 w-5 text-teal-500" /> : <ToggleLeft className="h-5 w-5" />}
                  </button>
                  <button 
                    onClick={() => startEdit(ann)} 
                    title="Düzenle"
                    className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-blue-500 cursor-pointer"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(ann.id)} 
                    title="Sil"
                    className="p-1.5 rounded-lg hover:bg-rose-50 transition-colors text-rose-400 cursor-pointer"
                  >
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
