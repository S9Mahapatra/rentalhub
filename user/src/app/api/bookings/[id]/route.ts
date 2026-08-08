import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/server-utils';
import { calculateLateFees } from '@/lib/utils';
import Booking from '@/models/Booking';
import Product from '@/models/Product';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    require('@/models/Category');

    const booking = await Booking.findOne({ _id: id, user: user.id })
      .populate({ path: 'product', populate: { path: 'category', select: 'name slug icon' } });

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    const doc = booking.toJSON() as any;
    doc.id = doc._id.toString();
    doc.userId = doc.user.toString();
    doc.productId = doc.product && (doc.product as any)._id ? (doc.product as any)._id.toString() : '';
    if (doc.product) {
      (doc.product as any).id = doc.productId;
      if ((doc.product as any).category && (doc.product as any).category._id) {
        (doc.product as any).category.id = (doc.product as any).category._id.toString();
      }
    }

    return NextResponse.json({ success: true, data: doc });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { action } = await req.json();

    await connectToDatabase();

    const booking = await Booking.findOne({ _id: id, user: user.id });

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    if (action === 'cancel') {
      if (!['pending', 'confirmed'].includes(booking.status)) {
        return NextResponse.json({ error: 'Cannot cancel this booking' }, { status: 400 });
      }

      booking.status = 'cancelled';
      await booking.save();

      await Product.findByIdAndUpdate(booking.product, { $inc: { availableStock: booking.quantity } });

      return NextResponse.json({ success: true, data: { status: 'cancelled' } });
    }

    if (action === 'return') {
      if (!['active', 'delivered'].includes(booking.status)) {
        return NextResponse.json({ error: 'Cannot return this booking' }, { status: 400 });
      }

      const now = new Date();
      const lateFees = calculateLateFees(booking.pricePerDay, booking.rentalEnd, now);
      const depositRefund = Math.max(0, booking.securityDeposit - lateFees);

      booking.status = 'returned';
      booking.actualReturnDate = now;
      booking.lateFees = lateFees;
      booking.depositRefunded = true;
      booking.depositRefundAmount = depositRefund;
      await booking.save();

      await Product.findByIdAndUpdate(booking.product, { $inc: { availableStock: booking.quantity } });

      return NextResponse.json({ success: true, data: { lateFees, depositRefund } });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Bookings PUT error:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
