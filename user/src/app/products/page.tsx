'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, SlidersHorizontal, X, Sparkles } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { ProductType } from '@/types';
import { getCategoryIcon } from '@/lib/category-icons';

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

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

  const [searchInput, setSearchInput] = useState(search);

  // Sync search input state with URL parameter
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Fetch Products from API
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

  // Fetch Categories
  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(({ data }) => setCategories(data || []))
      .catch(() => {});
  }, []);

  // REAL-TIME SEARCH FILTER: Filters currently fetched products instantly as user types
  const filteredProducts = useMemo(() => {
    if (!searchInput.trim()) return products;
    const query = searchInput.toLowerCase();

    return products.filter((product: any) => {
      const titleMatch = product.title?.toLowerCase().includes(query);
      const nameMatch = product.name?.toLowerCase().includes(query);
      const descMatch = product.description?.toLowerCase().includes(query);
      const categoryMatch = typeof product.category === 'string' 
        ? product.category.toLowerCase().includes(query)
        : product.category?.name?.toLowerCase().includes(query);

      return titleMatch || nameMatch || descMatch || categoryMatch;
    });
  }, [products, searchInput]);

  const buildUrl = (overrides: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    return `/products?${params.toString()}`;
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(buildUrl({ search: searchInput, page: '1' }));
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-8 overflow-hidden">
      
      {/* 1. LEFT SIDEBAR (FIXED PANEL, INDEPENDENTLY SCROLLABLE IF NEEDED) */}
      <aside className="lg:w-64 xl:w-72 shrink-0 h-full overflow-y-auto pr-1 custom-scrollbar">
        <div className="bg-[#F4F4F6] border border-neutral-200/80 rounded-[16px] p-5 space-y-6 shadow-2xs">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200/80">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-neutral-950" />
              <span className="text-xs font-black text-neutral-950 uppercase tracking-wider">
                Filters & Catalog
              </span>
            </div>
            {(category || search || sort || bestseller) && (
              <Link
                href="/products"
                className="text-[10px] font-bold text-red-600 hover:underline flex items-center gap-0.5"
              >
                <X className="w-3 h-3" />
                Reset
              </Link>
            )}
          </div>

          {/* Categories List */}
          <div>
            <h3 className="text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-3">
              Categories
            </h3>
            <div className="space-y-1">
              <Link
                href={buildUrl({ category: '', page: '1' })}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  !category
                    ? 'bg-neutral-950 text-white shadow-2xs'
                    : 'text-neutral-700 hover:bg-white/80 hover:text-neutral-950'
                }`}
              >
                <span>All Products</span>
              </Link>

              {categories.map((cat: any) => {
                const Icon = getCategoryIcon(cat);
                const isActive = category === cat.slug;
                return (
                  <Link
                    key={cat.id || cat.slug}
                    href={buildUrl({ category: cat.slug, page: '1' })}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-neutral-950 text-white shadow-2xs'
                        : 'text-neutral-700 hover:bg-white/80 hover:text-neutral-950'
                    }`}
                  >
                    <Icon size={14} className={isActive ? 'text-emerald-400' : 'text-neutral-500'} />
                    <span className="truncate">{cat.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Sort Options */}
          <div className="pt-2 border-t border-neutral-200/80">
            <h3 className="text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-3">
              Sort By
            </h3>
            <div className="space-y-1">
              {[
                { value: '', label: 'Newest Arrivals' },
                { value: 'price_low', label: 'Price: Low to High' },
                { value: 'price_high', label: 'Price: High to Low' },
                { value: 'rating', label: 'Top Rated' },
                { value: 'popular', label: 'Most Popular' },
              ].map((opt) => {
                const isActive = sort === opt.value;
                return (
                  <Link
                    key={opt.value}
                    href={buildUrl({ sort: opt.value, page: '1' })}
                    className={`w-full block px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-neutral-950 text-white shadow-2xs'
                        : 'text-neutral-700 hover:bg-white/80 hover:text-neutral-950'
                    }`}
                  >
                    {opt.label}
                  </Link>
                );
              })}
            </div>
          </div>

        </div>
      </aside>

      {/* 2. RIGHT MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        
        {/* FIXED TOP TOOLBAR: Search & Active Filter Bar */}
        <div className="bg-[#F4F4F6] border border-neutral-200/80 rounded-[16px] p-4 sm:p-5 mb-4 shrink-0 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Title & Count */}
            <div>
              <h2 className="text-lg sm:text-lg font-black text-neutral-950 tracking-tight uppercase">
                {search
                  ? `Search: "${search}"`
                  : bestseller
                  ? 'Bestseller Equipment'
                  : category
                  ? categories.find((c) => c.slug === category)?.name || 'Category Equipment'
                  : 'All Rental Products'}
              </h2>
              <p className="text-xs text-neutral-500 font-medium mt-0.5">
                Showing <strong className="text-neutral-950">{filteredProducts.length}</strong> of{' '}
                <strong className="text-neutral-950">{pagination.total}</strong> products
              </p>
            </div>

            {/* Live Search Form */}
            <form onSubmit={handleSearchSubmit} className="relative h-full w-full md:w-[75%]">
              <input
                type="text"
                placeholder="Search cameras, drones, tents..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="outline-none rounded-lg w-full  h-45 bg-white border border-neutral-200/80  pl-9 pr-8 py-3 text-xs font-medium text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-950 transition-all shadow-2xs"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    router.push(buildUrl({ search: '', page: '1' }));
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-950"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

          </div>

          {/* Active Filter Chips */}
          {(category || search || sort) && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-neutral-200/80 text-xs">
              <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider">
                Active Filters:
              </span>
              {category && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-neutral-900 border border-neutral-200 font-bold text-[11px] shadow-2xs">
                  Category: {categories.find((c) => c.slug === category)?.name || category}
                  <Link href={buildUrl({ category: '' })}>
                    <X className="w-3 h-3 text-neutral-400 hover:text-neutral-950" />
                  </Link>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-neutral-900 border border-neutral-200 font-bold text-[11px] shadow-2xs">
                  Query: {search}
                  <Link href={buildUrl({ search: '' })}>
                    <X className="w-3 h-3 text-neutral-400 hover:text-neutral-950" />
                  </Link>
                </span>
              )}
              {sort && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-neutral-900 border border-neutral-200 font-bold text-[11px] shadow-2xs">
                  Sort: {sort}
                  <Link href={buildUrl({ sort: '' })}>
                    <X className="w-3 h-3 text-neutral-400 hover:text-neutral-950" />
                  </Link>
                </span>
              )}
            </div>
          )}
        </div>

        {/* 3. SCROLLABLE PRODUCT SECTION */}
        <div className="flex-1 overflow-y-auto pr-2 pb-10 custom-scrollbar">
          {error ? (
            <div className="text-center py-20 bg-[#F4F4F6] border border-red-200 rounded-[20px]">
              <p className="text-red-600 font-black text-lg mb-1">Failed to load catalog</p>
              <p className="text-neutral-500 text-xs">{error}</p>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-[#F4F4F6] rounded-[20px] h-[320px] w-full border border-neutral-200/80"
                />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-[#F4F4F6] rounded-[20px] border border-neutral-200/80 p-8">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-2xs">
                <Search className="w-6 h-6 text-neutral-400" />
              </div>
              <h3 className="text-base font-extrabold text-neutral-950">No rental items found</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                We couldn't find anything matching your search term or selected category.
              </p>
              <button
                onClick={() => {
                  setSearchInput('');
                  router.push('/products');
                }}
                className="inline-block mt-4 px-5 py-2.5 bg-neutral-950 text-white rounded-full text-xs font-bold"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product as any} index={i} />
              ))}
            </div>
          )}

          {/* PAGINATION */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 my-10">
              {[...Array(pagination.pages)].map((_, i) => (
                <Link
                  key={i}
                  href={buildUrl({ page: String(i + 1) })}
                  className={`w-9 h-9 flex items-center justify-center rounded-full text-xs font-black transition-all border ${
                    pagination.page === i + 1
                      ? 'bg-neutral-950 text-white border-neutral-950 shadow-md'
                      : 'bg-white border-neutral-200/80 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100'
                  }`}
                >
                  {i + 1}
                </Link>
              ))}
            </div>
          )}
        </div>

      </main>

    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="w-full bg-white min-h-screen overflow-hidden">
      <div className="w-[90%] mx-auto px-4 py-6 h-full ">
        <Suspense
          fallback={
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500" />
            </div>
          }
        >
          <ProductsContent />
        </Suspense>
      </div>
    </div>
  );
}