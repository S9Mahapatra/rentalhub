import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, generateOrderNumber } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = { userId: user.id };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: orders,
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

    const bookings = await prisma.booking.findMany({
      where: { id: { in: bookingIds }, userId: user.id, status: 'confirmed' },
      include: { product: true },
    });

    if (bookings.length === 0) {
      return NextResponse.json({ error: 'No valid bookings found' }, { status: 400 });
    }

    const items = bookings.map((b) => ({
      productId: b.productId,
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

    const order = await prisma.order.create({
      data: {
        userId: user.id,
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
        items: { create: items },
      },
      include: { items: true },
    });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
