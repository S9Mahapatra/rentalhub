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

  useEffect(() => {
    if (!session) return;
    fetch('/api/cart').then((r) => r.json()).then(({ data }) => setCart(data)).catch(() => {}).finally(() => setLoading(false));
  }, [session]);

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quantity }) });
      if (!res.ok) throw new Error('Failed to update quantity');
      const { data } = await res.json();
      setCart(data);
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
      toast.success('Removed from cart');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-dark-400 mb-4">Please sign in to view your cart</p>
        <Link href="/auth/login" className="px-6 py-2 bg-brand-600 text-white rounded-xl font-medium">Sign In</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="h-8 bg-dark-800 rounded w-48 mb-6 animate-pulse" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-dark-800 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <svg className="w-20 h-20 mx-auto text-dark-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        <h2 className="text-xl font-bold text-white mb-2">Your cart is empty</h2>
        <p className="text-dark-400 mb-6">Browse products and add them to your cart</p>
        <Link href="/products" className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-medium">Browse Products</Link>
      </div>
    );
  }

  const itemCount = cart.items.reduce((s: number, i: any) => s + i.quantity, 0);
  const subtotal = cart.items.reduce((s: number, i: any) => s + i.totalPrice, 0);
  const depositTotal = cart.items.reduce((s: number, i: any) => s + i.product.securityDeposit * i.quantity, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Shopping Cart ({itemCount} items)</h1>

      <div className="space-y-3">
        {cart.items.map((item: any, i: number) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex gap-4 bg-dark-800/40 border border-white/5 rounded-2xl p-4"
          >
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-dark-700 shrink-0">
              <Image src={item.product.imageUrl || item.product.images?.[0] || '/placeholder.jpg'} alt={item.product.name} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium text-sm truncate">{item.product.name}</h3>
              <p className="text-dark-400 text-xs mt-1">
                {new Date(item.rentalStart).toLocaleDateString()} - {new Date(item.rentalEnd).toLocaleDateString()} ({item.rentalDays} days)
              </p>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="w-7 h-7 bg-dark-700 rounded-lg text-white text-sm flex items-center justify-center hover:bg-dark-600 transition-colors">-</button>
                  <span className="text-white text-sm w-6 text-center font-medium">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 bg-dark-700 rounded-lg text-white text-sm flex items-center justify-center hover:bg-dark-600 transition-colors">+</button>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-white font-semibold">{formatCurrency(item.totalPrice)}</span>
                  <button onClick={() => removeItem(item.id)} className="text-dark-400 hover:text-red-400 transition-colors p-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 bg-dark-800/40 border border-white/5 rounded-2xl p-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-dark-400">Subtotal</span>
          <span className="text-white">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm mb-4">
          <span className="text-dark-400">Security Deposits (refundable)</span>
          <span className="text-white">{formatCurrency(depositTotal)}</span>
        </div>
        <div className="border-t border-white/5 pt-4 flex justify-between">
          <span className="text-white font-semibold">Total Due at Checkout</span>
          <span className="text-brand-400 font-bold text-xl">{formatCurrency(subtotal + depositTotal)}</span>
        </div>
        <Link href="/checkout" className="block w-full mt-4 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-center transition-all shadow-lg shadow-brand-600/20 hover:shadow-brand-500/30">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
