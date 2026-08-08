'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ProductType } from '@/types';
import ProductCard from './ProductCard';

export default function Bestsellers() {
  const [products, setProducts] = useState<ProductType[]>([]);

  useEffect(() => {
    fetch('/api/products?bestseller=true&limit=8')
      .then((r) => r.json())
      .then(({ data }) => setProducts(data || []))
      .catch(() => {});
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <h2 className="text-2xl font-bold text-white">Bestsellers</h2>
            <p className="text-dark-400 text-sm mt-1">Most rented products this month</p>
          </div>
          <Link href="/products?bestseller=true" className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors hidden sm:block">
            View All →
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
