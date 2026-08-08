import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/server-utils';
import Order from '@/models/Order';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();

    const order = await Order.findOne({ _id: id, user: user.id });

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const doc = order.toJSON() as any;
    doc.id = doc._id.toString();
    doc.userId = doc.user.toString();
    doc.items = (doc.items || []).map((item: any) => {
      item.id = item._id ? item._id.toString() : '';
      item.productId = item.product.toString();
      item.orderId = doc.id;
      return item;
    });

    return NextResponse.json({ success: true, data: doc });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
