import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/auth';
import { invalidateSettingsCache } from '@/lib/settings';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const dbUser = await prisma.user.findUnique({
      where: { email: session?.user?.email ?? '' }
    });

    if (!dbUser || dbUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { settings } = await req.json();

    if (settings && typeof settings === 'object') {
      for (const [key, value] of Object.entries(settings)) {
        await prisma.systemSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) }
        });
      }
    }

    // Invalidate settings cache so new values take effect immediately
    invalidateSettingsCache();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Settings Update Error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
