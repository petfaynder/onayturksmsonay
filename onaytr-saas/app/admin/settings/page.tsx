import prisma from '@/lib/db';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import SettingsForm from './SettingsForm';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
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

  // Fetch Providers
  const providers = await prisma.apiProvider.findMany();
  
  let provider5sim = providers.find(p => p.name === '5sim');
  if (!provider5sim) {
    provider5sim = await prisma.apiProvider.create({
      data: { name: '5sim', apiKey: '', isActive: true }
    });
  }

  let providerHerosms = providers.find(p => p.name === 'herosms');
  if (!providerHerosms) {
    providerHerosms = await prisma.apiProvider.create({
      data: { name: 'herosms', apiKey: '', isActive: true, priority: 2 }
    });
  }

  const settings = await prisma.systemSetting.findMany();
  const settingsMap = settings.reduce((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800 display-font">Sistem Ayarları</h1>
          <p className="text-slate-500 mt-1">API anahtarlarınızı ve temel sistem ayarlarını yönetin.</p>
        </div>
      </div>

      <div className="glass-panel p-6 border border-white/60">
        <SettingsForm 
          provider5sim={provider5sim} 
          providerHerosms={providerHerosms} 
          initialSettings={settingsMap} 
        />
      </div>
    </div>
  );
}
