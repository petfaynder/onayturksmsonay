"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { LifeBuoy, Send, Loader2, Clock, CheckCircle2, MessageSquare, AlertCircle, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastProvider';
import { useLanguage } from '@/components/LanguageProvider';

export default function SupportPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const { showToast, showAlert } = useToast();
  const { t, language } = useLanguage();

  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // New Ticket Form
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reply Form
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  // View toggle for mobile
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchTickets();
    }
  }, [status]);

  const fetchTickets = async (selectId?: string) => {
    try {
      const res = await fetch('/api/tickets');
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
        
        // Keep selected ticket updated if it was selected
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

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Talep oluşturulamadı.');

      setSubject('');
      setMessage('');
      setShowNewTicketForm(false);
      
      showToast(language === 'tr' ? 'Destek talebi başarıyla oluşturuldu!' : language === 'az' ? 'Dəstək sorğusu uğurla yaradıldı!' : 'Support ticket created successfully!', 'success');
      // Refresh list and select the new ticket
      await fetchTickets(data.ticket.id);
    } catch (err: any) {
      showAlert(language === 'tr' ? 'Hata' : language === 'az' ? 'Xəta' : 'Error', err.message, 'error');
    } finally {
      setIsSubmitting(false);
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
      if (!res.ok) throw new Error(data.error || (language === 'tr' ? 'Yanıt gönderilemedi.' : language === 'az' ? 'Cavab gönderile bilmedi.' : 'Failed to send reply.'));

      setReplyText('');
      showToast(language === 'tr' ? 'Yanıtınız gönderildi!' : language === 'az' ? 'Cavabınız göndərildi!' : 'Reply sent successfully!', 'success');
      await fetchTickets(); // Refresh replies
    } catch (err: any) {
      showAlert(language === 'tr' ? 'Hata' : language === 'az' ? 'Xəta' : 'Error', err.message, 'error');
    } finally {
      setIsReplying(false);
    }
  };

  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  const d = (light: string, dark: string) => isDark ? dark : light;

  const getStatusBadge = (statusStr: string) => {
    switch (statusStr) {
      case 'OPEN':
        return <span className={`px-2.5 py-1 rounded-full text-xs font-black tracking-wider uppercase border ${d('bg-sky-50 text-sky-650 border-sky-100', 'bg-sky-950/20 text-sky-400 border-sky-900/30')}`}>{language === 'tr' ? 'Açık' : language === 'az' ? 'Açıq' : 'Open'}</span>;
      case 'IN_PROGRESS':
        return <span className={`px-2.5 py-1 rounded-full text-xs font-black tracking-wider uppercase border ${d('bg-purple-50 text-[#712ae2] border-purple-100', 'bg-purple-950/20 text-purple-400 border-purple-900/30')}`}>{language === 'tr' ? 'Yanıtlandı' : language === 'az' ? 'Cavablandırıldı' : 'Replied'}</span>;
      case 'RESOLVED':
        return <span className={`px-2.5 py-1 rounded-full text-xs font-black tracking-wider uppercase border ${d('bg-emerald-50 text-emerald-650 border-emerald-100', 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30')}`}>{language === 'tr' ? 'Çözüldü' : language === 'az' ? 'Həll Olundu' : 'Resolved'}</span>;
      case 'CLOSED':
        return <span className={`px-2.5 py-1 rounded-full text-xs font-black tracking-wider uppercase border ${d('bg-slate-100 text-slate-500 border-slate-200', 'bg-slate-800 text-slate-400 border-slate-700')}`}>{language === 'tr' ? 'Kapandı' : language === 'az' ? 'Bağlandı' : 'Closed'}</span>;
      default:
        return null;
    }
  };

  if (isLoading || status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 animate-fade-in-up">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <span className={`font-bold ${d('text-slate-500', 'text-[#8B949E]')}`}>{language === 'tr' ? 'Destek talepleri yükleniyor...' : language === 'az' ? 'Dəstək sorğuları yüklənir...' : 'Loading support tickets...'}</span>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-4 border shadow-sm transform -rotate-3 ${d('bg-indigo-50 border-indigo-100 text-[#4648d4]', 'bg-indigo-950/20 border-indigo-900/30 text-indigo-400')}`}>
          <LifeBuoy className="h-8 w-8" />
        </div>
        <h1 className={`text-4xl font-black display-font mb-2 ${d('text-slate-800', 'text-[#E6EDF3]')}`}>{language === 'tr' ? 'Müşteri Destek Merkezi' : language === 'az' ? 'Müştəri Dəstək Mərkəzi' : 'Customer Support Center'}</h1>
        <p className={`font-medium max-w-md ${d('text-slate-500', 'text-[#8B949E]')}`}>
          {language === 'tr' ? 'Bir sorunuz veya teknik destek ihtiyacınız mı var? Bize anında destek talebi gönderebilirsiniz.' : language === 'az' ? 'Sualınız və ya texniki dəstək ehtiyacınız var? Bizə dərhal dəstək sorğusu göndərə bilərsiniz.' : 'Have a question or need technical support? You can send us a support ticket instantly.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[650px]">
        {/* Ticket List Panel */}
        <div className={`border rounded-3xl p-5 flex flex-col h-full lg:col-span-1 backdrop-blur-xl transition-all duration-300 ${d('bg-white/60 border-white/40 shadow-lg', 'bg-[#161B22]/90 border-[#30363D] shadow-xl')}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-lg font-black display-font flex items-center gap-2 ${d('text-slate-805', 'text-[#E6EDF3]')}`}>
              <span className={`p-1.5 rounded-lg ${d('bg-indigo-50 text-indigo-650', 'bg-indigo-950/20 text-indigo-450')}`}><MessageSquare className="h-4 w-4" /></span>
              {language === 'tr' ? 'Talepleriniz' : language === 'az' ? 'Sorğularınız' : 'Your Tickets'}
            </h2>
            <button
              onClick={() => { setShowNewTicketForm(true); setSelectedTicket(null); }}
              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 text-sm font-black"
            >
              <PlusCircle className="h-5 w-5" /> {language === 'tr' ? 'Yeni Talep' : language === 'az' ? 'Yeni Sorğu' : 'New Ticket'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {tickets.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm font-bold">
                {language === 'tr' ? 'Henüz destek talebiniz bulunmuyor.' : language === 'az' ? 'Hələ dəstək sorğunuz yoxdur.' : 'You do not have any support tickets yet.'}
              </div>
            ) : (
              tickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedTicket(t); setShowNewTicketForm(false); }}
                    className={`w-full p-4 rounded-2xl border transition-all duration-350 text-left ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#4648d4] to-[#712ae2] text-white border-transparent shadow-[0_4px_12px_rgba(70,72,212,0.2)]'
                        : d('bg-white/80 border-slate-100 hover:border-indigo-150 hover:bg-white text-slate-700', 'bg-[#21262D]/70 border-[#30363D] hover:border-indigo-700/45 hover:bg-[#21262D] text-[#E6EDF3]')
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-extrabold text-sm truncate max-w-[150px]">{t.subject}</span>
                      {getStatusBadge(t.status)}
                    </div>
                    <p className={`text-xs truncate mb-2 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>{t.message}</p>
                    <span className={`text-[10px] font-bold block ${isSelected ? 'text-indigo-100/80' : 'text-slate-400'}`}>
                      {new Date(t.createdAt).toLocaleDateString(language === 'tr' ? 'tr-TR' : language === 'az' ? 'az-AZ' : 'en-US')} - {new Date(t.createdAt).toLocaleTimeString(language === 'tr' ? 'tr-TR' : language === 'az' ? 'az-AZ' : 'en-US')}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Message Thread or New Ticket Form Panel */}
        <div className={`border rounded-3xl p-6 flex flex-col h-full lg:col-span-2 relative overflow-hidden backdrop-blur-xl transition-all duration-300 ${d('bg-white/60 border-white/40 shadow-lg', 'bg-[#161B22]/90 border-[#30363D] shadow-xl')}`}>
          
          {showNewTicketForm ? (
            /* New Ticket Form */
            <form onSubmit={handleCreateTicket} className="flex flex-col h-full space-y-4">
              <h2 className={`text-xl font-black display-font border-b pb-3 text-left ${d('text-slate-800 border-slate-100', 'text-[#E6EDF3] border-[#30363D]')}`}>
                {language === 'tr' ? 'Yeni Destek Talebi Oluştur' : language === 'az' ? 'Yeni Dəstək Sorğusu Yarat' : 'Create New Support Ticket'}
              </h2>
              
              <div className="space-y-2 text-left">
                <label className={`block text-xs font-bold ${d('text-slate-500', 'text-[#8B949E]')}`}>{language === 'tr' ? 'Destek Konusu' : language === 'az' ? 'Mövzu' : 'Subject'}</label>
                <input
                  type="text"
                  required
                  placeholder={language === 'tr' ? 'Konu (örn: Bakiye yükleme sorunu)' : language === 'az' ? 'Mövzu' : 'Subject'}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={`w-full px-4 py-3 border focus:border-indigo-500 rounded-xl text-sm outline-none transition-all ${d('bg-white border-slate-200 text-slate-800 focus:bg-white placeholder:text-slate-400', 'bg-[#0D1117] border-[#30363D] text-[#E6EDF3] focus:bg-[#0D1117] placeholder:text-[#484F58]')}`}
                />
              </div>

              <div className="flex-1 flex flex-col space-y-2 text-left min-h-0">
                <label className={`block text-xs font-bold ${d('text-slate-500', 'text-[#8B949E]')}`}>{language === 'tr' ? 'Sorununuzun Detayları' : language === 'az' ? 'Probleminizin Təfərrüatları' : 'Details of Your Issue'}</label>
                <textarea
                  required
                  placeholder={language === 'tr' ? 'Sorununuzu detaylı açıklayın...' : language === 'az' ? 'Probleminizi ətraflı izah edin...' : 'Explain your issue details...'}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`flex-1 w-full px-4 py-3 border focus:border-indigo-500 rounded-xl text-sm outline-none transition-all resize-none min-h-[150px] ${d('bg-white border-slate-200 text-slate-800 focus:bg-white placeholder:text-slate-400', 'bg-[#0D1117] border-[#30363D] text-[#E6EDF3] focus:bg-[#0D1117] placeholder:text-[#484F58]')}`}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTicketForm(false)}
                  className={`px-5 py-3 rounded-xl font-bold text-sm transition-colors ${d('bg-slate-100 hover:bg-slate-200 text-slate-650', 'bg-[#21262D] hover:bg-[#30363D] text-[#8B949E]')}`}
                >
                  {language === 'tr' ? 'İptal' : language === 'az' ? 'Ləğv Et' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-[#4648d4] to-[#712ae2] hover:from-[#3b3db8] hover:to-[#5e22be] disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-1.5 hover:scale-[1.02]"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (language === 'tr' ? 'Gönder' : language === 'az' ? 'Göndər' : 'Send')}
                </button>
              </div>
            </form>
          ) : selectedTicket ? (
            /* Selected Ticket Message Thread (Chat UI) */
            <div className="flex flex-col h-full">
              {/* Ticket Top bar */}
              <div className={`flex items-center justify-between border-b pb-3 mb-4 shrink-0 ${d('border-slate-100', 'border-[#21262D]')}`}>
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">{language === 'tr' ? 'TALEP KONUSU' : language === 'az' ? 'SORĞU MÖVZUSU' : 'TICKET SUBJECT'}</span>
                  <h2 className={`text-lg font-black display-font ${d('text-slate-800', 'text-[#E6EDF3]')}`}>{selectedTicket.subject}</h2>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(selectedTicket.status)}
                </div>
              </div>

              {/* Message scroll thread */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 custom-scrollbar">
                
                {/* Original Ticket Description */}
                <div className="flex items-start gap-3 justify-start max-w-[80%]">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 uppercase shadow-sm ${d('bg-slate-200 text-slate-650', 'bg-slate-800 text-slate-350')}`}>
                    {user.name?.substring(0,2) || 'US'}
                  </div>
                  <div className={`border p-4 rounded-3xl rounded-tl-none shadow-sm text-left ${d('bg-slate-50 border-slate-200/50 text-slate-800', 'bg-[#0D1117] border-slate-900/50 text-[#E6EDF3]')}`}>
                     <p className="text-sm leading-relaxed font-semibold">{selectedTicket.message}</p>
                     <span className="block text-[8px] text-slate-400 font-bold mt-2">
                       {new Date(selectedTicket.createdAt).toLocaleTimeString(language === 'tr' ? 'tr-TR' : language === 'az' ? 'az-AZ' : 'en-US')}
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
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 uppercase shadow-sm ${d('bg-slate-200 text-slate-600', 'bg-[#21262D] text-[#8B949E]')}`}>
                          {user.name?.substring(0,2) || 'US'}
                        </div>
                      )}
                      <div className={`p-4 rounded-3xl shadow-sm text-left ${
                        isReplyAdmin 
                          ? 'bg-[#4648d4] text-white rounded-tr-none shadow-[0_4px_12px_rgba(70,72,212,0.15)]' 
                          : d('bg-slate-50 border border-slate-200/50 rounded-tl-none text-slate-800', 'bg-[#0D1117] border border-slate-900/40 rounded-tl-none text-[#E6EDF3]')
                      }`}>
                         <p className="text-sm leading-relaxed font-semibold">{reply.message}</p>
                         <span className={`block text-[8px] mt-2 font-bold ${isReplyAdmin ? 'text-indigo-100' : 'text-slate-400'}`}>
                           {isReplyAdmin ? (language === 'tr' ? 'Destek Ekibi' : language === 'az' ? 'Dəstək Komandası' : 'Support Team') : user.name} • {new Date(reply.createdAt).toLocaleTimeString(language === 'tr' ? 'tr-TR' : language === 'az' ? 'az-AZ' : 'en-US')}
                         </span>
                      </div>
                      {isReplyAdmin && (
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-sm border ${d('bg-indigo-50 text-indigo-700 border-indigo-150', 'bg-indigo-950/20 text-indigo-400 border-indigo-900/30')}`}>
                          DS
                        </div>
                      )}
                    </div>
                  );
                })}

              </div>

              {/* Ticket Input form */}
              {selectedTicket.status === 'CLOSED' ? (
                <div className={`border rounded-2xl p-4 text-center font-bold text-xs shrink-0 ${d('bg-slate-50 border-slate-100 text-slate-400', 'bg-[#0D1117] border-slate-800/40 text-slate-500')}`}>
                  {language === 'tr' ? 'Bu destek talebi kapatılmıştır. Sorununuz devam ediyorsa lütfen yeni bir talep açın.' : language === 'az' ? 'Bu dəstək sorğusu bağlanıb. Probleminiz davam edərsə, zəhmət olmasa yeni sorğu açın.' : 'This support ticket has been closed. If your problem persists, please open a new ticket.'}
                </div>
              ) : (
                <form onSubmit={handleSendReply} className={`flex gap-2 items-center border-t pt-4 shrink-0 ${d('border-slate-100', 'border-[#21262D]')}`}>
                  <input
                    type="text"
                    required
                    placeholder={language === 'tr' ? 'Yanıtınızı yazın...' : language === 'az' ? 'Cavabınızı yazın...' : 'Type your reply...'}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className={`flex-1 px-4 py-3.5 border focus:border-indigo-500 rounded-xl text-sm outline-none transition-all ${d('bg-slate-50 border-slate-200 text-slate-800 focus:bg-white placeholder:text-slate-400', 'bg-[#0D1117] border-[#30363D] text-[#E6EDF3] focus:bg-[#0D1117] placeholder:text-[#484F58]')}`}
                  />
                  <button
                    type="submit"
                    disabled={isReplying || !replyText}
                    className="p-3.5 bg-gradient-to-r from-[#4648d4] to-[#712ae2] hover:from-[#3b3db8] hover:to-[#5e22be] disabled:opacity-50 text-white rounded-xl transition-all shadow-md flex items-center justify-center shrink-0 hover:scale-[1.02]"
                  >
                    {isReplying ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Placeholder */
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-4 gap-2">
              <LifeBuoy className="h-12 w-12 text-slate-350 animate-float" style={{ animationDuration: '6s' }} />
              <span className="font-bold text-sm">
                {language === 'tr' ? 'Lütfen soldaki listeden bir destek talebi seçin ya da yeni bir talep oluşturun.' : language === 'az' ? 'Zəhmət olmasa soldakı siyahıdan bir dəstək sorğusu seçin və ya yeni bir sorğu yaradın.' : 'Please select a support ticket from the list on the left or create a new one.'}
              </span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
