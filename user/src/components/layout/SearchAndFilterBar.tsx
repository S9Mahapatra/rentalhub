'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Calendar, Grid } from 'lucide-react';
import { getCategoryIcon } from '@/lib/category-icons';

interface CategoryPill {
  id?: string;
  name: string;
  slug: string;
  icon?: string;
}

export default function SearchAndFilterBar() {
  const [categories, setCategories] = useState<CategoryPill[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setCategories(data.data);
      })
      .catch((err) => console.error('Failed to fetch categories:', err));
  }, []);

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 my-6">
      {/* Search & Date Filter Bar */}
      <div className="bg-[#F4F4F6] p-2.5 sm:p-3 rounded-full flex flex-col sm:flex-row items-center gap-3 shadow-xs border border-neutral-200/70">
        
        {/* Search Query */}
        <div className="flex-1 flex items-center gap-3 px-4 py-2 w-full">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Search rental items (e.g. Sony A7IV, PS5, Trekking Tent)..." 
            className="w-full bg-transparent border-none text-sm font-medium text-neutral-800 placeholder-neutral-400 focus:outline-none"
          />
        </div>

        <div className="h-6 w-[1px] bg-neutral-300 hidden sm:block" />

        {/* Rental Date Range Selector */}
        <div className="flex items-center gap-2.5 px-4 py-2 w-full sm:w-auto justify-start text-xs sm:text-sm font-semibold text-neutral-700">
          <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="flex items-center gap-2">
            <input type="date" className="bg-white border border-neutral-200 rounded-lg px-2 py-1 text-xs text-neutral-800 focus:outline-none" />
            <span className="text-neutral-400">to</span>
            <input type="date" className="bg-white border border-neutral-200 rounded-lg px-2 py-1 text-xs text-neutral-800 focus:outline-none" />
          </div>
        </div>

        {/* Check Availability CTA */}
        <button className="bg-neutral-950 hover:bg-neutral-850 text-white px-6 py-3 rounded-full text-xs font-bold flex items-center justify-center gap-2 w-full sm:w-auto transition-all shadow-sm">
          <Search className="w-4 h-4" />
          <span>Check Availability</span>
        </button>
      </div>

      {/* Category Pills — sourced from the database, managed in the admin app */}
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pt-4 pb-1">
        <Link
          href="/products"
          className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border bg-neutral-950 text-white border-neutral-950 shadow-xs"
        >
          <Grid className="w-3.5 h-3.5" />
          <span>All Rentals</span>
        </Link>

        {categories.map((cat) => {
          const Icon = getCategoryIcon(cat);
          return (
            <Link
              key={cat.id || cat.slug}
              href={`/products?category=${cat.slug}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border bg-[#F4F4F6] text-neutral-700 border-transparent hover:bg-neutral-200/80"
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}