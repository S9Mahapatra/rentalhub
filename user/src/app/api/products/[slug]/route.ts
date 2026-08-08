import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import { getProductAvailability } from '@/lib/rental-service';
import { productAvailabilityQuerySchema } from '@/lib/validation';

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    await connectToDatabase();

    const isObjectId = mongoose.Types.ObjectId.isValid(slug);
    const product = await Product.findOne(
      isObjectId ? { $or: [{ slug }, { _id: slug }] } : { slug }
    ).populate({ path: 'category', select: 'name slug icon' });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const doc = product.toJSON() as any;
    doc.id = doc._id.toString();
    if (doc.category && (doc.category as any)._id) {
      (doc.category as any).id = (doc.category as any)._id.toString();
    }

    const { searchParams } = new URL(_req.url);
    const query = productAvailabilityQuerySchema.safeParse({
      rentalStart: searchParams.get('rentalStart') || undefined,
      rentalEnd: searchParams.get('rentalEnd') || undefined,
      quantity: searchParams.get('quantity') || undefined,
    });

    if (query.success && query.data.rentalStart && query.data.rentalEnd) {
      const availability = await getProductAvailability({
        productId: doc.id,
        rentalStart: query.data.rentalStart,
        rentalEnd: query.data.rentalEnd,
        quantity: query.data.quantity || 1,
      });

      if (availability.ok) {
        doc.availability = {
          availableQuantity: availability.data.availableQuantity,
          requestedQuantity: availability.data.requestedQuantity,
          isAvailable: availability.data.isAvailable,
          reservedQuantity: availability.data.reservedQuantity,
          conflictingBookings: availability.data.conflictingBookings,
        };
      }
    } else {
      doc.availability = {
        availableQuantity: doc.availableStock ?? doc.totalStock ?? 0,
        requestedQuantity: 1,
        isAvailable: (doc.availableStock ?? doc.totalStock ?? 0) > 0,
        reservedQuantity: 0,
        conflictingBookings: [],
      };
    }

    return NextResponse.json({ success: true, data: doc });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
