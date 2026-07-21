import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/auth';

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email || '' } });
    if (dbUser?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { id, apiKey, isActive } = await req.json();
    
    console.log('[DEBUG] Received update request:');
    console.log('[DEBUG] ID:', id);
    console.log('[DEBUG] ApiKey Length:', apiKey?.length);
    console.log('[DEBUG] IsActive:', isActive);

    const updated = await prisma.apiProvider.update({
      where: { id },
      data: { 
        apiKey,
        isActive: isActive !== undefined ? isActive : undefined
      }
    });
    
    console.log('[DEBUG] Database update successful. Stored length:', updated.apiKey.length);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('[DEBUG] Provider settings update failed:', e);
    return NextResponse.json({ error: 'Failed', details: e.message }, { status: 500 });
  }
}

