'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import ProductCard from '@/components/product/ProductCard';
import { ProductType } from '@/types';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const bestseller = searchParams.get('bestseller') || '';
  const sort = searchParams.get('sort') || '';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    if (bestseller) params.set('bestseller', bestseller);
    if (sort) params.set('sort', sort);
    params.set('page', String(page));
    params.set('limit', '12');

    setLoading(true);
    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then(({ data, pagination: p }) => { setProducts(data || []); setPagination(p); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, search, bestseller, sort, page]);

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then(({ data }) => setCategories(data || [])).catch(() => {});
  }, []);

  const buildUrl = (overrides: Record<string, string>) => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    if (bestseller) params.set('bestseller', bestseller);
    if (sort) params.set('sort', sort);
    Object.entries(overrides).forEach(([k, v]) => { if (v) params.set(k, v); else params.delete(k); });
    return `/products?${params}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0">
          <div className="sticky top-24 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">Categories</h3>
              <div className="space-y-1">
                <a href="/products" className={`block px-3 py-2 text-sm rounded-xl transition-all ${!category ? 'bg-brand-600/20 text-brand-400 font-medium' : 'text-dark-400 hover:text-white hover:bg-white/5'}`}>
                  All Products
                </a>
                {categories.map((cat: any) => (
                  <a key={cat.id} href={`/products?category=${cat.id}`} className={`block px-3 py-2 text-sm rounded-xl transition-all ${category === cat.id ? 'bg-brand-600/20 text-brand-400 font-medium' : 'text-dark-400 hover:text-white hover:bg-white/5'}`}>
                    {cat.icon} {cat.name}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">Sort By</h3>
              <div className="space-y-1">
                {[
                  { value: '', label: 'Newest' },
                  { value: 'price_low', label: 'Price: Low to High' },
                  { value: 'price_high', label: 'Price: High to Low' },
                  { value: 'rating', label: 'Top Rated' },
                  { value: 'popular', label: 'Most Popular' },
                ].map((opt) => (
                  <a key={opt.value} href={buildUrl({ sort: opt.value })} className={`block px-3 py-2 text-sm rounded-xl transition-all ${sort === opt.value ? 'bg-brand-600/20 text-brand-400 font-medium' : 'text-dark-400 hover:text-white hover:bg-white/5'}`}>
                    {opt.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">
              {search ? `Results for "${search}"` : bestseller ? 'Bestsellers' : 'All Products'}
            </h1>
            <p className="text-sm text-dark-400 mt-1">{pagination.total} products found</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-dark-800/40 rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-dark-700" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-dark-700 rounded w-3/4" />
                    <div className="h-3 bg-dark-700 rounded w-1/2" />
                    <div className="h-6 bg-dark-700 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-dark-400 text-lg">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {[...Array(pagination.pages)].map((_, i) => (
                <a
                  key={i}
                  href={buildUrl({ page: String(i + 1) })}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-all ${pagination.page === i + 1 ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25' : 'bg-dark-800/50 text-dark-400 hover:text-white hover:bg-dark-700'}`}
                >
                  {i + 1}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
