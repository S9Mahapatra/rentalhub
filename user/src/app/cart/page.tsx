'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/utils';

export default function CartPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    setError('');
    fetch('/api/cart')
      .then(async (r) => {
        const payload = await r.json();
        if (!r.ok) throw new Error(payload.error || 'Failed to fetch cart');
        return payload;
      })
      .then(({ data }) => setCart(data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [session]);

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quantity }) });
      if (!res.ok) throw new Error('Failed to update quantity');
      const { data } = await res.json();
      setCart(data);
      window.dispatchEvent(new Event('cart-updated'));
    } catch {
      toast.error('Failed to update quantity');
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove item');
      const { data } = await res.json();
      setCart(data);
      window.dispatchEvent(new Event('cart-updated'));
      toast.success('Removed from cart');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  if (!session) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-neutral-950 mb-2 tracking-tight">Sign in required</h2>
        <p className="text-neutral-500 font-medium mb-8 text-center max-w-sm">Please sign in to your account to view and manage your shopping cart.</p>
        <Link href="/auth/login?callbackUrl=/cart" className="px-8 py-4 bg-neutral-950 hover:bg-neutral-800 text-white font-black text-sm rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]">
          SIGN IN TO CONTINUE
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        <div className="h-8 bg-neutral-200/60 rounded-xl w-64 mb-8 animate-pulse" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-neutral-100/60 rounded-[24px] animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-2xl font-black text-neutral-950 mb-2 tracking-tight">Cart unavailable</h2>
        <p className="text-neutral-500 font-medium mb-8">{error}</p>
        <button onClick={() => router.refresh()} className="px-8 py-4 bg-neutral-950 hover:bg-neutral-800 text-white font-black text-sm rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]">
          RETRY
        </button>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
        </div>
        <h2 className="text-3xl font-black text-neutral-950 mb-3 tracking-tight">Your bag is empty</h2>
        <p className="text-neutral-500 font-medium mb-8 max-w-sm">Browse our premium catalog and add the gear you need to your cart.</p>
        <Link href="/products" className="px-8 py-4 bg-neutral-950 hover:bg-neutral-800 text-white font-black text-sm rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]">
          BROWSE CATALOG
        </Link>
      </div>
    );
  }

  const itemCount = cart.items.reduce((s: number, i: any) => s + i.quantity, 0);
  const subtotal = cart.items.reduce((s: number, i: any) => s + i.totalPrice, 0);
  const depositTotal = cart.items.reduce((s: number, i: any) => s + i.product.securityDeposit * i.quantity, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <h1 className="text-3xl font-black text-neutral-950 mb-8 tracking-tight">Shopping Bag <span className="text-neutral-400 font-medium text-xl">({itemCount})</span></h1>

      <div className="space-y-4">
        {cart.items.map((item: any, i: number) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex flex-col sm:flex-row gap-6 bg-white border border-neutral-200/80 rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 shadow-sm hover:shadow-md transition-all"
          >
            <div className="relative w-full sm:w-32 h-40 sm:h-32 rounded-2xl overflow-hidden bg-[#F7F7F9] shrink-0 border border-neutral-100">
              <Image src={item.product.imageUrl || item.product.images?.[0] || '/placeholder.jpg'} alt={item.product.name} fill className="object-contain p-4" sizes="(max-width: 640px) 100vw, 128px" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-neutral-950 font-black text-lg sm:text-xl truncate">{item.product.name}</h3>
                  <div className="inline-flex items-center gap-1.5 mt-1.5 bg-neutral-100 px-2.5 py-1 rounded-md">
                    <span className="text-neutral-500 font-medium text-[11px] uppercase tracking-widest">Period:</span>
                    <span className="text-neutral-900 font-bold text-xs">{new Date(item.rentalStart).toLocaleDateString()} - {new Date(item.rentalEnd).toLocaleDateString()}</span>
                  </div>
                  <p className="text-neutral-400 font-semibold text-xs mt-2">{item.rentalDays} Days Rental</p>
                </div>
                <button onClick={() => removeItem(item.id)} className="text-neutral-300 hover:text-red-500 transition-colors p-2 bg-neutral-50 hover:bg-red-50 rounded-full shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>

              <div className="flex items-end justify-between mt-auto pt-4">
                <div className="flex items-center gap-1 bg-neutral-100 rounded-full p-1 border border-neutral-200/60">
                  <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="w-8 h-8 bg-white rounded-full text-neutral-600 shadow-sm flex items-center justify-center hover:text-neutral-950 transition-colors font-bold">-</button>
                  <span className="text-neutral-950 text-sm w-6 text-center font-black">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 bg-white rounded-full text-neutral-600 shadow-sm flex items-center justify-center hover:text-neutral-950 transition-colors font-bold">+</button>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest mb-1">Item Total</p>
                  <span className="text-neutral-950 font-black text-xl">{formatCurrency(item.totalPrice)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 bg-[#F7F7F9] border border-neutral-200/80 rounded-[32px] p-6 sm:p-8">
        <div className="flex justify-between text-sm mb-3">
          <span className="text-neutral-500 font-semibold">Subtotal</span>
          <span className="text-neutral-950 font-black">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm mb-6">
          <span className="text-neutral-500 font-semibold">Security Deposits (Refundable)</span>
          <span className="text-neutral-950 font-black">{formatCurrency(depositTotal)}</span>
        </div>
        <div className="border-t border-neutral-200/80 pt-6 flex justify-between items-center">
          <span className="text-neutral-950 font-black text-lg">Total Due</span>
          <span className="text-emerald-600 font-black text-3xl">{formatCurrency(subtotal + depositTotal)}</span>
        </div>
        <Link href="/checkout" className="block w-full mt-8 py-5 bg-neutral-950 hover:bg-neutral-800 text-white font-black text-sm rounded-full text-center transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]">
          PROCEED TO CHECKOUT
        </Link>
      </div>
    </div>
  );
}
