import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, calculateRentalPrice } from '@/lib/utils';

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

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: { product: { include: { category: { select: { id: true, name: true, slug: true, icon: true } } } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: bookings,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { items, deliveryMethod, deliveryAddressId } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    const bookings = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;

      const start = new Date(item.rentalStart);
      const end = new Date(item.rentalEnd);
      const rentalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      const pricePerDay = calculateRentalPrice(product.dailyPrice, product.weeklyPrice, product.monthlyPrice, rentalDays);
      const rentalAmount = Math.round(pricePerDay * rentalDays * item.quantity);
      const securityDeposit = product.securityDeposit * item.quantity;
      const totalAmount = rentalAmount + securityDeposit;

      const booking = await prisma.booking.create({
        data: {
          userId: user.id,
          productId: product.id,
          quantity: item.quantity,
          rentalStart: start,
          rentalEnd: end,
          rentalDays,
          pricePerDay,
          rentalAmount,
          securityDeposit,
          totalAmount,
          deliveryMethod,
          deliveryAddressId: deliveryMethod === 'delivery' ? deliveryAddressId : null,
          status: 'confirmed',
        },
        include: { product: true },
      });

      await prisma.product.update({
        where: { id: product.id },
        data: { availableStock: { decrement: item.quantity } },
      });

      bookings.push(booking);
    }

    return NextResponse.json({ success: true, data: bookings }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create bookings' }, { status: 500 });
  }
}
