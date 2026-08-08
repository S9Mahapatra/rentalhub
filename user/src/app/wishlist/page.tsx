'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import { ProductType } from '@/types';

export default function WishlistPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    setError('');
    fetch('/api/wishlist')
      .then(async (r) => {
        const payload = await r.json();
        if (!r.ok) throw new Error(payload.error || 'Failed to load wishlist');
        return payload;
      })
      .then(({ data }) => setProducts(data || []))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [session]);

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-dark-400 mb-4">Please sign in to view your wishlist</p>
        <Link href="/auth/login" className="px-6 py-2 bg-brand-600 text-white rounded-xl font-medium">Sign In</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-8 bg-dark-800 rounded w-48 mb-6 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-dark-800 rounded-2xl h-80 animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Wishlist unavailable</h2>
        <p className="text-dark-400 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-medium">
          Retry
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <svg className="w-20 h-20 mx-auto text-dark-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <h2 className="text-xl font-bold text-white mb-2">Your wishlist is empty</h2>
        <p className="text-dark-400 mb-6">Save products you love for later</p>
        <Link href="/products" className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-medium">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">My Wishlist ({products.length})</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product as any}
            index={i}
            wishlistIds={products.map((entry) => entry.id)}
            onWishlistToggle={(productId) => setProducts((prev) => prev.filter((entry) => entry.id !== productId))}
          />
        ))}
      </div>
    </div>
  );
}
