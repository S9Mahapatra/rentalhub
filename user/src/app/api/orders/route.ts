import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/server-utils';
import { generateOrderNumber } from '@/lib/utils';
import Order from '@/models/Order';
import Booking from '@/models/Booking';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = { user: user.id };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      Order.find(where)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(where),
    ]);

    const mappedOrders = orders.map(o => {
      const doc = o.toJSON() as any;
      doc.id = doc._id.toString();
      doc.userId = doc.user.toString();
      doc.items = (doc.items || []).map((item: any) => {
        item.id = item._id ? item._id.toString() : '';
        item.productId = item.product.toString();
        item.orderId = doc.id;
        return item;
      });
      return doc;
    });

    return NextResponse.json({
      success: true,
      data: mappedOrders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { bookingIds, deliveryMethod, deliveryAddressId, paymentMethod } = await req.json();

    await connectToDatabase();

    const bookings = await Booking.find({ _id: { $in: bookingIds }, user: user.id, status: 'confirmed' }).populate('product');

    if (bookings.length === 0) {
      return NextResponse.json({ error: 'No valid bookings found' }, { status: 400 });
    }

    const items = bookings.map((b: any) => ({
      product: b.product._id,
      productName: b.product.name,
      quantity: b.quantity,
      pricePerDay: b.pricePerDay,
      rentalDays: b.rentalDays,
      rentalAmount: b.rentalAmount,
      securityDeposit: b.securityDeposit,
    }));

    const subtotal = items.reduce((s, i) => s + i.rentalAmount, 0);
    const securityDepositTotal = items.reduce((s, i) => s + i.securityDeposit, 0);
    const deliveryFee = deliveryMethod === 'delivery' ? 99 : 0;
    const tax = Math.round(subtotal * 0.18);
    const totalAmount = subtotal + securityDepositTotal + deliveryFee + tax;

    const order = await Order.create({
      user: user.id,
      orderNumber: generateOrderNumber(),
      subtotal,
      securityDepositTotal,
      deliveryFee,
      tax,
      totalAmount,
      deliveryMethod,
      deliveryAddressId: deliveryMethod === 'delivery' ? deliveryAddressId : null,
      paymentMethod,
      paymentStatus: 'paid',
      status: 'confirmed',
      items,
    });

    const doc = order.toJSON() as any;
    doc.id = doc._id.toString();
    doc.userId = doc.user.toString();
    doc.items = (doc.items || []).map((item: any) => {
      item.id = item._id ? item._id.toString() : '';
      item.productId = item.product.toString();
      item.orderId = doc.id;
      return item;
    });

    return NextResponse.json({ success: true, data: doc }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
