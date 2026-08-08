'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getCategoryIcon } from '@/lib/category-icons';

export default function CategoryNav() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setCategories(data.data);
        }
      })
      .catch((err) => console.error('Failed to fetch categories:', err));
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="py-12 bg-app">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 md:gap-16">
          {categories.map((cat, i) => {
            const Icon = getCategoryIcon(cat);
            return (
              <motion.div
                key={cat.id || cat.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Link
                  href={`/products?category=${cat.slug}`}
                  className="flex flex-col items-center gap-4 group"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-brand-500 flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110 shadow-lg shadow-brand-500/20">
                    <Icon size={36} className="text-black" strokeWidth={1.5} />
                  </div>
                  <span className="text-sm sm:text-base font-medium text-dark-200 group-hover:text-white transition-colors text-center tracking-wide">
                    {cat.name}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
