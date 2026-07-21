import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/auth';

// Returns the current user's fresh balance from the database.
// The dashboard calls this on mount so it always shows the DB-authoritative value
// instead of the (potentially stale) JWT-encoded balance.

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { balance: true, tierLevel: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    balance: parseFloat(user.balance.toString()),
    tierLevel: user.tierLevel,
  });
}
