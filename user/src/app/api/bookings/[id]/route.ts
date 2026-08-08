import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, calculateLateFees } from '@/lib/utils';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const booking = await prisma.booking.findFirst({
      where: { id: params.id, userId: user.id },
      include: { product: { include: { category: { select: { id: true, name: true, slug: true, icon: true } } } } },
    });

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { action } = await req.json();

    const booking = await prisma.booking.findFirst({
      where: { id: params.id, userId: user.id },
      include: { product: true },
    });

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    if (action === 'cancel') {
      if (!['pending', 'confirmed'].includes(booking.status)) {
        return NextResponse.json({ error: 'Cannot cancel this booking' }, { status: 400 });
      }

      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'cancelled' },
      });

      await prisma.product.update({
        where: { id: booking.productId },
        data: { availableStock: { increment: booking.quantity } },
      });

      return NextResponse.json({ success: true, data: { status: 'cancelled' } });
    }

    if (action === 'return') {
      if (!['active', 'delivered'].includes(booking.status)) {
        return NextResponse.json({ error: 'Cannot return this booking' }, { status: 400 });
      }

      const now = new Date();
      const lateFees = calculateLateFees(booking.pricePerDay, booking.rentalEnd, now);
      const depositRefund = Math.max(0, booking.securityDeposit - lateFees);

      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'returned',
          actualReturnDate: now,
          lateFees,
          depositRefunded: true,
          depositRefundAmount: depositRefund,
        },
      });

      await prisma.product.update({
        where: { id: booking.productId },
        data: { availableStock: { increment: booking.quantity } },
      });

      return NextResponse.json({ success: true, data: { lateFees, depositRefund } });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
