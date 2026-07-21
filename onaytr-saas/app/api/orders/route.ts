import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url || '');
    const type = searchParams.get('type');

    const orders = await prisma.order.findMany({
      where: { 
        userId: dbUser.id,
        ...(type ? { type } : {})
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // limit to recent 50 for MVP
    });

    return NextResponse.json({ orders });

  } catch (error: any) {
    console.error('Fetch Orders Error:', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
