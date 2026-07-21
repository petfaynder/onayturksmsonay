"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { LifeBuoy, Send, Loader2, Clock, CheckCircle2, MessageSquare, AlertCircle, User, ShieldAlert, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminTicketsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const dbUser = session?.user as any;

  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Reply Form
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      if (dbUser.role !== 'ADMIN') {
        router.push('/');
      } else {
        fetchTickets();
      }
    }
  }, [status]);

  const fetchTickets = async (selectId?: string) => {
    try {
      const res = await fetch('/api/admin/tickets');
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
        
        // Keep selected ticket updated
        if (selectedTicket || selectId) {
          const idToFind = selectId || selectedTicket.id;
          const updated = data.tickets.find((t: any) => t.id === idToFind);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText || !selectedTicket) return;

    setIsReplying(true);
    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Yanıt gönderilemedi.');

      setReplyText('');
      await fetchTickets(); // Refresh replies
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsReplying(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedTicket) return;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/tickets/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Durum güncellenemedi.');

      await fetchTickets();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusBadge = (statusStr: string) => {
    switch (statusStr) {
      case 'OPEN':
        return <span className="px-2.5 py-1 bg-sky-50 text-sky-600 border border-sky-100 rounded-full text-xs font-black tracking-wider uppercase">Müşteri Yanıtı</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-xs font-black tracking-wider uppercase">Biz Yanıtladık</span>;
      case 'RESOLVED':
        return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-xs font-black tracking-wider uppercase">Çözüldü</span>;
      case 'CLOSED':
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-500 border border-slate-200 rounded-full text-xs font-black tracking-wider uppercase">Kapandı</span>;
      default:
        return null;
    }
  };

  if (isLoading || status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <span className="text-slate-500 font-bold">Destek talepleri yükleniyor...</span>
      </div>
    );
  }

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter === 'ALL') return true;
    return t.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-800 display-font">Destek Talepleri Yönetimi</h1>
        <p className="text-slate-500 mt-1">Kullanıcılardan gelen destek taleplerini yanıtlayın ve bilet durumlarını yönetin.</p>
      </div>

      {/* Filter Options */}
      <div className="flex flex-wrap gap-2">
        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((filter) => (
          <button
            key={filter}
            onClick={() => setStatusFilter(filter)}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
              statusFilter === filter
                ? 'bg-teal-600 border-teal-500 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {filter === 'ALL' && 'Tümü'}
            {filter === 'OPEN' && 'Müşteri Yanıtları'}
            {filter === 'IN_PROGRESS' && 'Yanıtladıklarımız'}
            {filter === 'RESOLVED' && 'Çözüldü'}
            {filter === 'CLOSED' && 'Kapandı'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Ticket List Panel */}
        <div className="glass-panel p-5 border border-white/60 flex flex-col h-full lg:col-span-1">
          <h2 className="text-lg font-black text-slate-800 display-font mb-4 flex items-center gap-2">
            <span className="bg-teal-100 text-teal-600 p-1.5 rounded-lg"><MessageSquare className="h-4 w-4" /></span>
            Bilet Listesi ({filteredTickets.length})
          </h2>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm font-bold">
                Bu filtreye uygun destek talebi bulunmuyor.
              </div>
            ) : (
              filteredTickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`w-full p-4 rounded-2xl border transition-all duration-200 text-left ${
                      isSelected
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white border-teal-400 shadow-[0_4px_12px_rgba(13,148,136,0.2)]'
                        : 'bg-white/80 border-white hover:border-teal-100 hover:bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-black text-sm truncate max-w-[150px]">{t.subject}</span>
                      {getStatusBadge(t.status)}
                    </div>
                    <div className={`text-xs font-semibold mb-1 ${isSelected ? 'text-teal-100' : 'text-slate-500'}`}>
                      Gönderen: {t.user?.email}
                    </div>
                    <p className={`text-xs truncate mb-2 ${isSelected ? 'text-teal-100/80' : 'text-slate-400'}`}>{t.message}</p>
                    <span className={`text-[10px] font-bold block ${isSelected ? 'text-teal-100/70' : 'text-slate-400'}`}>
                      {new Date(t.createdAt).toLocaleDateString('tr-TR')} - {new Date(t.createdAt).toLocaleTimeString('tr-TR')}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Reply & Thread Panel */}
        <div className="glass-panel p-6 border border-white/60 flex flex-col h-full lg:col-span-2 relative overflow-hidden">
          
          {selectedTicket ? (
            <div className="flex flex-col h-full">
              {/* Ticket Top bar */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 shrink-0">
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">MÜŞTERİ: {selectedTicket.user?.email}</span>
                  <h2 className="text-lg font-black text-slate-800 display-font">{selectedTicket.subject}</h2>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedTicket.status)}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 mb-4 p-2 bg-slate-50 border border-slate-100 rounded-xl shrink-0">
                 <span className="text-xs font-bold text-slate-500 ml-2">Durum Değiştir:</span>
                 <button 
                   onClick={() => handleUpdateStatus('RESOLVED')}
                   disabled={isUpdatingStatus}
                   className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 flex items-center gap-1 transition-all"
                 >
                   <Check className="h-3.5 w-3.5" /> Çözüldü Yap
                 </button>
                 <button 
                   onClick={() => handleUpdateStatus('CLOSED')}
                   disabled={isUpdatingStatus}
                   className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 flex items-center gap-1 transition-all"
                 >
                   Kapandı Yap
                 </button>
              </div>

              {/* Message scroll thread */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
                
                {/* Original Ticket Description */}
                <div className="flex items-start gap-3 justify-start max-w-[80%]">
                  <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-600 shrink-0 uppercase shadow-sm">
                    U
                  </div>
                  <div className="bg-slate-100 border border-slate-200/50 p-4 rounded-3xl rounded-tl-none shadow-sm text-left">
                     <p className="text-sm text-slate-800 leading-relaxed font-medium">{selectedTicket.message}</p>
                     <span className="block text-[8px] text-slate-400 font-bold mt-2">
                       {new Date(selectedTicket.createdAt).toLocaleTimeString('tr-TR')}
                     </span>
                  </div>
                </div>

                {/* Ticket Replies */}
                {selectedTicket.replies?.map((reply: any) => {
                  const isReplyAdmin = reply.isAdmin;
                  return (
                    <div 
                      key={reply.id} 
                      className={`flex items-start gap-3 max-w-[80%] ${
                        isReplyAdmin ? 'ml-auto justify-end' : 'justify-start'
                      }`}
                    >
                      {!isReplyAdmin && (
                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-600 shrink-0 uppercase shadow-sm">
                          U
                        </div>
                      )}
                      <div className={`p-4 rounded-3xl shadow-sm text-left ${
                        isReplyAdmin 
                          ? 'bg-teal-500 text-white rounded-tr-none' 
                          : 'bg-slate-100 border border-slate-200/50 rounded-tl-none'
                      }`}>
                         <p className="text-sm leading-relaxed font-medium">{reply.message}</p>
                         <span className={`block text-[8px] mt-2 font-bold ${isReplyAdmin ? 'text-teal-100' : 'text-slate-400'}`}>
                           {isReplyAdmin ? 'Siz (Destek Ekibi)' : 'Kullanıcı'} • {new Date(reply.createdAt).toLocaleTimeString('tr-TR')}
                         </span>
                      </div>
                      {isReplyAdmin && (
                        <div className="h-8 w-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-black text-xs shrink-0 shadow-sm border border-teal-200">
                          DS
                        </div>
                      )}
                    </div>
                  );
                })}

              </div>

              {/* Ticket Input form */}
              <form onSubmit={handleSendReply} className="flex gap-2 items-center border-t border-slate-100 pt-4 shrink-0">
                <input
                  type="text"
                  required
                  placeholder="Kullanıcıya yanıt gönderin..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-4 py-3.5 bg-slate-50 border border-slate-200 focus:border-teal-400 rounded-xl text-sm outline-none transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={isReplying || !replyText}
                  className="p-3.5 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 text-white rounded-xl transition-all shadow-md flex items-center justify-center shrink-0"
                >
                  {isReplying ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </button>
              </form>
            </div>
          ) : (
            /* Placeholder */
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-4 gap-2">
              <LifeBuoy className="h-12 w-12 text-slate-300 animate-float" style={{ animationDuration: '6s' }} />
              <span className="font-bold text-sm">Lütfen soldaki bilet listesinden işlem yapmak istediğiniz destek biletini seçin.</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
