import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/server-utils';
import User from '@/models/User';
import mongoose from 'mongoose';
import '@/models/Product';
import '@/models/Category';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();

    const userDoc = await User.findById(user.id).populate({
      path: 'wishlist',
      populate: { path: 'category', select: 'name slug icon' },
    });

    if (!userDoc) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const mappedProducts = userDoc.wishlist.map((p: any) => {
      const doc = p.toJSON ? p.toJSON() : p;
      if (doc._id) doc.id = doc._id.toString();
      if (doc.category && doc.category._id) {
        doc.category.id = doc.category._id.toString();
      }
      return doc;
    });

    return NextResponse.json({ success: true, data: mappedProducts });
  } catch (error) {
    console.error('Wishlist GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { productId } = await req.json();

    await connectToDatabase();
    
    const userDoc = await User.findById(user.id);
    if (!userDoc) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const productIdObj = new mongoose.Types.ObjectId(productId);
    const existingIndex = userDoc.wishlist.findIndex((id) => id.equals(productIdObj));

    if (existingIndex >= 0) {
      userDoc.wishlist.splice(existingIndex, 1);
      await userDoc.save();
      return NextResponse.json({ success: true, data: { action: 'removed' } });
    }

    userDoc.wishlist.push(productIdObj);
    await userDoc.save();
    return NextResponse.json({ success: true, data: { action: 'added' } });
  } catch (error) {
    console.error('Wishlist POST Error:', error);
    return NextResponse.json({ error: 'Failed to toggle wishlist' }, { status: 500 });
  }
}
