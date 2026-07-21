"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Detect dashboard, rent, balance, numbers, profile, support, developer, or admin routes
  const isDashboard = pathname?.startsWith('/dashboard') || 
                      pathname?.startsWith('/rent') || 
                      pathname?.startsWith('/numbers') || 
                      pathname?.startsWith('/balance') || 
                      pathname?.startsWith('/profile') || 
                      pathname?.startsWith('/support') || 
                      pathname?.startsWith('/developer') ||
                      pathname?.startsWith('/admin');

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="pt-8 pb-20">
        {children}
      </main>
      <Footer />
    </>
  );
}
