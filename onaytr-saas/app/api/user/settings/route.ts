import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/auth';

import crypto from 'crypto';

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { autoFallback, webhookUrl, generateApiToken } = body;

    const updateData: any = {};

    if (autoFallback !== undefined) {
      if (typeof autoFallback !== 'boolean') {
        return NextResponse.json({ error: 'Invalid setting value' }, { status: 400 });
      }
      updateData.autoFallback = autoFallback;
    }

    if (webhookUrl !== undefined) {
      if (webhookUrl !== null && webhookUrl !== '' && !webhookUrl.startsWith('http://') && !webhookUrl.startsWith('https://')) {
        return NextResponse.json({ error: 'Webhook URL geçerli bir http:// veya https:// adresi olmalıdır.' }, { status: 400 });
      }
      updateData.webhookUrl = webhookUrl || null;
    }

    if (generateApiToken === true) {
      updateData.apiToken = crypto.randomBytes(32).toString('hex');
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData
    });

    return NextResponse.json({ 
      success: true, 
      autoFallback: updatedUser.autoFallback,
      webhookUrl: updatedUser.webhookUrl,
      apiToken: updatedUser.apiToken
    });
  } catch (error: any) {
    console.error('Settings API Error:', error);
    return NextResponse.json({ error: 'Settings update failed' }, { status: 500 });
  }
}
