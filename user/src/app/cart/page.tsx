'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Lock,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'authenticated') {
      if (status === 'unauthenticated') setLoading(false);
      return;
    }
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
  }, [status]);

  // SMART QUANTITY UPDATE WITH STOCK LIMIT ERROR HANDLING
  const updateQuantity = async (itemId: string, currentQty: number, delta: number, availableStock?: number) => {
    const newQuantity = currentQty + delta;
    if (newQuantity < 1) return;

    if (availableStock !== undefined && availableStock > 0 && newQuantity > availableStock) {
      toast.error(`Insufficient stock! Only ${availableStock} unit${availableStock > 1 ? 's' : ''} available.`);
      return;
    }

    setUpdatingItemId(itemId);

    try {
      const res = await fetch(`/api/cart/${itemId}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ quantity: newQuantity }) 
      });

      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload.error || payload.message || 'Insufficient stock available');
      }

      setCart(payload.data);
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err: any) {
      toast.error(err.message || 'Failed to update quantity');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove item');
      const { data } = await res.json();
      setCart(data);
      window.dispatchEvent(new Event('cart-updated'));
      toast.success('Removed from shopping bag');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  // 1. SESSION LOADING STATE
  if (status === 'loading') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase font-bold">Restoring Session</span>
      </div>
    );
  }

  // 2. UNAUTHENTICATED STATE
  if (!session) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 bg-zinc-50/50">
        <div className="bg-white border border-zinc-200 rounded-2xl p-8 sm:p-12 text-center max-w-md w-full shadow-sm">
          <div className="w-12 h-12 bg-zinc-900 text-white rounded-xl flex items-center justify-center mx-auto mb-5 shadow-xs">
            <Lock className="w-5 h-5 stroke-[2]" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight uppercase mb-2">
            Sign In Required
          </h2>
          <p className="text-xs text-zinc-500 font-medium mb-8 leading-relaxed max-w-xs mx-auto">
            Please log in to your account to review saved rental equipment and proceed to checkout.
          </p>
          <Link 
            href="/auth/login?callbackUrl=/cart" 
            className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 group"
          >
            <span>Sign In To Continue</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-700 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  // 3. CART API LOADING SKELETON
  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-8 sm:py-12">
        <div className="h-7 bg-zinc-200 rounded w-48 mb-8 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-44 bg-white rounded-2xl animate-pulse border border-zinc-200 shadow-xs" />
            ))}
          </div>
          <div className="lg:col-span-5 h-80 bg-zinc-900 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  // 4. ERROR STATE
  if (error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="bg-white border border-zinc-200 rounded-2xl p-8 max-w-md w-full shadow-sm">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-3 stroke-[1.8]" />
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-1">Unable to Load Bag</h2>
          <p className="text-xs text-zinc-500 font-medium mb-6">{error}</p>
          <button 
            onClick={() => router.refresh()} 
            className="px-6 py-2.5 bg-zinc-900 text-white font-bold text-xs rounded-xl uppercase tracking-wider flex items-center gap-2 mx-auto hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  // 5. EMPTY BAG STATE
  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 bg-zinc-50/50">
        <div className="bg-white border border-zinc-200 rounded-2xl p-8 sm:p-12 text-center max-w-md w-full shadow-sm">
          <div className="w-12 h-12 bg-zinc-900 text-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-xs">
            <ShoppingBag className="w-5 h-5 stroke-[2]" />
          </div>
          <h2 className="text-lg font-bold text-zinc-900 tracking-tight uppercase mb-1.5">
            Your Bag is Empty
          </h2>
          <p className="text-xs text-zinc-500 font-medium mb-6 leading-relaxed">
            You haven't added any camera gear, workstation kits, or outdoor equipment yet.
          </p>
          <Link 
            href="/products" 
            className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 group"
          >
            <span>Explore Entire Catalog</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-700 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  // CALCULATION TOTALS
  const itemCount = cart.items.reduce((s: number, i: any) => s + i.quantity, 0);
  const subtotal = cart.items.reduce((s: number, i: any) => s + i.totalPrice, 0);
  const depositTotal = cart.items.reduce((s: number, i: any) => s + (i.product?.securityDeposit || 0) * i.quantity, 0);
  const grandTotal = subtotal + depositTotal;

  return (
    <div className="w-full bg-zinc-50/50 min-h-screen pb-20 text-zinc-900">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        
        {/* HEADER BAR */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-zinc-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-900 text-white font-mono text-[10px] uppercase tracking-widest font-bold mb-2 shadow-2xs">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Rental Order Preview</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-wide mt-2 font-mono uppercase">
              Shopping Bag <span className="text-zinc-700 font-mono text-xl">({itemCount})</span>
            </h1>
          </div>

          <Link
            href="/products"
            className="py-2.5 px-4 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-900 font-bold text-xs uppercase tracking-wider rounded-xl transition-all hidden sm:flex items-center gap-1.5 shadow-xs"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-900" />
          </Link>
        </div>

        {/* MAIN 2-COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: CART ITEM CARDS (PURE WHITE SMART CARDS) */}
          <div className="lg:col-span-7 space-y-4">
            <AnimatePresence>
              {cart.items.map((item: any, i: number) => {
                const stockLimit = item.product?.availableStock ?? item.product?.availableQuantity;
                const isUpdatingThis = updatingItemId === item.id;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-black/15 border border-zinc-200/90 text-zinc-900 rounded-xl p-5 shadow-xl hover:shadow-2xl transition-all flex flex-col sm:flex-row gap-5 relative group"
                  >
                    {/* Thumbnail Image Tray */}
                    <div className="relative w-full sm:w-32 h-32 rounded-xl bg-zinc-50 border border-zinc-200 overflow-hidden shrink-0 flex items-center justify-center p-2.5">
                      <Image 
                        src={item.product?.imageUrl || item.product?.images?.[0] || '/placeholder.jpg'} 
                        alt={item.product?.name || 'Rental Item'} 
                        fill 
                        className="object-contain p-2 transition-transform duration-300 group-hover:scale-105" 
                        sizes="(max-width: 640px) 100vw, 128px" 
                      />
                    </div>

                    {/* Content Details */}
                    <div className="flex flex-col justify-between flex-1 min-w-0">
                      <div>
                        {/* Title & Delete button */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="min-w-0">
                            <h3 className="text-sm sm:text-base font-bold text-zinc-900 tracking-tight truncate leading-snug">
                              {item.product?.name}
                            </h3>
                            <span className="font-mono text-xs font-semibold text-zinc-500 block mt-0.5">
                              Daily Rate: {formatCurrency(item.product?.dailyPrice)}/day
                            </span>
                          </div>

                          <button 
                            onClick={() => removeItem(item.id)} 
                            className="p-1.5 text-zinc-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Booking Dates Pill */}
                        <div className="inline-flex items-center gap-2 bg-zinc-50 border border-zinc-400 px-3 py-1.5 rounded-lg font-mono text-xs text-zinc-700 mb-3">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          <span>
                            {new Date(item.rentalStart).toLocaleDateString()} – {new Date(item.rentalEnd).toLocaleDateString()}
                          </span>
                          <span className="text-zinc-300">|</span>
                          <span className="text-zinc-500 text-[11px] font-semibold">
                            {item.rentalDays} Day{item.rentalDays > 1 ? 's' : ''}
                          </span>
                        </div>

                        {/* Security Deposit Badge */}
                        <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg w-fit">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Refundable Hold: {formatCurrency((item.product?.securityDeposit || 0) * item.quantity)}</span>
                        </div>
                      </div>

                      {/* Bottom Adjuster & Subtotal */}
                      <div className="flex items-center justify-between pt-4 mt-3 border-t border-zinc-100">
                        
                        {/* Quantity Counter */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-zinc-100 border border-zinc-200 rounded-xl p-1">
                            <button 
                              disabled={isUpdatingThis || item.quantity <= 1}
                              onClick={() => updateQuantity(item.id, item.quantity, -1, stockLimit)} 
                              className="w-6 h-6 bg-zinc-900 text-white rounded-lg flex items-center justify-center hover:bg-zinc-800 disabled:opacity-30 transition-colors cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            
                            <span className="w-8 text-center font-mono text-xs font-bold text-zinc-900 tabular-nums">
                              {isUpdatingThis ? '...' : item.quantity}
                            </span>

                            <button 
                              disabled={isUpdatingThis}
                              onClick={() => updateQuantity(item.id, item.quantity, 1, stockLimit)} 
                              className="w-6 h-6 bg-zinc-900 text-white rounded-lg flex items-center justify-center hover:bg-zinc-800 disabled:opacity-30 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {stockLimit !== undefined && (
                            <span className="font-mono text-[10px] text-zinc-700 font-medium">
                              (Stock: {stockLimit})
                            </span>
                          )}
                        </div>

                        {/* Price Calculation Total */}
                        <div className="text-right">
                          <span className="font-mono text-[9px] text-zinc-700 uppercase tracking-wider font-semibold block">
                            Item Subtotal
                          </span>
                          <span className="font-mono text-base font-extrabold text-zinc-900 tracking-tight tabular-nums">
                            {formatCurrency(item.totalPrice)}
                          </span>
                        </div>

                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* RIGHT COLUMN: FINANCIAL SUMMARY LEDGER (Sleek Dark Container) */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 bg-zinc-900 text-white rounded-2xl p-6 shadow-xl border border-zinc-800 space-y-6">
              
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <span className="font-mono text-xs uppercase tracking-widest text-zinc-300 font-bold">Order Ledger</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded font-bold">Verified Rates</span>
              </div>

              <div className="space-y-3.5 text-xs font-normal">
                <div className="flex justify-between items-center text-zinc-300">
                  <span>Equipment Booking Fee</span>
                  <span className="font-mono text-white tabular-nums font-semibold">{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex justify-between items-center text-zinc-300">
                  <div className="flex items-center gap-1.5">
                    <span>Refundable Deposit Hold</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="font-mono text-white tabular-nums font-semibold">{formatCurrency(depositTotal)}</span>
                </div>

                <p className="text-[10px] font-mono text-zinc-700 leading-relaxed pt-1">
                  * Security holds are automatically released upon equipment check-in and inspection.
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-800 space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Total Payable Now</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400 tracking-tight tabular-nums">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <Link 
                href="/checkout" 
                className="w-full py-3.5 bg-white hover:bg-zinc-100 text-zinc-900 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 group active:scale-[0.99]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Trust Footer */}
              <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-zinc-700 border-t border-zinc-800/60">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-zinc-700" /> 24h Reservation Lock
                </span>
                <span>Encrypted Dispatch</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}