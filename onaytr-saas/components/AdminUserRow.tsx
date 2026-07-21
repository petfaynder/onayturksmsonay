"use client";

import { useState } from 'react';
import { Ban, CheckCircle2, Edit2, Loader2, Save, X, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminUserRow({ user }: { user: any }) {
  const router = useRouter();

  return (
    <tr className="border-b border-white/20 hover:bg-white/40 transition-colors cursor-pointer group">
      <td className="p-4">
        <Link href={`/admin/users/${user.id}`} className="block">
          <div className="font-bold text-slate-800 group-hover:text-teal-700 transition-colors flex items-center gap-1.5">
            {user.email}
            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-teal-500" />
          </div>
          <div className="text-xs text-slate-500">ID: {user.id.split('-')[0]}</div>
        </Link>
      </td>
      <td className="p-4 text-sm text-slate-600">
        {new Date(user.createdAt).toLocaleDateString('tr-TR')}
      </td>
      <td className="p-4">
        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
          user.role === 'ADMIN' ? 'bg-rose-100 text-rose-600 border-rose-200'
            : user.role === 'RESELLER' ? 'bg-violet-100 text-violet-600 border-violet-200'
            : 'bg-slate-100 text-slate-600 border-slate-200'
        }`}>
          {user.role}
        </span>
      </td>
      <td className="p-4 font-black text-teal-600">
        {parseFloat(user.balance).toFixed(2)} ₺
      </td>
      <td className="p-4 text-center font-bold text-slate-600">
        {user._count?.orders || 0}
      </td>
      <td className="p-4">
        {user.isBanned ? (
          <span className="text-rose-500 font-bold flex items-center gap-1 text-sm"><Ban className="h-4 w-4"/> Yasaklı</span>
        ) : (
          <span className="text-emerald-500 font-bold flex items-center gap-1 text-sm"><CheckCircle2 className="h-4 w-4"/> Aktif</span>
        )}
      </td>
      <td className="p-4 text-right">
        <Link
          href={`/admin/users/${user.id}`}
          className="px-3 py-1.5 bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
        >
          Detay <ExternalLink className="h-3 w-3" />
        </Link>
      </td>
    </tr>
  );
}
