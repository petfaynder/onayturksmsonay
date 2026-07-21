"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X, ShieldAlert } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ModalConfig {
  isOpen: boolean;
  title: string;
  message: string;
  type: ToastType | 'confirm';
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  showAlert: (title: string, message: string, type?: ToastType) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [modal, setModal] = useState<ModalConfig>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showToast = (message: string, type: ToastType = 'info', duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const showAlert = (title: string, message: string, type: ToastType = 'info') => {
    setModal({
      isOpen: true,
      title,
      message,
      type,
      confirmText: 'Tamam'
    });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => {
    setModal({
      isOpen: true,
      title,
      message,
      type: 'confirm',
      onConfirm: () => {
        onConfirm();
        closeModal();
      },
      onCancel: () => {
        if (onCancel) onCancel();
        closeModal();
      },
      confirmText: 'Evet, Onayla',
      cancelText: 'Vazgeç'
    });
  };

  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Override window.alert
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.alert = (message: string) => {
        const lower = (message || '').toLowerCase();
        let type: ToastType = 'info';
        let title = 'Bilgi';
        if (lower.includes('hata') || lower.includes('başarısız') || lower.includes('failed') || lower.includes('error')) {
          type = 'error';
          title = 'Sistem Hatası';
        } else if (lower.includes('başarıyla') || lower.includes('success') || lower.includes('kopyalandı') || lower.includes('alındı')) {
          type = 'success';
          title = 'Başarılı İşlem';
        }
        
        if (message.length < 25) {
          showToast(message, type);
        } else {
          showAlert(title, message, type);
        }
      };
    }
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showAlert, showConfirm }}>
      {children}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shrink-width {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}} />
      
      {/* Toast Area */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto relative overflow-hidden flex items-center justify-between p-4 pb-5 rounded-2xl bg-white/90 backdrop-blur-md border shadow-xl transition-all duration-300 transform translate-y-0 scale-100 animate-slide-in ${
              t.type === 'success' ? 'border-emerald-200 text-emerald-800' :
              t.type === 'error' ? 'border-rose-200 text-rose-800' :
              t.type === 'warning' ? 'border-amber-200 text-amber-800' :
              'border-blue-200 text-blue-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {t.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />}
              {t.type === 'error' && <XCircle className="h-5 w-5 text-rose-600 shrink-0" />}
              {t.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />}
              {t.type === 'info' && <Info className="h-5 w-5 text-blue-600 shrink-0" />}
              <span className="text-sm font-bold">{t.message}</span>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
              className="p-1 hover:bg-black/5 rounded-lg transition-colors ml-4 text-slate-400 hover:text-slate-600 shrink-0 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            
            {/* Progress Bar Countdown */}
            <div 
              className={`absolute bottom-0 left-0 h-1 rounded-b-2xl ${
                t.type === 'success' ? 'bg-emerald-500' :
                t.type === 'error' ? 'bg-rose-500' :
                t.type === 'warning' ? 'bg-amber-500' :
                'bg-blue-500'
              }`}
              style={{
                animation: `shrink-width ${t.duration ?? 5000}ms linear forwards`
              }}
            />
          </div>
        ))}
      </div>

      {/* Modal Dialog Overlay */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl overflow-hidden w-full max-w-md shadow-2xl border border-white/60 p-6 flex flex-col relative animate-scale-in">
            {/* Background mesh details */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 -z-10 ${
              modal.type === 'success' ? 'bg-emerald-500' :
              modal.type === 'error' ? 'bg-rose-500' :
              modal.type === 'warning' ? 'bg-amber-500' :
              'bg-teal-500'
            }`}></div>

            <div className="flex flex-col items-center text-center mt-2 mb-6">
              {/* Icon Container with glowing background */}
              <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-4 shadow-md ${
                modal.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-emerald-500/10' :
                modal.type === 'error' ? 'bg-rose-50 text-rose-600 border border-rose-100 shadow-rose-500/10' :
                modal.type === 'warning' ? 'bg-amber-50 text-amber-600 border border-amber-100 shadow-amber-500/10' :
                modal.type === 'confirm' ? 'bg-teal-50 text-teal-600 border border-teal-100 shadow-teal-500/10' :
                'bg-blue-50 text-blue-600 border border-blue-100 shadow-blue-500/10'
              }`}>
                {modal.type === 'success' && <CheckCircle2 className="h-8 w-8" />}
                {modal.type === 'error' && <XCircle className="h-8 w-8" />}
                {modal.type === 'warning' && <AlertTriangle className="h-8 w-8" />}
                {modal.type === 'confirm' && <ShieldAlert className="h-8 w-8" />}
                {modal.type === 'info' && <Info className="h-8 w-8" />}
              </div>

              <h3 className="text-xl font-black text-slate-800 display-font">{modal.title}</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed mt-2.5 px-2">{modal.message}</p>
            </div>

            {/* Actions Footer */}
            <div className="flex gap-3 mt-2">
              {modal.type === 'confirm' ? (
                <>
                  <button
                    onClick={modal.onCancel}
                    className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-sm font-extrabold rounded-2xl border border-slate-200 transition-all cursor-pointer"
                  >
                    {modal.cancelText || 'Vazgeç'}
                  </button>
                  <button
                    onClick={modal.onConfirm}
                    className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-500 active:scale-95 text-white text-sm font-extrabold rounded-2xl shadow-[0_4px_12px_rgba(13,148,136,0.3)] hover:shadow-[0_6px_16px_rgba(13,148,136,0.4)] transition-all cursor-pointer"
                  >
                    {modal.confirmText || 'Evet, Onayla'}
                  </button>
                </>
              ) : (
                <button
                  onClick={closeModal}
                  className={`w-full py-3 px-4 active:scale-95 text-white text-sm font-extrabold rounded-2xl transition-all cursor-pointer ${
                    modal.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-[0_4px_12px_rgba(16,185,129,0.3)]' :
                    modal.type === 'error' ? 'bg-rose-600 hover:bg-rose-500 shadow-[0_4px_12px_rgba(244,63,94,0.3)]' :
                    modal.type === 'warning' ? 'bg-amber-500 hover:bg-amber-400 shadow-[0_4px_12px_rgba(245,158,11,0.3)]' :
                    'bg-teal-600 hover:bg-teal-500 shadow-[0_4px_12px_rgba(13,148,136,0.3)]'
                  }`}
                >
                  {modal.confirmText || 'Tamam'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
