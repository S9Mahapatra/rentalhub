import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/server-utils';
import { calculateRentalPrice } from '@/lib/utils';
import Booking from '@/models/Booking';
import Product from '@/models/Product';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    require('@/models/Category');

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = { user: user.id };
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      Booking.find(where)
        .populate({
          path: 'product',
          populate: { path: 'category', select: 'name slug icon' }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(where),
    ]);

    const mappedBookings = bookings.map(b => {
      const doc = b.toJSON() as any;
      doc.id = doc._id.toString();
      doc.userId = doc.user.toString();
      doc.productId = doc.product && (doc.product as any)._id ? (doc.product as any)._id.toString() : '';
      if (doc.product) {
        (doc.product as any).id = doc.productId;
        if ((doc.product as any).category && (doc.product as any).category._id) {
          (doc.product as any).category.id = (doc.product as any).category._id.toString();
        }
      }
      return doc;
    });

    return NextResponse.json({
      success: true,
      data: mappedBookings,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error('Bookings GET Error:', error);
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

    await connectToDatabase();
    const bookings = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const start = new Date(item.rentalStart);
      const end = new Date(item.rentalEnd);
      const rentalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      const pricePerDay = calculateRentalPrice(product.dailyPrice, product.weeklyPrice || null, product.monthlyPrice || null, rentalDays);
      const rentalAmount = Math.round(pricePerDay * rentalDays * item.quantity);
      const securityDeposit = product.securityDeposit * item.quantity;
      const totalAmount = rentalAmount + securityDeposit;

      const booking = await Booking.create({
        user: user.id,
        product: product._id,
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
      });

      product.availableStock -= item.quantity;
      await product.save();

      const populatedBooking = await Booking.findById(booking._id).populate('product');
      
      const doc = populatedBooking!.toJSON() as any;
      doc.id = doc._id.toString();
      doc.userId = doc.user.toString();
      doc.productId = product._id.toString();
      if (doc.product) {
        (doc.product as any).id = doc.productId;
      }
      bookings.push(doc);
    }

    return NextResponse.json({ success: true, data: bookings }, { status: 201 });
  } catch (error: any) {
    console.error('Bookings POST Error:', error);
    return NextResponse.json({ error: 'Failed to create bookings' }, { status: 500 });
  }
}
