'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ProductType } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: ProductType;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative bg-dark-800/40 border border-white/5 rounded-2xl overflow-hidden hover:border-brand-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-500/5 hover:-translate-y-1"
    >
      <Link href={`/product/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-dark-900">
          <Image
            src={product.images[0] || '/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {product.isBestseller && (
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg text-xs font-bold text-white shadow-lg shadow-amber-500/25">
              Bestseller
            </div>
          )}

          {product.originalPrice && product.originalPrice > product.dailyPrice * 30 && (
            <div className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-500/90 backdrop-blur-sm rounded-lg text-xs font-bold text-white">
              Save {Math.round(((product.originalPrice - product.dailyPrice * 30) / product.originalPrice) * 100)}%
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.ratingAvg) ? 'text-amber-400' : 'text-dark-600'}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="text-xs text-dark-400 ml-1">({product.ratingCount})</span>
        </div>

        <Link href={`/product/${product.slug}`}>
          <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-brand-400 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <p className="text-dark-400 text-xs mb-3 line-clamp-1">{product.shortDescription}</p>

        <div className="flex items-end justify-between">
          <div>
            <span className="text-lg font-bold text-white">{formatCurrency(product.dailyPrice)}</span>
            <span className="text-xs text-dark-400 ml-1">/day</span>
          </div>
          <Link
            href={`/product/${product.slug}`}
            className="px-3 py-1.5 bg-brand-600/20 hover:bg-brand-600 text-brand-400 hover:text-white text-xs font-semibold rounded-lg transition-all duration-200 border border-brand-500/20 hover:border-brand-500"
          >
            Rent Now
          </Link>
        </div>

        {product.availableStock <= 3 && product.availableStock > 0 && (
          <p className="text-xs text-amber-400 mt-2.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
            Only {product.availableStock} left
          </p>
        )}
      </div>
    </motion.div>
  );
}
