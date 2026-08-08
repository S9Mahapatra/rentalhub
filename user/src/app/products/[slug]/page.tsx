import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShieldCheck, Truck, Store, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import BookingWidget from '@/components/product/BookingWidget';
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

  const product = await Product.findOne(query).populate('category').lean() as any;

  if (!product) {
    notFound();
  }

  const imageUrl = product.imageUrl || product.images?.[0] || '/placeholder.jpg';
  const isAvailable = product.availability?.isAvailable ?? (product.availableStock > 0);

  return (
    <div className="w-full bg-white min-h-screen pb-24">
      <div className="max-w-[1400px] mx-auto px-4 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-neutral-400 mb-8">
          <Link href="/products" className="hover:text-neutral-900 transition-colors">Catalog</Link>
          <span>/</span>
          {product.category?.name && (
            <>
              <Link href={`/products?category=${product.category.slug}`} className="hover:text-neutral-900 transition-colors">
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-neutral-900 truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Left: Image Gallery */}
          <div className="w-full lg:w-3/5">
            <div className="relative w-full aspect-square md:aspect-[4/3] bg-[#F7F7F9] rounded-[20px] sm:rounded-[32px] border border-neutral-200/80 p-4 sm:p-8 flex items-center justify-center overflow-hidden group">
              <Image 
                src={imageUrl} 
                alt={product.name} 
                fill 
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              
              {/* Badges */}
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                {product.isBestseller && (
                  <span className="bg-neutral-950 text-white text-[10px] font-black px-3 py-1.5 rounded-full tracking-widest uppercase shadow-sm">
                    BESTSELLER
                  </span>
                )}
                {product.tags?.map((tag: string, i: number) => (
                  <span key={i} className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-extrabold px-3 py-1.5 rounded-full tracking-widest uppercase">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Features & Description (Desktop) */}
            <div className="hidden lg:block mt-12 space-y-8">
              <div>
                <h2 className="text-xl font-extrabold text-neutral-950 tracking-tight mb-4">PRODUCT OVERVIEW</h2>
                <p className="text-neutral-500 leading-relaxed text-sm">
                  {product.description || product.shortDescription || 'No description available for this product.'}
                </p>
              </div>

              {product.features?.length > 0 && (
                <div>
                  <h2 className="text-xl font-extrabold text-neutral-950 tracking-tight mb-4">KEY FEATURES</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {product.features.map((feature: string, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-neutral-600 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Product Details & Sticky Booking Card */}
          <div className="w-full lg:w-2/5">
            <div className="sticky top-24">
              {/* Title & Rating */}
              <div className="mb-6">
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={14} className={star <= Math.round(product.ratingAvg || 0) ? "text-amber-400 fill-amber-400" : "text-neutral-200 fill-neutral-200"} />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-neutral-400 ml-1">
                    {product.ratingAvg || 0} Rating ({product.ratingCount || 0} Reviews)
                  </span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight leading-tight mb-4">
                  {product.name}
                </h1>
                
                <p className="text-neutral-500 text-sm font-medium">
                  {product.shortDescription || product.description?.substring(0, 100) + '...'}
                </p>
              </div>

              {/* Pricing Card */}
              <div className="bg-white rounded-[24px] border border-neutral-200/80 p-6 sm:p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest block mb-1">
                      DAILY RATE
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-neutral-950">
                        {formatCurrency(product.dailyPrice)}
                      </span>
                      <span className="text-sm font-bold text-neutral-500">/day</span>
                    </div>
                  </div>
                  
                  {product.weeklyPrice && (
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest block mb-1 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                        WEEKLY SAVE
                      </span>
                      <div className="flex items-baseline gap-1 justify-end">
                        <span className="text-xl font-black text-neutral-950">
                          {formatCurrency(product.weeklyPrice)}
                        </span>
                        <span className="text-xs font-bold text-neutral-500">/week</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-full h-px bg-neutral-100 mb-6"></div>

                {/* Security Deposit Badge */}
                <div className="flex items-center justify-between bg-emerald-50/60 border border-emerald-200/80 px-4 py-3 rounded-2xl mb-6">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="block text-xs font-extrabold text-emerald-900">Refundable Deposit</span>
                      <span className="block text-[10px] font-bold text-emerald-700/70">Returned after inspection</span>
                    </div>
                  </div>
                  <span className="font-black text-neutral-950 text-base">{formatCurrency(product.securityDeposit || 0)}</span>
                </div>

                {/* Booking Widget (Dates + Action Button) */}
                <BookingWidget 
                  productId={product._id.toString()}
                  isAvailable={isAvailable}
                  minRentalDays={product.minRentalDays || 1}
                />
                
                {/* Fulfillment Info */}
                <div className="flex items-center justify-center gap-6 mt-6">
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest">
                    <Truck className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Delivery</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest">
                    <Store className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Store Pickup</span>
                  </div>
                </div>
              </div>

              {/* Specifications (Mobile falls here too) */}
              <div className="bg-[#F7F7F9] rounded-[20px] p-6 border border-neutral-100">
                <h3 className="text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-4">SPECIFICATIONS</h3>
                <div className="space-y-3">
                  {product.attributes && Object.entries(product.attributes).map(([key, value], idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-neutral-500 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="text-neutral-950 font-bold">{String(value)}</span>
                    </div>
                  ))}
                  {(!product.attributes || Object.keys(product.attributes).length === 0) && (
                    <div className="text-sm text-neutral-400 italic">No detailed specifications listed.</div>
                  )}
                </div>
              </div>

              {/* Mobile Description (hidden on desktop) */}
              <div className="block lg:hidden mt-8 space-y-6">
                <div>
                  <h2 className="text-lg font-black text-neutral-950 tracking-tight mb-3">OVERVIEW</h2>
                  <p className="text-neutral-500 leading-relaxed text-sm">
                    {product.description || product.shortDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
