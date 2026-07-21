import prisma from '@/lib/db';
import AdminCountryRow from '@/components/AdminCountryRow';
import SyncButton from '@/components/SyncButton';
import BulkCountryActions from '@/components/BulkCountryActions';
import { Search } from 'lucide-react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export default async function AdminCountriesPage({
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

  const resolvedSearchParams = await searchParams;
  const search = resolvedSearchParams?.search || '';

  const countries = await prisma.country.findMany({
    where: {
      name: {
        contains: search,
      }
    },
    orderBy: [
      { isActive: 'desc' },
      { name: 'asc' }
    ]
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 display-font">Ülke Yönetimi</h1>
          <p className="text-slate-500 mt-1">Sistemde satılacak ülkeleri ve özel kâr marjlarını yönetin.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
          <BulkCountryActions />
          
          <div className="flex items-center gap-3">
            <form className="relative flex-1 sm:flex-none" method="GET">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Ülke Ara..."
                className="w-full sm:w-48 pl-10 pr-4 py-2 bg-white/60 border border-white focus:border-teal-400 rounded-xl text-slate-800 outline-none shadow-sm"
              />
            </form>
            
            <SyncButton />
          </div>
        </div>
      </div>

      <div className="glass-panel overflow-hidden border border-white/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/40 border-b border-white/60 text-slate-600 text-sm font-bold">
                <th className="p-4">Ülke Adı</th>
                <th className="p-4">5Sim Kâr (%)</th>
                <th className="p-4">HeroSMS Kâr (%)</th>
                <th className="p-4">Durum</th>
                <th className="p-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {countries.map((country) => (
                <AdminCountryRow key={country.id} country={country} />
              ))}
              
              {countries.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-bold">
                    Ülke bulunamadı. Lütfen senkronize edin.
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
