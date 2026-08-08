'use client';

import { motion } from 'framer-motion';
import ProductCard from './ProductCard';

const STATIC_PRODUCTS = [
  {
    id: '1',
    name: 'Sony FX3 Kit',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop',
    hourlyPrice: 18,
    dailyPrice: 95,
    rating: 4.9,
    reviews: 120,
    isBestseller: true,
  },
  {
    id: '2',
    name: 'Aputure 600d',
    image: 'https://images.unsplash.com/photo-1595822394205-0cd8832a82dc?q=80&w=1000&auto=format&fit=crop',
    hourlyPrice: 18,
    dailyPrice: 95,
    rating: 4.9,
    reviews: 120,
    isBestseller: true,
  },
  {
    id: '3',
    name: 'RED Komodo',
    image: 'https://images.unsplash.com/photo-1620556272504-20eb6085a676?q=80&w=1000&auto=format&fit=crop',
    hourlyPrice: 18,
    dailyPrice: 95,
    rating: 4.9,
    reviews: 120,
    isBestseller: true,
  },
  {
    id: '4',
    name: 'DJI RS3 Pro',
    image: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?q=80&w=1000&auto=format&fit=crop',
    hourlyPrice: 18,
    dailyPrice: 95,
    rating: 4.9,
    reviews: 120,
    isBestseller: true,
  },
];

export default function Bestsellers() {
  return (
    <section className="py-16 bg-app pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-500 uppercase tracking-widest">
            BESTSELLERS
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATIC_PRODUCTS.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
