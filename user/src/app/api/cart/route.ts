import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, calculateRentalPrice } from '@/lib/utils';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: { product: { include: { category: { select: { id: true, name: true, slug: true, icon: true } } } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!cart) {
      const newCart = await prisma.cart.create({
        data: { userId: user.id },
        include: { items: { include: { product: { include: { category: { select: { id: true, name: true, slug: true, icon: true } } } } } } },
      });
      return NextResponse.json({ success: true, data: newCart });
    }

    return NextResponse.json({ success: true, data: cart });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { productId, quantity = 1, rentalStart, rentalEnd } = await req.json();

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const start = new Date(rentalStart);
    const end = new Date(rentalEnd);
    const rentalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (rentalDays < product.minRentalDays) {
      return NextResponse.json({ error: `Minimum rental period is ${product.minRentalDays} days` }, { status: 400 });
    }

    const overlappingBookings = await prisma.booking.count({
      where: {
        productId,
        status: { in: ['confirmed', 'active', 'preparing', 'out_for_delivery', 'delivered'] },
        rentalStart: { lte: end },
        rentalEnd: { gte: start },
      },
    });

    const available = product.availableStock - overlappingBookings;
    if (quantity > available) {
      return NextResponse.json({ error: `Only ${available} available for selected dates` }, { status: 400 });
    }

    const pricePerDay = calculateRentalPrice(product.dailyPrice, product.weeklyPrice, product.monthlyPrice, rentalDays);
    const totalPrice = Math.round(pricePerDay * rentalDays * quantity);

    let cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (!cart) cart = await prisma.cart.create({ data: { userId: user.id } });

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        rentalStart: start,
        rentalEnd: end,
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity, totalPrice: pricePerDay * rentalDays * (existingItem.quantity + quantity) },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity, rentalStart: start, rentalEnd: end, rentalDays, pricePerDay, totalPrice },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { product: { include: { category: { select: { id: true, name: true, slug: true, icon: true } } } } } } },
    });

    return NextResponse.json({ success: true, data: updatedCart });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    return NextResponse.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 });
  }
}
