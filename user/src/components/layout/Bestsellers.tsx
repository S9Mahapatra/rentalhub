import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import BestsellersClient, { RentalItem } from './BestsellersClient';

export default async function Bestsellers() {
  try {
    await connectToDatabase();

    // 1. Pre-fetch Categories for the Client
    const categoriesDb = await Category.find({ isActive: true }).sort({ name: 1 }).lean();
    const initialCategories = [
      { name: 'All', slug: 'all' },
      ...categoriesDb.map((c: any) => ({ name: c.name, slug: c.slug }))
    ];

    // 2. Pre-fetch Initial 6 Products (The 'All' category)
    const productsDb = await Product.find({ isActive: true })
      .populate({ path: 'category', select: 'name slug icon' })
      .sort({ createdAt: -1 })
      .limit(6);

    const initialProducts: RentalItem[] = productsDb.map((p: any) => {
      // Need to convert to JSON to strip mongoose meta for Client Component
      const doc = typeof p.toJSON === 'function' ? p.toJSON() : p;
      return {
        id: doc._id.toString(),
        title: doc.name || '',
        brand: doc.attributes?.brand || doc.brand || '',
        category: doc.category?.name || '',
        image: doc.images?.[0] || '',
        dailyRate: doc.dailyPrice || 0,
        weeklyRate: doc.weeklyPrice || (doc.dailyPrice ? Math.round(doc.dailyPrice * 7 * 0.8) : 0),
        deposit: doc.securityDeposit || 0,
        rating: doc.ratingAvg || 0,
        reviews: doc.ratingCount || 0,
        fulfillment: doc.storeLocation ? 'both' : 'delivery',
        specs: doc.features?.slice(0, 3) || doc.specifications?.slice(0, 3) || [],
        isAvailable: doc.availability?.isAvailable ?? doc.isActive ?? true,
        tag: doc.tags?.[0] || '',
      };
    });

    return (
      <BestsellersClient 
        initialProducts={initialProducts} 
        initialCategories={initialCategories} 
      />
    );
  } catch (error) {
    console.error('Failed to fetch initial data for Bestsellers:', error);
    // Fallback to empty if DB fails so UI doesn't crash entirely
    return <BestsellersClient initialProducts={[]} initialCategories={[{ name: 'All', slug: 'all' }]} />;
  }
}