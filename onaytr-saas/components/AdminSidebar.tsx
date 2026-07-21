"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, ShoppingCart, Settings, LogOut, ArrowLeft, ListOrdered, Globe, LifeBuoy, Tag, ClipboardList, Download, Megaphone } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { name: 'Kullanıcılar', icon: Users, href: '/admin/users' },
    { name: 'Servisler', icon: ListOrdered, href: '/admin/services' },
    { name: 'Ülkeler', icon: Globe, href: '/admin/countries' },
    { name: 'Siparişler', icon: ShoppingCart, href: '/admin/orders' },
    { name: 'Kuponlar', icon: Tag, href: '/admin/coupons' },
    { name: 'Destek Talepleri', icon: LifeBuoy, href: '/admin/tickets' },
    { name: 'Duyurular', icon: Megaphone, href: '/admin/announcements' },
    { name: 'Audit Log', icon: ClipboardList, href: '/admin/audit' },
    { name: 'Ayarlar', icon: Settings, href: '/admin/settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 glass-panel border-r border-white/50 shadow-xl z-50 flex flex-col hidden md:flex">
      <div className="p-6 border-b border-white/40">
        <div className="text-2xl font-black text-slate-800 tracking-tight flex items-center display-font">
          Onay<span className="text-teal-600">TR</span>
          <span className="ml-2 text-xs font-bold bg-rose-100 text-rose-600 px-2 py-0.5 rounded-md">ADMIN</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-[14px] ${
                isActive 
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-white/60 hover:text-teal-600'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/40 space-y-2">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-[14px] text-slate-600 hover:bg-white/60 hover:text-slate-800">
          <ArrowLeft className="h-5 w-5" />
          Siteye Dön
        </Link>
        <button 
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-[14px] text-rose-500 hover:bg-rose-50 hover:text-rose-600"
        >
          <LogOut className="h-5 w-5" />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
