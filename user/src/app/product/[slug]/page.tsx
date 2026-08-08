'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { ProductType } from '@/types';
import { calculateRentalBreakdown, formatCurrency } from '@/lib/utils';

function formatDateTimeLocal(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);
  const [rentalStart, setRentalStart] = useState('');
  const [rentalEnd, setRentalEnd] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [adding, setAdding] = useState(false);
  const [availability, setAvailability] = useState<any>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  useEffect(() => {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(10, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 2);
    end.setHours(18, 0, 0, 0);
    setRentalStart(formatDateTimeLocal(start));
    setRentalEnd(formatDateTimeLocal(end));
  }, []);

  useEffect(() => {
    if (params.slug) {
      fetch(`/api/products/${params.slug}`)
        .then((r) => r.json())
        .then(({ data }) => {
          setProduct(data);
          setAvailability(data?.availability || null);
          if (data?.availability?.availableQuantity) {
            setQuantity((prev) => Math.min(prev, data.availability.availableQuantity));
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [params.slug]);

  useEffect(() => {
    if (!params.slug || !rentalStart || !rentalEnd) return;

    const controller = new AbortController();
    setAvailabilityLoading(true);

    fetch(`/api/products/${params.slug}?rentalStart=${encodeURIComponent(rentalStart)}&rentalEnd=${encodeURIComponent(rentalEnd)}&quantity=${quantity}`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then(({ data }) => {
        setAvailability(data?.availability || null);
        if (data?.availability?.availableQuantity) {
          setQuantity((prev) => Math.min(prev, data.availability.availableQuantity));
        }
      })
      .catch(() => {})
      .finally(() => setAvailabilityLoading(false));

    return () => controller.abort();
  }, [params.slug, rentalStart, rentalEnd, quantity]);

  const handleAddToCart = async () => {
    if (!session) { toast.error('Please sign in'); router.push('/auth/login'); return; }
    if (!rentalStart || !rentalEnd) { toast.error('Select rental dates'); return; }
    if (!availability?.isAvailable) {
      toast.error('Selected rental period is unavailable');
      return;
    }

    setAdding(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product!.id, quantity, rentalStart, rentalEnd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Added to cart!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add');
    } finally {
      setAdding(false);
    }
  };

  const pricing = product && rentalStart && rentalEnd
    ? calculateRentalBreakdown({
        dailyPrice: product.dailyPrice,
        weeklyPrice: product.weeklyPrice,
        monthlyPrice: product.monthlyPrice,
        rentalStartAt: rentalStart,
        expectedReturnAt: rentalEnd,
        quantity,
      })
    : null;

  const rentalDays = pricing?.billingDays || 0;
  const pricePerDay = pricing?.pricePerDay || 0;
  const totalRental = pricing?.rentalAmount || 0;
  const securityDeposit = product ? product.securityDeposit * quantity : 0;
  const availableQuantity = availability?.availableQuantity ?? product?.availableStock ?? 0;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 animate-pulse">
          <div className="aspect-square bg-dark-800 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-dark-800 rounded w-3/4" />
            <div className="h-4 bg-dark-800 rounded w-1/2" />
            <div className="h-32 bg-dark-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-dark-400">Product not found</div>;
  }

  const allImages = product.imageUrl ? [product.imageUrl, ...(product.images || [])] : (product.images || []);
  const mainImage = allImages[selectedImage] || '/placeholder.jpg';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-dark-800 mb-4">
            <Image src={mainImage} alt={product.name} fill className="object-cover" />
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-2">
              {allImages.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)} className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-brand-500 shadow-lg shadow-brand-500/25' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                  <Image src={img} alt="" width={64} height={64} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <div className="flex items-center gap-2 mb-3">
            {product.isBestseller && <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-lg">Bestseller</span>}
            <span className="px-2.5 py-1 bg-dark-700 text-dark-300 text-xs rounded-lg">{product.category?.name}</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">{product.name}</h1>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-4 h-4 ${i < Math.floor(product.ratingAvg) ? 'text-amber-400' : 'text-dark-600'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-dark-400">{product.ratingAvg} ({product.ratingCount} reviews)</span>
          </div>

          <p className="text-dark-300 mb-6 leading-relaxed">{product.description}</p>

          <div className="bg-dark-800/50 border border-white/5 rounded-2xl p-5 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <div className="p-3 bg-dark-900/50 rounded-xl">
                <p className="text-xs text-dark-400 mb-1">Daily</p>
                <p className="text-lg font-bold text-white">{formatCurrency(product.dailyPrice)}</p>
              </div>
              {product.weeklyPrice && (
                <div className="p-3 bg-dark-900/50 rounded-xl">
                  <p className="text-xs text-dark-400 mb-1">Weekly</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(product.weeklyPrice)}</p>
                </div>
              )}
              {product.monthlyPrice && (
                <div className="p-3 bg-dark-900/50 rounded-xl">
                  <p className="text-xs text-dark-400 mb-1">Monthly</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(product.monthlyPrice)}</p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-dark-400">Security Deposit</span>
              <span className="text-white font-medium">{formatCurrency(product.securityDeposit)}</span>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-dark-400 mb-1.5 block font-medium">Start Date &amp; Time</label>
                <input
                  type="datetime-local"
                  value={rentalStart}
                  min={formatDateTimeLocal(new Date())}
                  onChange={(e) => setRentalStart(e.target.value)}
                  className="w-full bg-dark-800 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/25 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-dark-400 mb-1.5 block font-medium">End Date &amp; Time</label>
                <input
                  type="datetime-local"
                  value={rentalEnd}
                  min={rentalStart || formatDateTimeLocal(new Date())}
                  onChange={(e) => setRentalEnd(e.target.value)}
                  className="w-full bg-dark-800 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/25 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-dark-400 mb-1.5 block font-medium">Quantity</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 bg-dark-800 border border-white/10 rounded-xl text-white flex items-center justify-center hover:bg-dark-700 transition-colors">-</button>
                <span className="text-white font-semibold w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(availableQuantity || product.availableStock || 1, quantity + 1))}
                  className="w-10 h-10 bg-dark-800 border border-white/10 rounded-xl text-white flex items-center justify-center hover:bg-dark-700 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {pricing && (
            <div className="bg-dark-800/50 border border-white/5 rounded-2xl p-5 mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-dark-400">Rental ({rentalDays} days × {quantity})</span>
                <span className="text-white">{formatCurrency(totalRental)}</span>
              </div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-dark-400">Security Deposit</span>
                <span className="text-white">{formatCurrency(securityDeposit)}</span>
              </div>
              <div className="border-t border-white/5 pt-3 flex justify-between">
                <span className="text-white font-semibold">Total</span>
                <span className="text-brand-400 font-bold text-xl">{formatCurrency(totalRental + securityDeposit)}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-sm mb-4">
            <span className="text-dark-400">
              Availability
            </span>
            <span className={availability?.isAvailable ? 'text-emerald-400' : 'text-red-400'}>
              {availabilityLoading ? 'Checking…' : availability?.isAvailable ? `${availableQuantity} available` : 'Unavailable'}
            </span>
          </div>

          <div className="flex gap-3">
            <button onClick={handleAddToCart} disabled={adding || !availability?.isAvailable} className="flex-1 py-3.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-brand-600/20 hover:shadow-brand-500/30">
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>

          {availableQuantity <= 5 && availableQuantity > 0 && (
            <p className="text-sm text-amber-400 mt-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
              Only {availableQuantity} units available
            </p>
          )}
          {availability && !availability.isAvailable && (
            <p className="text-sm text-red-400 mt-3">
              Selected rental period overlaps with an existing booking.
            </p>
          )}
        </motion.div>
      </div>

      {product.specifications && (product.specifications as any[]).length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12">
          <h2 className="text-xl font-bold text-white mb-4">Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(product.specifications as any[]).map((spec: any, i: number) => (
              <div key={i} className="flex justify-between py-3 px-4 bg-dark-800/50 rounded-xl border border-white/5">
                <span className="text-dark-400 text-sm">{spec.key}</span>
                <span className="text-white text-sm font-medium">{spec.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {product.features.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-8">
          <h2 className="text-xl font-bold text-white mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {product.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2.5 text-dark-300 text-sm py-1">
                <svg className="w-4 h-4 text-brand-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                {feature}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
