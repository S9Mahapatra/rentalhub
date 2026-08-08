'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Heart } from 'lucide-react';

interface StaticProduct {
  id: string;
  name: string;
  image: string;
  hourlyPrice: number;
  dailyPrice: number;
  rating: number;
  reviews: number;
  isBestseller?: boolean;
}

interface ProductCardProps {
  product: StaticProduct;
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-card rounded-2xl overflow-hidden group flex flex-col transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50 border border-white/5"
    >
      {/* Image Container */}
      <Link href={`/product/${product.id}`} className="relative h-56 w-full bg-dark-900 block overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.isBestseller && (
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-brand-500/30 text-brand-500 text-[10px] font-bold px-2 py-1 rounded tracking-wider">
            BESTSELLER
          </div>
        )}
      </Link>

      {/* Content Container */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={14} className="text-brand-500 fill-brand-500" />
            ))}
          </div>
          <span className="text-sm text-dark-300">
            {product.rating} ({product.reviews})
          </span>
        </div>

        {/* Title */}
        <Link href={`/product/${product.id}`}>
          <h3 className="text-lg font-medium text-white mb-1 group-hover:text-brand-500 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="text-sm text-dark-300 mb-5">
          ${product.hourlyPrice}/hr &bull; ${product.dailyPrice}/day
        </div>

        {/* Actions */}
        <div className="mt-auto flex items-center gap-3">
          <button className="flex-1 bg-brand-500 hover:bg-brand-400 text-black font-semibold py-2.5 rounded-lg transition-colors text-sm">
            RENT NOW
          </button>
          <button className="p-2.5 rounded-lg border border-white/10 hover:border-brand-500/50 hover:bg-white/5 text-dark-300 hover:text-brand-500 transition-all">
            <Heart size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
