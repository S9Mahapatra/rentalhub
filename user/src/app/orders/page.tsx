'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { 
  Receipt, 
  Calendar, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  RefreshCw, 
  AlertCircle, 
  ChevronRight,
  PackageCheck,
  Sparkles,
  Trash2
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated') {
      if (status === 'unauthenticated') setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    fetch('/api/orders?limit=100')
      .then(async (r) => {
        const payload = await r.json();
        if (!r.ok) throw new Error(payload.error || 'Failed to load orders');
        return payload;
      })
      .then(({ data }) => setOrders(data || []))
      .catch((err: Error) => {
        setError(err.message);
        toast.error(err.message);
      })
      .finally(() => setLoading(false));
  }, [status]);

  const handleDelete = async () => {
    if (!pendingDelete || deleting) return;
    const orderId = pendingDelete.id;

    setDeleting(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || 'Failed to delete order');

      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      setPendingDelete(null);
      toast.success('Order and all linked records deleted');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  // 1. SESSION LOADING STATE
  if (status === 'loading') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase font-bold">Retrieving Invoices</span>
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
            Authentication Required
          </h2>
          <p className="text-xs text-zinc-500 font-medium mb-8 leading-relaxed max-w-xs mx-auto">
            Please sign in to access your complete rental transaction history and download official tax invoices.
          </p>
          <Link 
            href="/auth/login?callbackUrl=/orders" 
            className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 group"
          >
            <span>Sign In To Access</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  // 3. DATA LOADING SKELETON
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="h-7 bg-zinc-200 rounded w-48 mb-8 animate-pulse" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-zinc-200 shadow-xs" />
          ))}
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
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-1">Invoices Unavailable</h2>
          <p className="text-xs text-zinc-500 font-medium mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2.5 bg-zinc-900 text-white font-bold text-xs rounded-xl uppercase tracking-wider flex items-center gap-2 mx-auto hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Fetch</span>
          </button>
        </div>
      </div>
    );
  }

  // 5. EMPTY INVOICES STATE
  if (orders.length === 0) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 bg-zinc-50/50">
        <div className="bg-white border border-zinc-200 rounded-2xl p-8 sm:p-12 text-center max-w-md w-full shadow-sm">
          <div className="w-12 h-12 bg-zinc-900 text-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-xs">
            <Receipt className="w-5 h-5 stroke-[2]" />
          </div>
          <h2 className="text-lg font-bold text-zinc-900 tracking-tight uppercase mb-1.5">
            No Invoices Found
          </h2>
          <p className="text-xs text-zinc-500 font-medium mb-6 leading-relaxed">
            Confirmed bookings and rental receipts will automatically generate and appear in this ledger.
          </p>
          <Link 
            href="/products" 
            className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 group"
          >
            <span>Explore Gear Catalog</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  // 6. MAIN INVOICES LEDGER VIEW (PURE WHITE SMART CARDS)
  return (
    <div className="w-full bg-zinc-50/50 min-h-screen pb-24 text-zinc-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        
        {/* HEADER BAR */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-zinc-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-900 text-white font-mono text-[10px] uppercase tracking-widest font-bold mb-2 shadow-2xs">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Transaction Ledger</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 font-mono">
              Invoices & Orders
            </h1>
          </div>

          <Link
            href="/products"
            className="py-2.5 px-4 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-900 font-bold text-xs uppercase tracking-wider rounded-xl transition-all hidden sm:flex items-center gap-1.5 shadow-xs"
          >
            <span>Book Gear</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-900" />
          </Link>
        </div>

        {/* INVOICE LIST (PURE WHITE SMART CARDS) */}
        <div className="space-y-4">
          {orders.map((order) => {
            const isPaid = order.paymentStatus?.toLowerCase() === 'paid' || order.paymentStatus?.toLowerCase() === 'completed';
            const isCod = order.paymentMethod?.toLowerCase() === 'cod' || order.paymentMode?.toLowerCase() === 'cod';

            return (
              <div 
                key={order.id} 
                className="bg-neutral-100/50 border border-zinc-200/90 rounded-xl p-5 sm:p-6 shadow-2xl hover:shadow-3xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-5 group"
              >
                {/* Left Info Column */}
                <div className="space-y-3 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Order ID in Dark Box */}
                    <span className="font-mono text-xs font-bold text-white bg-zinc-900 px-3 py-1.5 rounded-md shadow-2xs ">
                      #{order.orderNumber || order.id.slice(-8).toUpperCase()}
                    </span>

                    {/* Payment Status Pill */}
                    <span className={`font-mono text-[10px] uppercase font-bold px-2.5 py-1 rounded-md border ${
                      isPaid 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : isCod 
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                    }`}>
                      {order.paymentStatus || (isCod ? 'Pay on Handoff' : 'Pending')}
                    </span>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-zinc-500 font-medium">
                    <span className="flex items-center gap-1.5 text-zinc-700 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5 text-zinc-700 font-mono">
                      <PackageCheck className="w-3.5 h-3.5 text-zinc-400" />
                      {order.items?.length || 0} Rental Item{order.items?.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Security Deposit Badge */}
                  <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3 py-1 rounded-lg text-xs font-medium font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Security Hold: <strong className="font-bold text-emerald-900">{formatCurrency(order.securityDepositTotal || 0)}</strong></span>
                  </div>
                </div>

                {/* Right Action Column (Clean Light Layout, No Heavy Black Box) */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-zinc-100 pt-4 sm:pt-0 gap-3 shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 font-mono block">Total Invoiced</span>
                    <span className="text-xl font-extrabold text-zinc-900 font-mono tracking-tight tabular-nums">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/orders/${order.id}`}
                      className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-md transition-all shadow-xs flex items-center gap-1.5 group/btn"
                    >
                      <span>View Tax Invoice</span>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover/btn:translate-x-0.5 group-hover/btn:text-white transition-all" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => setPendingDelete(order)}
                      aria-label={`Delete order ${order.orderNumber || order.id}`}
                      title="Delete order"
                      className="p-2.5 bg-white hover:bg-rose-50 border border-zinc-400 hover:border-rose-200 text-zinc-500 hover:text-rose-600 rounded-md transition-all shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[1.8]" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* DELETE CONFIRMATION */}
      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-zinc-900/40 backdrop-blur-sm"
          onClick={() => !deleting && setPendingDelete(null)}
        >
          <div
            className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="w-11 h-11 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5 stroke-[1.8]" />
            </div>
            <h2 className="text-base font-bold text-zinc-900 uppercase tracking-tight mb-1.5">
              Delete Order
            </h2>
            <p className="text-xs text-zinc-500 font-medium leading-relaxed mb-2">
              Order{' '}
              <span className="font-mono font-bold text-zinc-900">
                #{pendingDelete.orderNumber || pendingDelete.id.slice(-8).toUpperCase()}
              </span>{' '}
              and everything linked to it — bookings, payment records, security deposit
              entries and the invoice — will be permanently removed.
            </p>
            <p className="text-xs text-rose-600 font-semibold mb-6">This cannot be undone.</p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                disabled={deleting}
                className="flex-1 py-3 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-900 font-bold text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {deleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting</span>
                  </>
                ) : (
                  <span>Delete Order</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}