'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Video, Camera, Lightbulb, SlidersHorizontal, Briefcase, Flame } from 'lucide-react';

const CATEGORIES = [
  { name: 'Cinema Rigs', icon: Video, href: '/products?category=cinema' },
  { name: 'Mirrorless', icon: Camera, href: '/products?category=mirrorless' },
  { name: 'Studio Light', icon: Lightbulb, href: '/products?category=lighting' },
  { name: 'Sound Gear', icon: SlidersHorizontal, href: '/products?category=audio' },
  { name: 'Production Kits', icon: Briefcase, href: '/products?category=kits' },
  { name: 'Hot Deals', icon: Flame, href: '/products?category=deals' },
];

export default function CategoryNav() {
  return (
    <section className="py-12 bg-app">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 md:gap-16">
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Link
                  href={cat.href}
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
