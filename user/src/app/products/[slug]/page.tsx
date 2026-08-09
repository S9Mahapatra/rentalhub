import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Truck, 
  Store, 
  ArrowUpRight, 
  CheckCircle2, 
  ChevronRight,
  Sparkles,
  Layers,
  Info
} from 'lucide-react';
import BookingWidget from '@/components/product/BookingWidget';
import ProductCard from '@/components/product/ProductCard';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import mongoose from 'mongoose';
import { formatCurrency } from '@/lib/utils';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductDetailsPage({ params }: PageProps) {
  await connectToDatabase();
  const resolvedParams = await params;

  const query = mongoose.isValidObjectId(resolvedParams.slug)
    ? { $or: [{ slug: resolvedParams.slug }, { _id: resolvedParams.slug }] }
    : { slug: resolvedParams.slug };

  const product = (await Product.findOne(query).populate('category').lean()) as any;

  if (!product) {
    notFound();
  }

  const allImages = product.images?.length > 0 
    ? product.images 
    : [product.imageUrl || '/placeholder.jpg'];
  const mainImage = allImages[0];
  
  const isAvailable = product.availability?.isAvailable ?? (product.availableStock > 0);

  // Suggested rentals: other active products from the same category
  const suggestedDocs = product.category?._id
    ? ((await Product.find({
        category: product.category._id,
        _id: { $ne: product._id },
        isActive: true,
      })
        .sort({ isBestseller: -1, ratingAvg: -1, createdAt: -1 })
        .limit(5)
        .lean()) as any[])
    : [];

  const suggested = suggestedDocs.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    slug: p.slug,
    imageUrl: p.imageUrl || p.images?.[0] || '/placeholder.jpg',
    images: p.images || [],
    dailyPrice: p.dailyPrice,
    ratingAvg: p.ratingAvg || 0,
    ratingCount: p.ratingCount || 0,
    availableStock: p.availableStock ?? p.availableQuantity ?? 0,
    isBestseller: !!p.isBestseller,
  }));

  return (
    <div className="w-full bg-white min-h-screen pb-20">
      <div className="max-w-[1400px] mx-auto px-4 py-6 sm:py-8">
        
        {/* BREADCRUMB BAR */}
        <nav className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 mb-6 bg-[#F4F4F6] border border-neutral-200/80 px-4 py-2.5 rounded-full w-fit">
          <Link href="/products" className="hover:text-neutral-950 transition-colors">Catalog</Link>
          <ChevronRight className="w-3 h-3 text-neutral-400" />
          {product.category?.name && (
            <>
              <Link href={`/products?category=${product.category.slug}`} className="hover:text-neutral-950 transition-colors">
                {product.category.name}
              </Link>
              <ChevronRight className="w-3 h-3 text-neutral-400" />
            </>
          )}
          <span className="text-neutral-950 truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* MAIN PRODUCT GRID */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
          
          {/* LEFT COLUMN: Image Gallery & Long Description */}
          <div className="w-full lg:w-7/12 flex flex-col gap-6">
            
            {/* Hero Image Showcase (FIXED CONTAINER) */}
            <div className="relative w-full aspect-square sm:aspect-[4/3] bg-[#F4F4F6] rounded-[28px] border border-neutral-200/80 overflow-hidden group shadow-2xs">
              <Image
                src={mainImage}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                priority
              />

              {/* Bottom Gradient for Contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

              {/* Top Badges Overlay */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
                {product.isBestseller && (
                  <span className="bg-neutral-950 text-white text-[9px] font-black px-3 py-1 rounded-full tracking-widest uppercase shadow-md">
                    BESTSELLER
                  </span>
                )}
                {product.tags?.map((tag: string, i: number) => (
                  <span key={i} className="bg-white/90 backdrop-blur-md text-emerald-800 border border-emerald-200/80 text-[9px] font-black px-3 py-1 rounded-full tracking-widest uppercase shadow-2xs">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Availability Indicator (Pill over photo) */}
              <div className="absolute bottom-4 left-4 z-10">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold backdrop-blur-md shadow-md border ${
                  isAvailable 
                    ? 'bg-white/90 text-emerald-800 border-emerald-200' 
                    : 'bg-white/90 text-red-700 border-red-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                  {isAvailable ? 'Ready for Instant Booking' : 'Currently Rented Out'}
                </span>
              </div>
            </div>

            {/* Thumbnail Row */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1 custom-scrollbar">
                {allImages.map((img: string, idx: number) => (
                  <div 
                    key={idx}
                    className="relative w-20 h-20 bg-[#F4F4F6] border border-neutral-200/80 rounded-[18px] overflow-hidden shrink-0 cursor-pointer hover:border-neutral-950 transition-all"
                  >
                    <Image src={img} alt={`Thumb ${idx}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Desktop Overview & Key Highlights */}
            <div className="hidden lg:flex flex-col gap-8 pt-6 border-t border-neutral-200/60">
              
              {/* Product Overview */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-neutral-400" />
                  <h2 className="text-xs font-black text-neutral-950 uppercase tracking-widest">
                    Product Description
                  </h2>
                </div>
                <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                  {product.description || product.shortDescription || 'No detailed description specified for this item.'}
                </p>
              </div>

              {/* Key Features Bullet List */}
              {product.features?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <h2 className="text-xs font-black text-neutral-950 uppercase tracking-widest">
                      Key Gear Highlights
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.features.map((feature: string, i: number) => (
                      <div key={i} className="flex items-start gap-2.5 bg-[#F4F4F6] border border-neutral-200/60 p-3 rounded-2xl">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-xs text-neutral-800 font-semibold leading-snug">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* RIGHT COLUMN: Sticky Booking Widget & Financial Breakdown */}
          <div className="w-full lg:w-5/12">
            <div className="sticky top-24 space-y-6">
              
              {/* Title & Short Details */}
              <div>
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1.5">
                  {product.category?.name || 'RENTAL EQUIPMENT'}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight leading-snug mb-2">
                  {product.name}
                </h1>
                {product.shortDescription && (
                  <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                    {product.shortDescription}
                  </p>
                )}
              </div>

              {/* Pricing & Booking Card */}
              <div className="bg-[#F4F4F6] rounded-[28px] border border-neutral-200/80 p-6 shadow-2xs space-y-6">
                
                {/* Daily & Weekly Rate Display */}
                <div className="bg-white p-5 rounded-[22px] border border-neutral-200/80 flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="text-[9px] text-neutral-400 font-black uppercase tracking-widest block mb-0.5">
                      DAILY RENTAL RATE
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight">
                        {formatCurrency(product.dailyPrice)}
                      </span>
                      <span className="text-xs font-bold text-neutral-500">/day</span>
                    </div>
                  </div>

                  {product.weeklyPrice && (
                    <div className="text-right border-l border-neutral-100 pl-4">
                      <span className="text-[9px] text-emerald-700 font-black uppercase tracking-widest bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full inline-block mb-1">
                        WEEKLY DISCOUNT
                      </span>
                      <div className="flex items-baseline gap-1 justify-end">
                        <span className="text-lg font-black text-neutral-950">
                          {formatCurrency(product.weeklyPrice)}
                        </span>
                        <span className="text-[10px] font-bold text-neutral-500">/wk</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Security Deposit Guarantee Block */}
                <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-200/80 p-4 rounded-[20px]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100/80 rounded-xl text-emerald-800">
                      <ShieldCheck className="w-5 h-5 shrink-0" />
                    </div>
                    <div>
                      <span className="block text-xs font-black text-emerald-950">100% Refundable Deposit</span>
                      <span className="block text-[10px] font-bold text-emerald-700/80">Returned post-inspection</span>
                    </div>
                  </div>
                  <span className="font-black text-neutral-950 text-sm bg-white px-3 py-1.5 rounded-xl border border-emerald-200/80">
                    {formatCurrency(product.securityDeposit || 0)}
                  </span>
                </div>

                {/* Booking Widget (Dates + Rental Action) */}
                <BookingWidget 
                  productId={product._id.toString()}
                  isAvailable={isAvailable}
                  minRentalDays={product.minRentalDays || 1}
                />

                {/* Fulfillment Methods */}
                <div className="flex items-center justify-center gap-4 pt-2 border-t border-neutral-200/60">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-neutral-200/80 text-[10px] font-extrabold text-neutral-700 uppercase tracking-wider">
                    <Truck className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Doorstep Shipping</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-neutral-200/80 text-[10px] font-extrabold text-neutral-700 uppercase tracking-wider">
                    <Store className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Store Pickup</span>
                  </div>
                </div>

              </div>

              {/* Specifications Data Sheet */}
              <div className="bg-[#F4F4F6] rounded-[24px] p-5 border border-neutral-200/80">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-200/80">
                  <Layers className="w-4 h-4 text-neutral-400" />
                  <h3 className="text-[10px] font-black text-neutral-950 uppercase tracking-widest">
                    Technical Specifications
                  </h3>
                </div>

                <div className="space-y-2">
                  {product.attributes && Object.keys(product.attributes).length > 0 ? (
                    Object.entries(product.attributes).map(([key, value], idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-neutral-200/40 last:border-0">
                        <span className="text-neutral-500 font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-neutral-950 font-bold">{String(value)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-neutral-400 italic py-1">No custom specifications listed for this item.</div>
                  )}
                </div>
              </div>

              {/* Mobile Overview */}
              <div className="block lg:hidden space-y-6 pt-4 border-t border-neutral-200/80">
                <div>
                  <h2 className="text-xs font-black text-neutral-950 uppercase tracking-widest mb-2">
                    Product Description
                  </h2>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {product.description || product.shortDescription}
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* SUGGESTED RENTALS SECTION */}
        {suggested.length > 0 && (
          <section className="mt-20 pt-10 border-t border-neutral-200/80">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60 inline-block mb-2">
                  EXPLORE SIMILAR GEAR
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-neutral-950 uppercase tracking-tight">
                  Suggested Rentals
                </h2>
              </div>

              {product.category?.slug && (
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-950 text-white text-xs font-bold hover:bg-neutral-800 transition-colors shadow-2xs"
                >
                  <span>View All Category Items</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {suggested.map((item, i) => (
                <ProductCard key={item.id} product={item as any} index={i} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}