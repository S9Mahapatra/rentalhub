import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/utils';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { quantity } = await req.json();

    const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });

    const item = await prisma.cartItem.findFirst({
      where: { id: params.id, cartId: cart.id },
    });

    if (!item) return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });

    await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity, totalPrice: item.pricePerDay * item.rentalDays * quantity },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { product: { include: { category: { select: { id: true, name: true, slug: true, icon: true } } } } } } },
    });

    return NextResponse.json({ success: true, data: updatedCart });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update cart item' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });

    await prisma.cartItem.deleteMany({
      where: { id: params.id, cartId: cart.id },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { product: { include: { category: { select: { id: true, name: true, slug: true, icon: true } } } } } } },
    });

    return NextResponse.json({ success: true, data: updatedCart });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove cart item' }, { status: 500 });
  }
}
