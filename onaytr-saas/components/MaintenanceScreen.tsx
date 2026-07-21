"use client";

import { Wrench, ShieldAlert, Mail, MessageSquare } from 'lucide-react';

export default function MaintenanceScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0B1C30] relative overflow-hidden p-6">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#4648d4]/10 rounded-full blur-[150px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#712ae2]/10 rounded-full blur-[150px] -z-10 animate-pulse"></div>

      {/* Main Glass Panel */}
      <div className="w-full max-w-xl bg-white/5 border border-white/10 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl text-center space-y-8 animate-in fade-in zoom-in duration-500">
        
        {/* Animated Icon Container */}
        <div className="flex justify-center">
          <div className="h-20 w-20 bg-gradient-to-br from-[#4648d4] to-[#712ae2] rounded-2xl flex items-center justify-center shadow-lg shadow-[#4648d4]/20 relative group">
            <Wrench className="h-10 w-10 text-white animate-bounce group-hover:rotate-45 transition-transform duration-300" />
            <div className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-black text-white display-font tracking-tight">
            Bakım Çalışması Yapılıyor
          </h1>
          <p className="text-white/60 text-sm md:text-[15px] leading-relaxed font-medium">
            {message || "Sistemimiz güncelleme ve iyileştirme çalışmaları nedeniyle geçici olarak hizmet dışıdır. En kısa sürede tekrar çevrimiçi olacağız."}
          </p>
        </div>

        {/* Status indicator */}
        <div className="py-2.5 px-4 bg-white/5 rounded-2xl border border-white/5 inline-flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse"></span>
          <span className="text-xs font-bold text-amber-300 tracking-wider uppercase">Güncelleme Devam Ediyor</span>
        </div>

        {/* Footer Brand Info */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40 font-bold">
          <span>&copy; {new Date().getFullYear()} OnayTR. Tüm hakları saklıdır.</span>
          <span className="font-mono text-[10px] tracking-widest text-[#4648d4]">v2.5 // MAINTENANCE</span>
        </div>
      </div>
    </div>
  );
}
