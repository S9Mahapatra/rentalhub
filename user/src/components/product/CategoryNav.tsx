'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export default function CategoryNav() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(({ data }) => setCategories(data || []))
      .catch(() => {});
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 className="text-2xl font-bold text-white mb-2">Browse by Category</h2>
          <p className="text-dark-400 text-sm mb-8">Find exactly what you need</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                href={`/products?category=${cat.id}`}
                className="flex flex-col items-center gap-3 p-5 bg-dark-800/30 border border-white/5 rounded-2xl hover:border-brand-500/30 hover:bg-dark-800/60 transition-all duration-300 group"
              >
                <span className="text-3xl group-hover:scale-125 transition-transform duration-300">{cat.icon}</span>
                <span className="text-xs font-medium text-dark-300 group-hover:text-white transition-colors text-center">{cat.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
