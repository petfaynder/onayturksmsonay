"use client";

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import { Loader2 } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/components/LanguageProvider';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { isDark } = useTheme();
  const [wasAuthenticated, setWasAuthenticated] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      setWasAuthenticated(true);
    }
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading' && !wasAuthenticated) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isDark ? 'bg-[#0B121F] text-white' : 'bg-slate-50 text-slate-800'}`}>
        <Loader2 className="h-10 w-10 text-[#4648d4] animate-spin mb-4" />
        <span className="text-sm font-bold tracking-widest uppercase">OnayTR</span>
      </div>
    );
  }

  if (!session && !wasAuthenticated) {
    return null;
  }

  return (
    <div className={`min-h-screen flex flex-col relative ${isDark ? 'bg-[#080B10] text-[#E6EDF3]' : 'bg-[#F8F9FF] text-slate-800'}`}>
      
      {/* Dynamic Background meshes for dashboard */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-30 ${isDark ? 'bg-indigo-900/10' : 'bg-indigo-200/20'}`} />
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 ${isDark ? 'bg-purple-900/10' : 'bg-purple-200/20'}`} />
      </div>

      {/* Top Header / Navbar */}
      <DashboardHeader />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10 w-full max-w-[1440px] mx-auto">
        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8 pb-24 lg:pb-8">
          <div key={pathname} className="animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
