import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    
    // Ensure Category model is registered for population
    if (!Category) console.log('Category model loaded');

    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    const bestseller = searchParams.get('bestseller');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

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
    const mappedProducts = products.map(p => {
      const doc = p.toJSON() as any;
      doc.id = doc._id.toString();
      if (doc.category && (doc.category as any)._id) {
        (doc.category as any).id = (doc.category as any)._id.toString();
      }
      return doc;
    });

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
