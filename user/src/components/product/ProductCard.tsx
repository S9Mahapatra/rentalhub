'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { ProductType } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: ProductType;
  index: number;
  wishlistIds?: string[];
  onWishlistToggle?: (productId: string) => void;
}

export default function ProductCard({ product, index, wishlistIds, onWishlistToggle }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState<boolean>(wishlistIds ? wishlistIds.includes(product.id) : false);
  const [loading, setLoading] = useState(false);
  const isAvailable = (product as any).availability?.isAvailable ?? (product.availableStock > 0);
  const imageUrl = product.imageUrl || product.images?.[0] || '/placeholder.jpg';

  useEffect(() => {
    if (wishlistIds) {
      setIsWishlisted(wishlistIds.includes(product.id));
    }
  }, [wishlistIds, product.id]);

  const handleToggle = async () => {
    if (onWishlistToggle) {
      onWishlistToggle(product.id);
      window.dispatchEvent(new Event('wishlist-updated'));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });

      if (res.status === 401) {
        toast.error('Please sign in to add to wishlist');
        return;
      }

      const data = await res.json();
      if (data.success) {
        const added = data.data.action === 'added';
        setIsWishlisted(added);
        window.dispatchEvent(new Event('wishlist-updated'));
        toast.success(added ? 'Added to wishlist' : 'Removed from wishlist');
      } else {
        toast.error(data.error || 'Failed to update wishlist');
      }
    } catch {
      toast.error('Failed to update wishlist');
    } finally {
      setLoading(false);
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-[20px] border border-neutral-200/60 p-3.5 flex flex-col justify-between transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:border-neutral-300 hover:-translate-y-1.5 group relative overflow-hidden"
    >
      {/* Decorative Sheen Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full duration-[1500ms] ease-in-out transition-all pointer-events-none z-20" style={{ transform: 'skewX(-20deg)' }}></div>

      {/* Image Container */}
      <Link href={`/products/${product.slug || product.id}`} className="relative w-full aspect-[4/3] bg-neutral-50 group-hover:bg-emerald-50/30 transition-colors duration-500 rounded-[14px] overflow-hidden mb-5 p-1.5 flex items-center justify-center border border-neutral-100/80">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={index < 6}
          className="object-cover rounded-[10px] transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Floating Badges & Actions */}
        <div className="absolute inset-0 p-3 flex flex-col justify-between z-10 pointer-events-none">
          <div className="flex justify-between items-start">
            {product.isBestseller ? (
              <div className="bg-neutral-950 text-white text-[9px] font-black px-2.5 py-1 rounded-full tracking-widest uppercase shadow-sm">
                BESTSELLER
              </div>
            ) : <div></div>}
            
            <button 
              onClick={(e) => {
                e.preventDefault();
                handleToggle();
              }}
              disabled={loading}
              className="pointer-events-auto p-2 rounded-full bg-white/70 backdrop-blur-md shadow-sm transition-all duration-300 hover:bg-white text-neutral-400 hover:text-red-500 hover:scale-110 hover:shadow-md"
            >
              <Heart size={16} className={isWishlisted ? 'fill-red-500 text-red-500' : ''} />
            </button>
          </div>
        </div>
      </Link>

      {/* Content Container */}
      <div className="flex flex-col flex-grow px-1">
        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={12} className={star <= Math.round(product.ratingAvg || 0) ? "text-amber-400 fill-amber-400" : "text-neutral-200 fill-neutral-200"} />
            ))}
          </div>
          <span className="text-[11px] font-bold text-neutral-400">
            {product.ratingAvg || 0} ({product.ratingCount || 0})
          </span>
        </div>

        {/* Title */}
        <Link href={`/products/${product.slug || product.id}`}>
          <h3 className="text-[15px] font-bold text-neutral-950 line-clamp-2 mb-4 leading-snug group-hover:text-emerald-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Price & Action Area */}
        <div className="mt-auto pt-4 border-t border-neutral-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest mb-0.5">
              Daily Rate
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-neutral-950">
                {formatCurrency(product.dailyPrice)}
              </span>
            </div>
          </div>

          <Link
            href={`/products/${product.slug || product.id}`}
            className={`px-5 py-2.5 rounded-full transition-all text-xs font-bold flex items-center justify-center gap-1.5 ${
              isAvailable
                ? 'bg-neutral-950 hover:bg-neutral-850 text-white shadow-sm hover:shadow-md hover:scale-[1.03] active:scale-95'
                : 'bg-neutral-100 text-neutral-400 cursor-not-allowed pointer-events-none'
            }`}
          >
            {isAvailable ? 'RENT NOW' : 'UNAVAILABLE'}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
