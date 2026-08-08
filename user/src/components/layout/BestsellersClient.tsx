'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Heart, 
  Star, 
  ShieldCheck, 
  ArrowUpRight, 
  Truck, 
  Store, 
  SlidersHorizontal,
  Sparkles,
  Check
} from 'lucide-react';

export interface RentalItem {
  id: string;
  title: string;
  brand: string;
  category: string;
  image: string;
  dailyRate: number;
  weeklyRate: number;
  deposit: number;
  rating: number;
  reviews: number;
  fulfillment: 'delivery' | 'pickup' | 'both';
  specs: string[];
  isAvailable: boolean;
  tag?: string;
}

interface BestsellersClientProps {
  initialProducts: RentalItem[];
  initialCategories: { name: string; slug: string }[];
}

export default function BestsellersClient({ initialProducts, initialCategories }: BestsellersClientProps) {
  const [billingCycle, setBillingCycle] = useState<'daily' | 'weekly'>('daily');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>('all');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [products, setProducts] = useState<RentalItem[]>(initialProducts);
  const categories = initialCategories;
  const [loading, setLoading] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = '/api/products?limit=6';
        if (activeCategorySlug !== 'all') {
          url += `&category=${activeCategorySlug}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.success) {
          const formattedProducts: RentalItem[] = data.data.map((p: any) => ({
            id: p.id,
            title: p.name,
            brand: p.attributes?.brand || p.brand || '',
            category: p.category?.name || '',
            image: p.images?.[0] || '',
            dailyRate: p.dailyPrice || 0,
            weeklyRate: p.weeklyPrice || (p.dailyPrice ? Math.round(p.dailyPrice * 7 * 0.8) : 0),
            deposit: p.securityDeposit || 0,
            rating: p.ratingAvg || 0,
            reviews: p.ratingCount || 0,
            fulfillment: p.storeLocation ? 'both' : 'delivery',
            specs: p.features?.slice(0, 3) || p.specifications?.slice(0, 3) || [],
            isAvailable: p.availability?.isAvailable ?? p.isActive ?? true,
            tag: p.tags?.[0] || '',
          }));
          setProducts(formattedProducts.slice(0, 6));
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeCategorySlug]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="w-full max-w-[1400px] mx-auto px-4 py-8">
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-neutral-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1 rounded-md bg-emerald-50 text-emerald-700">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-widest">
              CATALOG HIGHLIGHTS
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
            FEATURED RENTAL GEAR
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Reserve premium gear on daily or discounted weekly terms with 100% refundable security deposits[cite: 11].
          </p>
        </div>

        {/* SMART CONTROLS: RATE TOGGLE & VIEW ALL */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          {/* Daily / Weekly Toggle */}
          <div className="bg-neutral-100 p-1 rounded-full border border-neutral-200 flex items-center text-xs font-bold">
            <button
              onClick={() => setBillingCycle('daily')}
              className={`px-3.5 py-1.5 rounded-full transition-all ${
                billingCycle === 'daily'
                  ? 'bg-white text-neutral-950 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setBillingCycle('weekly')}
              className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1 ${
                billingCycle === 'weekly'
                  ? 'bg-neutral-950 text-white shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <span>Weekly</span>
              <span className="text-[9px] bg-emerald-500 text-neutral-950 px-1.5 py-0.2 rounded-full font-black">
                SAVE
              </span>
            </button>
          </div>

          <Link
            href="/products"
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-neutral-900 hover:text-neutral-600 transition-colors bg-white px-4 py-2 rounded-full border border-neutral-200"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* CATEGORY FILTER CHIPS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => {
              setActiveCategory(cat.name);
              setActiveCategorySlug(cat.slug);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
              activeCategorySlug === cat.slug
                ? 'bg-neutral-950 text-white border-neutral-950 shadow-2xs'
                : 'bg-white text-neutral-600 border-neutral-200/80 hover:bg-neutral-100'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* SMART PRODUCT GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-neutral-100 rounded-[11px] h-[400px] w-full border border-neutral-200"></div>
          ))
        ) : products.length === 0 ? (
          <div className="col-span-full text-center py-12 text-neutral-500">
            No products found in this category.
          </div>
        ) : products.map((product) => {
          const currentRate = billingCycle === 'daily' ? product.dailyRate : product.weeklyRate;

          return (
            <div
              key={product.id}
              className="group relative bg-white rounded-[11px] border border-neutral-200/80 p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:border-neutral-300 "
            >
              {/* TOP CARD BAR */}
              <div className="flex items-center justify-between mb-3 z-10">
                <div className="flex items-center gap-1.5">
                  {product.tag && (
                    <span className="px-2.5 py-0.5 rounded-full bg-neutral-950 text-white text-[10px] font-extrabold uppercase tracking-wider">
                      {product.tag}
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {product.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                <button
                  onClick={() => toggleFavorite(product.id)}
                  className="p-2 rounded-full bg-neutral-100/80 hover:bg-neutral-100 text-neutral-600 hover:text-red-500 transition-colors"
                  aria-label="Save to wishlist"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      favorites[product.id] ? 'fill-red-500 text-red-500' : ''
                    }`}
                  />
                </button>
              </div>

              {/* STAGE PRODUCT IMAGE */}
              <div className="relative w-full aspect-[4/3] bg-[#F7F7F9] rounded-[20px] overflow-hidden mb-4 p-3 flex items-center justify-center border border-neutral-100">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover rounded-[14px] group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-200 rounded-[14px] flex items-center justify-center text-neutral-400 text-xs font-semibold">
                    No Image
                  </div>
                )}

                {/* Fulfillment Indicator Overlay */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-neutral-200/70 text-[10px] font-bold text-neutral-700 shadow-2xs">
                  <div className="flex items-center gap-1.5">
                    {product.fulfillment === 'delivery' || product.fulfillment === 'both' ? (
                      <span className="flex items-center gap-1 text-neutral-800">
                        <Truck className="w-3 h-3 text-emerald-600" /> Doorstep
                      </span>
                    ) : null}
                    {product.fulfillment === 'both' ? <span>•</span> : null}
                    {product.fulfillment === 'pickup' || product.fulfillment === 'both' ? (
                      <span className="flex items-center gap-1 text-neutral-800">
                        <Store className="w-3 h-3 text-neutral-600" /> Store Pickup
                      </span>
                    ) : null}
                  </div>
                  <span className="text-neutral-400 font-semibold truncate max-w-[60px]">{product.brand}</span>
                </div>
              </div>

              {/* ITEM DETAILS */}
              <div className="flex flex-col flex-1 justify-between">
                <div>
                  {/* Category & Rating */}
                  <div className="flex items-center justify-between text-xs font-semibold text-neutral-400 mb-1">
                    <span>{product.category}</span>
                    <div className="flex items-center gap-1 text-neutral-900 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{product.rating}</span>
                      <span className="text-neutral-400 font-medium">({product.reviews})</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-neutral-950 text-base leading-snug line-clamp-2 mb-3" title={product.title}>
                    {product.title}
                  </h3>

                  {/* Smart Spec Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-4">
                    {product.specs.map((spec, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 text-[10px] font-semibold border border-neutral-200/60"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* PRICING & DEPOSIT FOOTER */}
                <div className="pt-4 border-t border-neutral-100 flex flex-col gap-3">
                  {/* Security Deposit Badge */}
                  <div className="flex items-center justify-between text-[11px] font-semibold bg-emerald-50/60 border border-emerald-200/80 px-3 py-1.5 rounded-xl text-emerald-900">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>100% Refundable Deposit</span>
                    </div>
                    <span className="font-extrabold text-neutral-950">₹{product.deposit}</span>
                  </div>

                  {/* Rate & Booking CTA */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wider">
                        {billingCycle === 'daily' ? 'DAILY RATE' : 'WEEKLY RATE'}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-neutral-950">
                          ₹{currentRate.toLocaleString()}
                        </span>
                        <span className="text-xs text-neutral-500 font-medium">
                          / {billingCycle === 'daily' ? 'day' : 'week'}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/products/${product.id}`}
                      className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-850 text-white rounded-full text-xs font-bold transition-all shadow-sm hover:scale-[1.02] active:scale-95 flex items-center gap-1.5"
                    >
                      <span>Rent Now</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}