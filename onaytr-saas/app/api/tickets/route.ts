import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/auth';
import { TicketStatus } from '@prisma/client';

// List user tickets
export async function GET() {
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

    const tickets = await prisma.ticket.findMany({
      where: { userId: dbUser.id },
      include: {
        replies: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ tickets });

  } catch (error: any) {
    console.error('Fetch Tickets Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Create new ticket
export async function POST(req: Request) {
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

    const body = await req.json();
    const { subject, message } = body;

    if (!subject || !message) {
      return NextResponse.json({ error: 'Konu ve mesaj alanları zorunludur.' }, { status: 400 });
    }

    const ticket = await prisma.ticket.create({
      data: {
        userId: dbUser.id,
        subject,
        message,
        status: TicketStatus.OPEN
      }
    });

    return NextResponse.json({ success: true, ticket });

  } catch (error: any) {
    console.error('Create Ticket Error:', error);
    return NextResponse.json({ error: 'Destek talebi oluşturulamadı.' }, { status: 500 });
  }
}
