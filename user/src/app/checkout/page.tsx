'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/utils';

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session) {
      router.push('/auth/login');
      return;
    }

    setLoading(true);
    setError('');

    Promise.all([
      fetch('/api/cart').then(async (r) => {
        const payload = await r.json();
        if (!r.ok) throw new Error(payload.error || 'Failed to load cart');
        return payload;
      }),
      fetch('/api/users/profile').then(async (r) => {
        const payload = await r.json();
        if (!r.ok) throw new Error(payload.error || 'Failed to load profile');
        return payload;
      }),
    ])
      .then(([cartData, profileData]) => {
        setCart(cartData.data);
        setAddresses(profileData.data || []);
        const defaultAddr = (profileData.profile?.addresses || profileData.data || []).find((address: any) => address.isDefault);
        if (defaultAddr) {
          setSelectedAddress(defaultAddr.id);
        }
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [session, router]);

  const summary = useMemo(() => {
    if (!cart?.items?.length) {
      return {
        subtotal: 0,
        depositTotal: 0,
        deliveryFee: 0,
        tax: 0,
        total: 0,
      };
    }

    const subtotal = cart.items.reduce((sum: number, item: any) => sum + item.totalPrice, 0);
    const depositTotal = cart.items.reduce((sum: number, item: any) => sum + item.product.securityDeposit * item.quantity, 0);
    const deliveryFee = deliveryMethod === 'delivery' ? 99 : 0;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + depositTotal + deliveryFee + tax;

    return { subtotal, depositTotal, deliveryFee, tax, total };
  }, [cart, deliveryMethod]);

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-dark-400 mb-4">Please sign in to continue checkout</p>
        <Link href="/auth/login" className="px-6 py-2 bg-brand-600 text-white rounded-xl font-medium">
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="h-8 bg-dark-800 rounded w-48 mb-6 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-dark-800 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-dark-800 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Checkout unavailable</h2>
        <p className="text-dark-400 mb-6">{error}</p>
        <button onClick={() => router.refresh()} className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-medium">
          Retry
        </button>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-dark-400 mb-4">Your cart is empty</p>
        <Link href="/products" className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-medium">
          Browse Products
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (deliveryMethod === 'delivery' && !selectedAddress) {
      toast.error('Select a delivery address');
      return;
    }

    setProcessing(true);
    try {
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.items.map((item: any) => ({
            productId: item.product.id,
            quantity: item.quantity,
            rentalStart: item.rentalStart,
            rentalEnd: item.rentalEnd,
          })),
          deliveryMethod,
          deliveryAddressId: deliveryMethod === 'delivery' ? selectedAddress : null,
          paymentMethod,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Failed to place order');
      }

      await fetch('/api/cart', { method: 'DELETE' });
      window.dispatchEvent(new Event('cart-updated'));

      toast.success('Booking confirmed');
      router.push(`/orders/${orderData.data.order.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-dark-800/40 border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Delivery Method</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  value: 'delivery' as const,
                  label: 'Home Delivery',
                  desc: '+₹99 delivery fee',
                  icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
                },
                {
                  value: 'pickup' as const,
                  label: 'Store Pickup',
                  desc: 'Free pickup',
                  icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
                },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDeliveryMethod(opt.value)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    deliveryMethod === opt.value
                      ? 'border-brand-500 bg-brand-500/10'
                      : 'border-white/10 bg-dark-800 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={opt.icon} />
                    </svg>
                    <div>
                      <p className="text-white text-sm font-medium">{opt.label}</p>
                      <p className="text-dark-400 text-xs">{opt.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {deliveryMethod === 'delivery' && (
            <div className="bg-dark-800/40 border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Delivery Address</h2>
              {addresses.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedAddress === addr.id
                          ? 'border-brand-500 bg-brand-500/10'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddress === addr.id}
                        onChange={() => setSelectedAddress(addr.id)}
                        className="accent-brand-500"
                      />
                      <div className="text-sm">
                        <span className="text-white font-medium">{addr.label}</span>
                        <span className="text-dark-400 ml-2">
                          {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-dark-400">Add addresses from your profile page.</p>
              )}
              <Link href="/profile" className="text-xs text-brand-400 hover:text-brand-300">
                Manage addresses
              </Link>
            </div>
          )}

          <div className="bg-dark-800/40 border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Payment Method</h2>
            <div className="space-y-2">
              {[
                { value: 'card', label: 'Credit/Debit Card' },
                { value: 'upi', label: 'UPI' },
                { value: 'netbanking', label: 'Net Banking' },
                { value: 'wallet', label: 'Wallet' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === opt.value
                      ? 'border-brand-500 bg-brand-500/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={opt.value}
                    checked={paymentMethod === opt.value}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-brand-500"
                  />
                  <span className="text-sm text-white">{opt.label}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-dark-400 mt-3">
              Payments are processed through the current mock gateway abstraction and can be swapped for a real provider later.
            </p>
          </div>
        </div>

        <div className="bg-dark-800/40 border border-white/5 rounded-2xl p-6 h-fit sticky top-24">
          <h2 className="text-lg font-semibold text-white mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4">
            {cart.items.map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-dark-300 truncate mr-2">
                  {item.product.name} × {item.quantity}
                </span>
                <span className="text-white shrink-0">{formatCurrency(item.totalPrice)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-dark-400">Rental Subtotal</span>
              <span className="text-white">{formatCurrency(summary.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dark-400">Security Deposits</span>
              <span className="text-white">{formatCurrency(summary.depositTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dark-400">Delivery</span>
              <span className="text-white">{summary.deliveryFee > 0 ? formatCurrency(summary.deliveryFee) : 'Free'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dark-400">Tax (18% GST)</span>
              <span className="text-white">{formatCurrency(summary.tax)}</span>
            </div>
          </div>
          <div className="border-t border-white/5 pt-3 mt-3 flex justify-between">
            <span className="text-white font-semibold">Total Due</span>
            <span className="text-brand-400 font-bold text-xl">{formatCurrency(summary.total)}</span>
          </div>
          <button
            type="submit"
            disabled={processing || (deliveryMethod === 'delivery' && !selectedAddress)}
            className="w-full mt-4 py-3.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-600/20"
          >
            {processing ? 'Processing...' : 'Confirm Booking'}
          </button>
          <p className="text-xs text-dark-400 text-center mt-3">
            Security deposits are held during the rental and refunded after return, minus any applicable deductions.
          </p>
        </div>
      </form>
    </div>
  );
}

