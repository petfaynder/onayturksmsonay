import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { createAuditLog } from '@/lib/audit';

// UPDATE USER (Balance / Ban / Role / Password Reset / API Token)
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!dbUser || dbUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { userId, balance, isBanned, role, resetPassword, generateApiToken, autoFallback, adminNote, tierLevel } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Kullanıcı ID gereklidir' }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {};
    
    if (balance !== undefined) updateData.balance = parseFloat(balance);
    if (isBanned !== undefined) updateData.isBanned = isBanned;
    if (autoFallback !== undefined) updateData.autoFallback = autoFallback;
    if (adminNote !== undefined) updateData.adminNote = adminNote;
    
    if (tierLevel !== undefined) {
      if (!['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'].includes(tierLevel)) {
        return NextResponse.json({ error: 'Geçersiz üyelik seviyesi' }, { status: 400 });
      }
      updateData.tierLevel = tierLevel;
    }
    
    if (role !== undefined) {
      if (!['USER', 'RESELLER', 'ADMIN'].includes(role)) {
        return NextResponse.json({ error: 'Geçersiz rol' }, { status: 400 });
      }
      updateData.role = role;
    }

    if (resetPassword) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash('123456', salt);
    }

    if (generateApiToken) {
      updateData.apiToken = crypto.randomBytes(32).toString('hex');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Create audit log
    const actionParts = [];
    if (isBanned !== undefined) actionParts.push(isBanned ? 'USER_BANNED' : 'USER_UNBANNED');
    if (balance !== undefined) actionParts.push('BALANCE_ADJUSTED');
    if (role !== undefined) actionParts.push('ROLE_CHANGED');
    if (resetPassword) actionParts.push('PASSWORD_RESET');
    if (generateApiToken) actionParts.push('API_TOKEN_RESET');
    if (adminNote !== undefined) actionParts.push('USER_NOTE_UPDATED');
    if (tierLevel !== undefined) actionParts.push('TIER_CHANGED');
    
    for (const action of actionParts) {
      await createAuditLog({
        adminId: dbUser.id,
        adminEmail: dbUser.email,
        action,
        targetType: 'USER',
        targetId: userId,
        details: action === 'USER_NOTE_UPDATED' ? 'Not güncellendi' : JSON.stringify({ balance, isBanned, role, tierLevel }),
      });
    }

    return NextResponse.json({ success: true, user: updatedUser });

  } catch (error) {
    console.error("Admin User Update Error:", error);
    return NextResponse.json({ error: 'Kullanıcı güncellenirken bir hata oluştu' }, { status: 500 });
  }
}
