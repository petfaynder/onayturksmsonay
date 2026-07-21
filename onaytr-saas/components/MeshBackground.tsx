"use client";

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MeshBackground() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    
    // MutationObserver: html class change (dark toggle) update instantly
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const isDashboardRoute = pathname && (
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/rent') || 
    pathname.startsWith('/balance') || 
    pathname.startsWith('/profile') || 
    pathname.startsWith('/support') || 
    pathname.startsWith('/developer') ||
    pathname.startsWith('/numbers')
  );

  // 1. DASHBOARD BACKGROUND (TEAL / EMERALD / BLUE) - UNTOUCHED
  if (isDashboardRoute) {
    return (
      <div className="mesh-bg fixed inset-0 z-[-1] transition-all duration-500">
        <div
          className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full filter blur-[100px] animate-pulse-slow transition-colors duration-500 ${
            isDark ? 'bg-teal-500/10 mix-blend-screen' : 'bg-teal-300 mix-blend-multiply opacity-70'
          }`}
        ></div>
        <div
          className={`absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full filter blur-[120px] animate-pulse-slow transition-colors duration-500 ${
            isDark ? 'bg-emerald-500/8 mix-blend-screen' : 'bg-emerald-300 mix-blend-multiply opacity-70'
          }`}
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className={`absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full filter blur-[150px] animate-pulse-slow transition-colors duration-500 ${
            isDark ? 'bg-blue-500/8 mix-blend-screen' : 'bg-blue-300 mix-blend-multiply opacity-70'
          }`}
          style={{ animationDelay: '4s' }}
        ></div>
      </div>
    );
  }

  // 2. PUBLIC MARKETING & AUTH BACKGROUND (PREMIUM LIGHT MESH / MICRO GRID / SLATE DARK)
  return (
    <div className={`fixed inset-0 z-[-1] transition-all duration-550 ${isDark ? 'bg-[#0D1117]' : 'bg-[#F8F9FF]'}`}>
      
      {/* Decorative Premium Mesh Blobs */}
      <div
        className={`absolute top-[-5%] left-[-5%] w-[45%] h-[45%] rounded-full filter blur-[120px] transition-all duration-500 ${
          isDark ? 'bg-[#4648d4]/8 opacity-80' : 'bg-[#4648d4]/4 opacity-100'
        }`}
      ></div>
      <div
        className={`absolute top-[15%] right-[-10%] w-[50%] h-[50%] rounded-full filter blur-[130px] transition-all duration-500 ${
          isDark ? 'bg-[#712ae2]/6 opacity-70' : 'bg-[#712ae2]/3 opacity-100'
        }`}
        style={{ animationDelay: '1.5s' }}
      ></div>
      <div
        className={`absolute bottom-[-15%] left-[10%] w-[55%] h-[55%] rounded-full filter blur-[140px] transition-all duration-500 ${
          isDark ? 'bg-[#4648d4]/5 opacity-60' : 'bg-[#4648d4]/3 opacity-100'
        }`}
        style={{ animationDelay: '3s' }}
      ></div>
      <div
        className={`absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] rounded-full filter blur-[120px] transition-all duration-500 ${
          isDark ? 'bg-[#b90538]/3 opacity-40' : 'bg-[#b90538]/2 opacity-100'
        }`}
        style={{ animationDelay: '4.5s' }}
      ></div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 micro-grid opacity-60 pointer-events-none"></div>
    </div>
  );
}
