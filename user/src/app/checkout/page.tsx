'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { 
  Truck, 
  Store, 
  CreditCard, 
  Banknote, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  RefreshCw, 
  AlertCircle, 
  ChevronRight,
  Plus,
  CheckCircle2
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMode, setPaymentMode] = useState<'cod' | 'online'>('online');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.replace(`/auth/login?callbackUrl=${encodeURIComponent('/checkout')}`);
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
  }, [status, router]);

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

  if (status === 'loading') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono tracking-widest text-zinc-600 uppercase font-bold">Restoring Session</span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 bg-zinc-50/50">
        <div className="bg-white border border-zinc-300 rounded-xl p-8 sm:p-10 text-center max-w-md w-full shadow-sm">
          <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center mx-auto mb-5 text-zinc-900 border border-zinc-200">
            <Lock className="w-5 h-5 stroke-[2.2]" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight mb-2">
            Authentication Required
          </h2>
          <p className="text-xs text-zinc-600 font-medium mb-8 leading-relaxed max-w-xs mx-auto">
            Please sign in to access delivery configuration, select address details, and authorize payment.
          </p>
          <Link 
            href="/auth/login?callbackUrl=/checkout" 
            className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 group"
          >
            <span>Sign In To Proceed</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="h-6 bg-zinc-200 rounded w-32 mb-8 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-zinc-100 rounded-xl animate-pulse border border-zinc-200" />
            ))}
          </div>
          <div className="lg:col-span-5 h-96 bg-zinc-100 rounded-xl animate-pulse border border-zinc-200" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-white border border-zinc-300 rounded-xl p-8 max-w-sm w-full text-center shadow-sm">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-3 stroke-[1.8]" />
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-1">Checkout Unavailable</h2>
          <p className="text-xs text-zinc-600 font-medium mb-6">{error}</p>
          <button 
            onClick={() => router.refresh()} 
            className="w-full py-2.5 bg-zinc-900 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Pipeline</span>
          </button>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4">
        <div className="bg-white border border-zinc-300 rounded-xl p-8 sm:p-12 text-center max-w-sm w-full shadow-sm">
          <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-zinc-700 border border-zinc-200">
            <Lock className="w-5 h-5 stroke-[2]" />
          </div>
          <h2 className="text-lg font-bold text-zinc-900 tracking-tight mb-1.5">
            Your Bag is Empty
          </h2>
          <p className="text-xs text-zinc-600 font-medium mb-6 leading-relaxed">
            You need gear added to your reservation before entering checkout.
          </p>
          <Link 
            href="/products" 
            className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 group"
          >
            <span>Explore Gear Catalog</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (deliveryMethod === 'delivery' && !selectedAddress) {
      toast.error('Select a delivery address');
      return;
    }

    const payload = {
      items: cart.items.map((item: any) => ({
        productId: item.product.id,
        quantity: item.quantity,
        rentalStart: item.rentalStart,
        rentalEnd: item.rentalEnd,
      })),
      deliveryMethod,
      deliveryAddressId: deliveryMethod === 'delivery' ? selectedAddress : null,
    };

    setProcessing(true);
    try {
      if (paymentMode === 'online') {
        const res = await fetch('/api/payments/cashfree/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, paymentMethod: 'cashfree', paymentMode: 'online' }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Could not start payment');

        const { load } = await import('@cashfreepayments/cashfree-js');
        const cashfree = await load({
          mode: process.env.NEXT_PUBLIC_CASHFREE_MODE === 'production' ? 'production' : 'sandbox',
        });

        await cashfree.checkout({
          paymentSessionId: data.data.paymentSessionId,
          redirectTarget: '_self',
        });
        return;
      }

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, paymentMethod: 'cod', paymentMode: 'cod' }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Failed to place order');
      }

      await fetch('/api/cart', { method: 'DELETE' });
      window.dispatchEvent(new Event('cart-updated'));

      toast.success('Booking confirmed — pay on delivery');
      router.push(`/orders/${orderData.data.order.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="w-full bg-white min-h-screen text-zinc-900 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

        {/* HEADER BAR */}
        <div className="flex items-baseline justify-between border-b border-zinc-300 pb-5 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-widest text-zinc-800 font-bold">Secure Checkout Protocol</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
              Finalize Order
            </h1>
          </div>

          <Link
            href="/cart"
            className="text-xs font-bold text-zinc-700 hover:text-zinc-900 tracking-tight hidden sm:flex items-center gap-1 transition-colors"
          >
            <span>Back to Bag</span>
            <ChevronRight className="w-4 h-4 text-zinc-900" />
          </Link>
        </div>

        {/* FORM & LEDGER GRID */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* LEFT COLUMN: CONFIGURATION STEPS (HIGH VISIBILITY) */}
          <div className="lg:col-span-7 space-y-9">
            
            {/* STEP 1: LOGISTICS METHOD */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 font-mono text-xs text-zinc-900 uppercase tracking-widest font-bold">
                <span className="px-2 py-0.5 bg-zinc-900 text-white rounded text-[10px]">01</span>
                <span className="text-zinc-400">/</span>
                <span>Logistics Method</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  {
                    value: 'delivery' as const,
                    label: 'Direct Delivery',
                    desc: '+₹99 Logistics Fee',
                    icon: Truck,
                  },
                  {
                    value: 'pickup' as const,
                    label: 'Store Pickup',
                    desc: 'Complimentary Pickup',
                    icon: Store,
                  },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = deliveryMethod === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setDeliveryMethod(opt.value)}
                      className={`p-4 rounded-xl text-left transition-all relative flex items-start gap-3.5 cursor-pointer ${
                        isSelected
                          ? 'border-2 border-zinc-900 bg-zinc-100/80 shadow-xs'
                          : 'border border-zinc-300 bg-white hover:border-zinc-400 hover:bg-zinc-50'
                      }`}
                    >
                      <div className={`p-2.5 rounded-lg shrink-0 ${isSelected ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700 border border-zinc-200'}`}>
                        <Icon className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div>
                        <span className={`text-xs font-bold block ${isSelected ? 'text-zinc-900' : 'text-zinc-800'}`}>
                          {opt.label}
                        </span>
                        <span className="font-mono text-[11px] text-zinc-600 block mt-0.5 font-semibold">
                          {opt.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: DESTINATION ADDRESS */}
            {deliveryMethod === 'delivery' && (
              <div className="space-y-3.5 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-xs text-zinc-900 uppercase tracking-widest font-bold">
                    <span className="px-2 py-0.5 bg-zinc-900 text-white rounded text-[10px]">02</span>
                    <span className="text-zinc-400">/</span>
                    <span>Destination Address</span>
                  </div>
                  <Link href="/profile" className="font-mono text-[11px] text-zinc-900 hover:underline flex items-center gap-1 font-bold">
                    <Plus className="w-3.5 h-3.5 text-zinc-900" />
                    <span>Manage Addresses</span>
                  </Link>
                </div>

                {addresses.length > 0 ? (
                  <div className="space-y-3">
                    {addresses.map((addr, idx) => {
                      const isSelected = selectedAddress === addr.id;
                      return (
                        <label
                          key={addr.id || idx}
                          className={`flex items-start gap-3.5 p-4 rounded-xl cursor-pointer transition-all ${
                            isSelected
                              ? 'border-2 border-zinc-900 bg-zinc-100/80 shadow-xs'
                              : 'border border-zinc-300 bg-white hover:border-zinc-400 hover:bg-zinc-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="address"
                            checked={isSelected}
                            onChange={() => setSelectedAddress(addr.id)}
                            className="mt-1 accent-zinc-900 w-4 h-4 cursor-pointer"
                          />
                          <div className="text-xs min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-bold text-sm ${isSelected ? 'text-zinc-900' : 'text-zinc-800'}`}>{addr.label}</span>
                              {addr.isDefault && (
                                <span className="font-mono text-[9px] uppercase px-2 py-0.5 bg-zinc-900 text-white rounded font-bold">Default</span>
                              )}
                            </div>
                            <p className="text-zinc-700 leading-relaxed font-medium">
                              {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-5 bg-amber-50 border border-amber-300 rounded-xl text-center">
                    <MapPin className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                    <p className="text-xs text-amber-900 font-bold mb-1">No delivery address on this account.</p>
                    <p className="text-[11px] text-amber-800 font-medium mb-3 leading-relaxed">
                      Checkout is blocked until you add one — or switch to Store Pickup above.
                    </p>
                    <Link href="/profile" className="font-mono text-xs text-amber-900 underline font-bold">
                      Add New Address
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: PAYMENT SETTLEMENT */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center gap-2 font-mono text-xs text-zinc-900 uppercase tracking-widest font-bold">
                <span className="px-2 py-0.5 bg-zinc-900 text-white rounded text-[10px]">03</span>
                <span className="text-zinc-400">/</span>
                <span>Payment Settlement</span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    value: 'online' as const,
                    label: 'Instant Online Settlement',
                    desc: 'UPI, Credit/Debit Cards, NetBanking via Cashfree',
                    icon: CreditCard,
                  },
                  {
                    value: 'cod' as const,
                    label: 'Pay on Delivery',
                    desc: 'Settle remaining total upon courier handoff',
                    icon: Banknote,
                  },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = paymentMode === opt.value;
                  return (
                    <label
                      key={opt.value}
                      className={`flex items-start gap-3.5 p-4 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'border-2 border-zinc-900 bg-zinc-100/80 shadow-xs'
                          : 'border border-zinc-300 bg-white hover:border-zinc-400 hover:bg-zinc-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={opt.value}
                        checked={isSelected}
                        onChange={() => setPaymentMode(opt.value)}
                        className="mt-1 accent-zinc-900 w-4 h-4 cursor-pointer"
                      />
                      <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700 border border-zinc-200'}`}>
                        <Icon className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div className="text-xs">
                        <span className={`font-bold block text-sm ${isSelected ? 'text-zinc-900' : 'text-zinc-800'}`}>{opt.label}</span>
                        <span className="text-zinc-600 text-xs mt-0.5 block font-medium">{opt.desc}</span>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="font-mono text-xs text-zinc-800 bg-zinc-100 border border-zinc-300 p-3.5 rounded-lg leading-relaxed font-semibold">
                {paymentMode === 'online'
                  ? '🔒 Encrypted 256-bit Cashfree Gateway. Reservation locks immediately upon success.'
                  : '🤝 Cash / UPI collected directly at your doorstep during delivery check-in.'}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: FINANCIAL LEDGER */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 bg-zinc-900 text-white rounded-2xl p-6 shadow-xl border border-zinc-800 space-y-6">
              
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <span className="font-mono text-xs uppercase tracking-widest text-zinc-300 font-bold">Order Summary</span>
                <span className="font-mono text-xs text-zinc-400 font-medium">
                  {cart.items.length} Line Item{cart.items.length > 1 ? 's' : ''}
                </span>
              </div>

              {/* Reserved Item Mini-List */}
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 divide-y divide-zinc-800/60">
                {cart.items.map((item: any) => (
                  <div key={item.id} className="pt-2 first:pt-0 flex justify-between text-xs items-start gap-3">
                    <div className="min-w-0">
                      <span className="text-zinc-200 font-medium block truncate">
                        {item.product.name}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-400">
                        Qty: {item.quantity} × {item.rentalDays}d
                      </span>
                    </div>
                    <span className="font-mono font-bold text-white tabular-nums shrink-0">
                      {formatCurrency(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Financial Calculation Ledger */}
              <div className="pt-4 border-t border-zinc-800 space-y-3 text-xs font-normal">
                <div className="flex justify-between items-center text-zinc-300">
                  <span>Rental Fee Subtotal</span>
                  <span className="font-mono text-white tabular-nums font-semibold">{formatCurrency(summary.subtotal)}</span>
                </div>

                <div className="flex justify-between items-center text-zinc-300">
                  <div className="flex items-center gap-1.5">
                    <span>Refundable Deposit</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="font-mono text-white tabular-nums font-semibold">{formatCurrency(summary.depositTotal)}</span>
                </div>

                <div className="flex justify-between items-center text-zinc-300">
                  <span>Logistics & Fulfillment</span>
                  <span className="font-mono text-white tabular-nums font-semibold">
                    {summary.deliveryFee > 0 ? formatCurrency(summary.deliveryFee) : 'Complimentary'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-zinc-300">
                  <span>GST (18% Statutory Tax)</span>
                  <span className="font-mono text-white tabular-nums font-semibold">{formatCurrency(summary.tax)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Total Payable</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400 tracking-tight tabular-nums">
                    {formatCurrency(summary.total)}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={processing || (deliveryMethod === 'delivery' && !selectedAddress)}
                className="w-full py-3.5 bg-white hover:bg-zinc-100 disabled:opacity-40 text-zinc-900 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 group active:scale-[0.99] cursor-pointer"
              >
                <span>
                  {processing
                    ? 'Authorizing Request...'
                    : paymentMode === 'online'
                      ? `Pay ${formatCurrency(summary.total)}`
                      : 'Confirm & Place Booking'}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Explains a disabled CTA — otherwise the button just looks broken. */}
              {deliveryMethod === 'delivery' && !selectedAddress && (
                <p className="pt-2 text-center text-[11px] font-semibold text-amber-400">
                  {addresses.length === 0
                    ? 'Add a delivery address, or choose Store Pickup, to continue.'
                    : 'Select a delivery address to continue.'}
                </p>
              )}

              <div className="pt-2 flex items-center justify-center gap-2 text-[10px] font-mono text-zinc-400">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Security holds automatically returned post-rental check-in.</span>
              </div>

            </div>
          </div>

        </form>

      </div>
    </div>
  );
}