import prisma from '@/lib/db';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import AdminUserDetailClient from '@/components/AdminUserDetailClient';

export const dynamic = 'force-dynamic';

export default async function AdminUserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/auth/login');
  }

  const adminUser = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!adminUser || adminUser.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      referredBy: { select: { id: true, email: true } },
      referralEarnings: true,
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 30,
        include: {
          provider: { select: { name: true } }
        }
      },
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 30,
      },
      tickets: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          _count: { select: { replies: true } }
        }
      },
      _count: {
        select: { orders: true, transactions: true, tickets: true }
      }
    }
  });

  if (!user) {
    redirect('/admin/users');
  }

  // Serialize dates and Decimal fields for client component
  const serializedUser = JSON.parse(JSON.stringify(user));

  return <AdminUserDetailClient user={serializedUser} />;
}
