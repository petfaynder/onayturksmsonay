import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/auth';
import { TicketStatus } from '@prisma/client';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: ticketId } = await params;
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Mesaj alanı zorunludur.' }, { status: 400 });
    }

    // Verify Ticket exists and belongs to user (or user is Admin)
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const isAdmin = dbUser.role === 'ADMIN';

    if (ticket.userId !== dbUser.id && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create reply and update ticket status
    const reply = await prisma.$transaction(async (tx) => {
      const ticketReply = await tx.ticketReply.create({
        data: {
          ticketId,
          userId: dbUser.id,
          message,
          isAdmin
        }
      });

      // Update status
      // If admin replied, set status to IN_PROGRESS. If user replied, set to OPEN.
      await tx.ticket.update({
        where: { id: ticketId },
        data: {
          status: isAdmin ? TicketStatus.IN_PROGRESS : TicketStatus.OPEN,
          updatedAt: new Date()
        }
      });

      return ticketReply;
    });

    return NextResponse.json({ success: true, reply });

  } catch (error: any) {
    console.error('Create Ticket Reply Error:', error);
    return NextResponse.json({ error: 'Yanıt gönderilemedi.' }, { status: 500 });
  }
}
