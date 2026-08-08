import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/server-utils';
import User from '@/models/User';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();

    const userDoc = await User.findById(user.id);
    if (!userDoc) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const addresses = userDoc.addresses.map((a: any) => {
      const doc = a.toJSON ? a.toJSON() : a;
      if (doc._id) doc.id = doc._id.toString();
      return doc;
    });

    addresses.sort((a, b) => {
      if (a.isDefault === b.isDefault) return 0;
      return a.isDefault ? -1 : 1;
    });

    return NextResponse.json({ success: true, data: addresses });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { label, street, city, state, zipCode, country, isDefault } = await req.json();

    await connectToDatabase();

    const userDoc = await User.findById(user.id);
    if (!userDoc) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (isDefault) {
      userDoc.addresses.forEach((a: any) => {
        a.isDefault = false;
      });
    }

    userDoc.addresses.push({
      label,
      street,
      city,
      state,
      zipCode,
      country: country || 'India',
      isDefault: isDefault || false
    } as any);

    await userDoc.save();

    const newAddress = userDoc.addresses[userDoc.addresses.length - 1];
    const doc = (newAddress as any).toJSON ? (newAddress as any).toJSON() : newAddress;
    if (doc._id) doc.id = doc._id.toString();

    return NextResponse.json({ success: true, data: doc }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add address' }, { status: 500 });
  }
}
