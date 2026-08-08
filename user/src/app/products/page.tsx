'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ProductCard from '@/components/product/ProductCard';
import { ProductType } from '@/types';
import { getCategoryIcon } from '@/lib/category-icons';

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
    setError('');
    fetch(`/api/products?${params}`)
      .then(async (r) => {
        const payload = await r.json();
        if (!r.ok) throw new Error(payload.error || 'Failed to load products');
        return payload;
      })
      .then(({ data, pagination: p }) => {
        setProducts(data || []);
        setPagination(p || { page: 1, pages: 1, total: 0 });
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [category, search, bestseller, sort, page]);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(({ data }) => setCategories(data || []))
      .catch(() => {});
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
    <div className="flex flex-col lg:flex-row gap-8">
      <aside className="lg:w-64 shrink-0">
        <div className="sticky top-24 space-y-8">
          <div>
            <h3 className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-widest mb-4">Categories</h3>
            <div className="space-y-1.5 flex flex-col">
              <Link href="/products" className={`block px-4 py-2 text-xs font-bold rounded-full transition-all border ${!category ? 'bg-neutral-950 text-white border-neutral-950 shadow-2xs' : 'bg-white text-neutral-600 border-transparent hover:bg-neutral-100 hover:text-neutral-900'}`}>
                All Products
              </Link>
              {categories.map((cat: any) => (
                <Link key={cat.id || cat.slug} href={`/products?category=${cat.slug}`} className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full transition-all border ${category === cat.slug ? 'bg-neutral-950 text-white border-neutral-950 shadow-2xs' : 'bg-white text-neutral-600 border-transparent hover:bg-neutral-100 hover:text-neutral-900'}`}>
                  {(() => {
                    const Icon = getCategoryIcon(cat);
                    return <Icon size={14} className="shrink-0" />;
                  })()}
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-widest mb-4">Sort By</h3>
            <div className="space-y-1.5 flex flex-col">
              {[
                { value: '', label: 'Newest' },
                { value: 'price_low', label: 'Price: Low to High' },
                { value: 'price_high', label: 'Price: High to Low' },
                { value: 'rating', label: 'Top Rated' },
                { value: 'popular', label: 'Most Popular' },
              ].map((opt) => (
                <a key={opt.value} href={buildUrl({ sort: opt.value })} className={`block px-4 py-2 text-xs font-bold rounded-full transition-all border ${sort === opt.value ? 'bg-neutral-950 text-white border-neutral-950 shadow-2xs' : 'bg-white text-neutral-600 border-transparent hover:bg-neutral-100 hover:text-neutral-900'}`}>
                  {opt.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1">
        <div className="mb-8 border-b border-neutral-200/80 pb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
            {search ? `RESULTS FOR "${search.toUpperCase()}"` : bestseller ? 'BESTSELLERS' : 'ALL PRODUCTS'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">{pagination.total} products found in our catalog.</p>
        </div>

        {error ? (
          <div className="text-center py-20 bg-neutral-50 border border-red-200 rounded-[20px]">
            <p className="text-red-500 font-bold text-lg mb-2">Failed to load products</p>
            <p className="text-neutral-500 text-sm">{error}</p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-neutral-100 rounded-[16px] h-[360px] w-full border border-neutral-200"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-neutral-50 rounded-[20px] border border-neutral-200/80">
            <p className="text-neutral-500 text-sm font-semibold">No products found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product as any} index={i} />
            ))}
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            {[...Array(pagination.pages)].map((_, i) => (
              <a
                key={i}
                href={buildUrl({ page: String(i + 1) })}
                className={`w-9 h-9 flex items-center justify-center rounded-full text-xs font-extrabold transition-all border ${pagination.page === i + 1 ? 'bg-neutral-950 text-white border-neutral-950 shadow-md' : 'bg-white border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'}`}
              >
                {i + 1}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="w-full bg-white min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <Suspense fallback={<div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div></div>}>
          <ProductsContent />
        </Suspense>
      </div>
    </div>
  );
}
