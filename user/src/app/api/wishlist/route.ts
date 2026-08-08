import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/utils';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const wishlist = await prisma.wishlist.findMany({
      where: { userId: user.id },
      include: { product: { include: { category: { select: { id: true, name: true, slug: true, icon: true } } } } },
    });

    return NextResponse.json({ success: true, data: wishlist.map((w) => w.product) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { productId } = await req.json();

    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId: user.id, productId } },
    });

    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      return NextResponse.json({ success: true, data: { action: 'removed' } });
    }

    await prisma.wishlist.create({ data: { userId: user.id, productId } });
    return NextResponse.json({ success: true, data: { action: 'added' } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle wishlist' }, { status: 500 });
  }
}
