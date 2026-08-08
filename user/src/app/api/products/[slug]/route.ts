import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    await connectToDatabase();
    if (!Category) console.log('Loaded Category');

    const product = await Product.findOne({ slug })
      .populate({ path: 'category', select: 'name slug icon' });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const doc = product.toJSON() as any;
    doc.id = doc._id.toString();
    if (doc.category && (doc.category as any)._id) {
      (doc.category as any).id = (doc.category as any)._id.toString();
    }

    return NextResponse.json({ success: true, data: doc });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
