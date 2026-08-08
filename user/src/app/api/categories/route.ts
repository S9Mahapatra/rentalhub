import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Category from '@/models/Category';

export async function GET() {
  try {
    await connectToDatabase();

    const categories = await Category.find({ isActive: true }).sort({ name: 1 });

    const mappedCategories = categories.map(c => {
      const doc = c.toJSON() as any;
      doc.id = doc._id.toString();
      return doc;
    });

    return NextResponse.json({ success: true, data: mappedCategories });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
