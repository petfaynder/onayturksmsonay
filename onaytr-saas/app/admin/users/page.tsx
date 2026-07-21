import prisma from '@/lib/db';
import AdminUserRow from '@/components/AdminUserRow';
import { Search } from 'lucide-react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/auth/login');
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!dbUser || dbUser.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || '';

  const users = await prisma.user.findMany({
    where: {
      email: {
        contains: search,
      }
    },
    include: {
      _count: {
        select: { orders: true }
      }
    },
    orderBy: {
      createdAt: 'desc',
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 display-font">Kullanıcı Yönetimi</h1>
          <p className="text-slate-500 mt-1 text-sm">{users.length} kullanıcı listeleniyor</p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <a
            href="/api/admin/export?type=users"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-colors shadow-sm"
          >
            ↓ CSV İndir
          </a>

          {/* Simple Server-Side Search */}
          <form className="relative w-full md:w-auto" method="GET">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="E-Posta Ara..."
              className="w-full md:w-64 pl-10 pr-4 py-2 bg-white/60 border border-white focus:border-teal-400 rounded-xl text-slate-800 outline-none shadow-sm"
            />
          </form>
        </div>
      </div>

      <div className="glass-panel overflow-hidden border border-white/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/40 border-b border-white/60 text-slate-600 text-sm font-bold">
                <th className="p-4">Kullanıcı</th>
                <th className="p-4">Kayıt Tarihi</th>
                <th className="p-4">Rol</th>
                <th className="p-4">Bakiye</th>
                <th className="p-4">Siparişler</th>
                <th className="p-4">Durum</th>
                <th className="p-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <AdminUserRow key={user.id} user={user} />
              ))}
              
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-bold">
                    Kullanıcı bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
