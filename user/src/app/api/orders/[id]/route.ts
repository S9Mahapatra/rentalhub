import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/server-utils';
import Order from '@/models/Order';
import Booking from '@/models/Booking';

function serializeOrder(orderDoc: any) {
  const order = orderDoc.toJSON ? orderDoc.toJSON() : orderDoc;
  order.id = order._id.toString();
  order.userId = order.user?.toString?.() || order.userId;
  order.bookings = (order.bookings || []).map((booking: any) => booking?._id?.toString?.() || booking?.toString?.() || booking);
  order.items = (order.items || []).map((item: any) => ({
    ...item,
    id: item.id || item._id?.toString?.(),
    bookingId: item.booking?._id?.toString?.() || item.booking?.toString?.() || item.bookingId,
    productId: item.product?._id?.toString?.() || item.product?.toString?.() || item.productId,
  }));
  return order;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();

    const order = await Order.findOne({ _id: id, user: user.id }).populate({
      path: 'bookings',
      populate: {
        path: 'product',
        populate: { path: 'category', select: 'name slug icon' },
      },
    });

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const relatedBookings = await Booking.find({ order: order._id })
      .populate({
        path: 'product',
        populate: { path: 'category', select: 'name slug icon' },
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: {
        ...serializeOrder(order),
        bookings: relatedBookings.map((booking: any) => {
          const doc = booking.toJSON ? booking.toJSON() : booking;
          doc.id = doc._id.toString();
          doc.userId = doc.user?.toString?.() || doc.userId;
          doc.orderId = doc.order?._id?.toString?.() || doc.order?.toString?.() || doc.orderId;
          doc.productId = doc.product?._id?.toString?.() || doc.product?.toString?.() || doc.productId;
          return doc;
        }),
      },
    });
  } catch (error) {
    console.error('Order GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

