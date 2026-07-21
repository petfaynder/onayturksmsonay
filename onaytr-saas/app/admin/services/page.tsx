import prisma from '@/lib/db';
import AdminServicesList from '@/components/AdminServicesList';
import SyncButton from '@/components/SyncButton';
import BulkServiceActions from '@/components/BulkServiceActions';
import { Search } from 'lucide-react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export default async function AdminServicesPage({
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

  const services = await prisma.service.findMany({
    where: {
      name: {
        contains: search,
      }
    },
    orderBy: [
      { sortOrder: 'asc' },
      { name: 'asc' }
    ]
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 display-font">Servis Yönetimi</h1>
          <p className="text-slate-500 mt-1">Sistemde satılacak servisleri ve özel kâr marjlarını yönetin.</p>
        </div>
        
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full xl:w-auto">
          <BulkServiceActions />
          
          <div className="flex items-center gap-3">
            <form className="relative flex-1 sm:flex-none" method="GET">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Servis Ara..."
                className="w-full sm:w-48 pl-10 pr-4 py-2 bg-white/60 border border-white focus:border-teal-400 rounded-xl text-slate-800 outline-none shadow-sm"
              />
            </form>
            
            <SyncButton />
          </div>
        </div>
      </div>

      <AdminServicesList initialServices={services} />
    </div>
  );
}
