import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/auth';

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email || '' } });
    if (dbUser?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { id, ids, isActive, margin5sim, marginHerosms, sortOrders } = await req.json();

    const parseMargin = (margin: any) => {
      if (margin === undefined) return undefined;
      if (margin === null || margin === '') return null;
      return parseFloat(margin);
    };

    if (Array.isArray(sortOrders)) {
      await prisma.$transaction(
        sortOrders.map((so: any) => prisma.service.update({
          where: { id: so.id },
          data: { sortOrder: parseInt(so.sortOrder) }
        }))
      );
    } else if (ids === 'all') {
      await prisma.service.updateMany({
        data: {
          isActive: isActive !== undefined ? isActive : undefined,
          margin5sim: parseMargin(margin5sim),
          marginHerosms: parseMargin(marginHerosms)
        }
      });
    } else if (Array.isArray(ids)) {
      await prisma.service.updateMany({
        where: { id: { in: ids } },
        data: {
          isActive: isActive !== undefined ? isActive : undefined,
          margin5sim: parseMargin(margin5sim),
          marginHerosms: parseMargin(marginHerosms)
        }
      });
    } else if (id) {
      await prisma.service.update({
        where: { id },
        data: { 
          isActive: isActive !== undefined ? isActive : undefined, 
          margin5sim: parseMargin(margin5sim),
          marginHerosms: parseMargin(marginHerosms)
        }
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed', details: e.message }, { status: 500 });
  }
}
