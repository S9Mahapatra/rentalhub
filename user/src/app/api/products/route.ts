import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { getProductAvailability } from '@/lib/rental-service';
import { productAvailabilityQuerySchema } from '@/lib/validation';

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    const bestseller = searchParams.get('bestseller');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;
    const availabilityQuery = productAvailabilityQuerySchema.safeParse({
      rentalStart: searchParams.get('rentalStart') || undefined,
      rentalEnd: searchParams.get('rentalEnd') || undefined,
      quantity: searchParams.get('quantity') || undefined,
    });
    const rentalStart = availabilityQuery.success ? availabilityQuery.data.rentalStart : undefined;
    const rentalEnd = availabilityQuery.success ? availabilityQuery.data.rentalEnd : undefined;
    const rentalQuantity = availabilityQuery.success ? availabilityQuery.data.quantity || 1 : 1;

    const where: any = { isActive: true };

    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug });
      if (category) {
        where.category = category._id;
      } else {
        // If category doesn't exist, return empty
        return NextResponse.json({
          success: true,
          data: [],
          pagination: { page, limit, total: 0, pages: 0 },
        });
      }
    }
    
    if (bestseller === 'true') where.isBestseller = true;
    
    if (search) {
      where.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: search },
      ];
    }

    let orderBy: any = { createdAt: -1 };
    if (sort === 'price_low') orderBy = { dailyPrice: 1 };
    if (sort === 'price_high') orderBy = { dailyPrice: -1 };
    if (sort === 'rating') orderBy = { ratingAvg: -1 };
    if (sort === 'popular') orderBy = { ratingCount: -1 };

    const [products, total] = await Promise.all([
      Product.find(where)
        .populate({ path: 'category', select: 'name slug icon' })
        .sort(orderBy)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(where),
    ]);

    // Map _id to id for the frontend
    const mappedProducts = await Promise.all(products.map(async (p) => {
      const doc = p.toJSON() as any;
      doc.id = doc._id.toString();
      if (doc.category && (doc.category as any)._id) {
        (doc.category as any).id = (doc.category as any)._id.toString();
      }
      if (rentalStart && rentalEnd) {
        const availability = await getProductAvailability({
          productId: doc.id,
          rentalStart,
          rentalEnd,
          quantity: rentalQuantity,
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
      return doc;
    }));

    return NextResponse.json({
      success: true,
      data: mappedProducts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
