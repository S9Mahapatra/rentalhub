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
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <h2 className="text-2xl font-black text-neutral-950 mb-2 tracking-tight">Sign in required</h2>
        <p className="text-neutral-500 font-medium mb-8 text-center max-w-sm">Please sign in to continue checkout.</p>
        <Link href="/auth/login" className="px-8 py-4 bg-neutral-950 hover:bg-neutral-800 text-white font-black text-sm rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]">
          SIGN IN TO CONTINUE
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 md:py-20">
        <div className="h-8 bg-neutral-200/60 rounded-xl w-48 mb-8 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-neutral-100/60 rounded-[24px] animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-neutral-100/60 rounded-[32px] animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-2xl font-black text-neutral-950 mb-2 tracking-tight">Checkout unavailable</h2>
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
        <h2 className="text-3xl font-black text-neutral-950 mb-3 tracking-tight">Your bag is empty</h2>
        <p className="text-neutral-500 font-medium mb-8 max-w-sm">You need items in your cart to checkout.</p>
        <Link href="/products" className="px-8 py-4 bg-neutral-950 hover:bg-neutral-800 text-white font-black text-sm rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]">
          BROWSE CATALOG
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
    <div className="max-w-5xl mx-auto px-4 py-12 md:py-20">
      <h1 className="text-3xl font-black text-neutral-950 mb-8 tracking-tight">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-neutral-200/80 rounded-[32px] p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-black text-neutral-950 mb-6">Delivery Method</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  className={`p-5 rounded-[24px] border-2 text-left transition-all ${
                    deliveryMethod === opt.value
                      ? 'border-neutral-950 bg-neutral-50 shadow-sm'
                      : 'border-neutral-100 bg-white hover:border-neutral-200 hover:bg-neutral-50/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${deliveryMethod === opt.value ? 'bg-neutral-950 text-white' : 'bg-neutral-100 text-neutral-400'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={opt.icon} />
                      </svg>
                    </div>
                    <div>
                      <p className={`text-sm font-black ${deliveryMethod === opt.value ? 'text-neutral-950' : 'text-neutral-700'}`}>{opt.label}</p>
                      <p className="text-neutral-500 text-xs mt-0.5 font-medium">{opt.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {deliveryMethod === 'delivery' && (
            <div className="bg-white border border-neutral-200/80 rounded-[32px] p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-black text-neutral-950 mb-6">Delivery Address</h2>
              {addresses.length > 0 ? (
                <div className="space-y-3 mb-5">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex items-start gap-4 p-5 rounded-[24px] border-2 cursor-pointer transition-all ${
                        selectedAddress === addr.id
                          ? 'border-neutral-950 bg-neutral-50 shadow-sm'
                          : 'border-neutral-100 bg-white hover:border-neutral-200 hover:bg-neutral-50/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddress === addr.id}
                        onChange={() => setSelectedAddress(addr.id)}
                        className="mt-1 accent-neutral-950 w-4 h-4"
                      />
                      <div className="text-sm">
                        <span className={`font-black block mb-1 ${selectedAddress === addr.id ? 'text-neutral-950' : 'text-neutral-700'}`}>{addr.label}</span>
                        <span className="text-neutral-500 font-medium leading-relaxed">
                          {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-500 mb-4 font-medium">Add addresses from your profile page.</p>
              )}
              <Link href="/profile" className="text-xs font-black tracking-widest uppercase text-neutral-950 hover:text-neutral-700 underline decoration-2 underline-offset-4 decoration-emerald-400">
                Manage addresses
              </Link>
            </div>
          )}

          <div className="bg-white border border-neutral-200/80 rounded-[32px] p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-black text-neutral-950 mb-6">Payment Method</h2>
            <div className="space-y-3">
              {[
                { value: 'card', label: 'Credit/Debit Card' },
                { value: 'upi', label: 'UPI' },
                { value: 'netbanking', label: 'Net Banking' },
                { value: 'wallet', label: 'Wallet' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-4 p-5 rounded-[24px] border-2 cursor-pointer transition-all ${
                    paymentMethod === opt.value
                      ? 'border-neutral-950 bg-neutral-50 shadow-sm'
                      : 'border-neutral-100 bg-white hover:border-neutral-200 hover:bg-neutral-50/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={opt.value}
                    checked={paymentMethod === opt.value}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-neutral-950 w-4 h-4"
                  />
                  <span className={`text-sm font-black ${paymentMethod === opt.value ? 'text-neutral-950' : 'text-neutral-700'}`}>{opt.label}</span>
                </label>
              ))}
            </div>
            <p className="text-[11px] font-medium text-neutral-400 mt-6 bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
              Payments are processed through the current mock gateway abstraction and can be swapped for a real provider later.
            </p>
          </div>
        </div>

        <div className="bg-[#F7F7F9] border border-neutral-200/80 rounded-[32px] p-6 sm:p-8 h-fit sticky top-24 shadow-sm">
          <h2 className="text-lg font-black text-neutral-950 mb-6">Order Summary</h2>
          <div className="space-y-4 mb-6">
            {cart.items.map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm items-start gap-4">
                <span className="text-neutral-700 font-semibold line-clamp-2">
                  {item.product.name} <span className="text-neutral-400">× {item.quantity}</span>
                </span>
                <span className="text-neutral-950 font-black shrink-0">{formatCurrency(item.totalPrice)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-neutral-200/80 pt-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500 font-semibold">Rental Subtotal</span>
              <span className="text-neutral-950 font-black">{formatCurrency(summary.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500 font-semibold">Security Deposits</span>
              <span className="text-neutral-950 font-black">{formatCurrency(summary.depositTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500 font-semibold">Delivery</span>
              <span className="text-neutral-950 font-black">{summary.deliveryFee > 0 ? formatCurrency(summary.deliveryFee) : 'Free'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500 font-semibold">Tax (18% GST)</span>
              <span className="text-neutral-950 font-black">{formatCurrency(summary.tax)}</span>
            </div>
          </div>
          <div className="border-t border-neutral-200/80 pt-6 mt-6 flex justify-between items-center">
            <span className="text-neutral-950 font-black text-lg">Total Due</span>
            <span className="text-emerald-600 font-black text-3xl">{formatCurrency(summary.total)}</span>
          </div>
          <button
            type="submit"
            disabled={processing || (deliveryMethod === 'delivery' && !selectedAddress)}
            className="w-full mt-8 py-5 bg-neutral-950 hover:bg-neutral-800 disabled:opacity-50 text-white font-black text-sm rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            {processing ? 'PROCESSING...' : 'CONFIRM BOOKING'}
          </button>
          <p className="text-[11px] font-medium text-neutral-400 text-center mt-6">
            Security deposits are held during the rental and refunded after return, minus any applicable deductions.
          </p>
        </div>
      </form>
    </div>
  );
}

