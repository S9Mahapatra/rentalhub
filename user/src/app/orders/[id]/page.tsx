'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { 
  Printer, 
  ArrowLeft, 
  Calendar, 
  ShieldCheck, 
  User, 
  Truck, 
  Store, 
  Receipt, 
  Lock, 
  RefreshCw, 
  AlertCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function OrderInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status !== 'authenticated' || !params.id) {
      if (status === 'unauthenticated') setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    fetch(`/api/orders/${params.id}`)
      .then(async (r) => {
        const payload = await r.json();
        if (!r.ok) throw new Error(payload.error || 'Failed to load invoice');
        return payload;
      })
      .then(({ data }) => setOrder(data))
      .catch((err: Error) => {
        setError(err.message);
        toast.error(err.message);
      })
      .finally(() => setLoading(false));
  }, [status, params.id]);

  const printInvoice = () => window.print();

  // 1. SESSION LOADING STATE
  if (status === 'loading') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono tracking-widest text-zinc-600 uppercase font-bold">Verifying Session</span>
      </div>
    );
  }

  // 2. UNAUTHENTICATED STATE
  if (!session) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 bg-zinc-100/60">
        <div className="bg-white border border-zinc-300 rounded-2xl p-8 sm:p-12 text-center max-w-md w-full shadow-sm">
          <div className="w-12 h-12 bg-zinc-900 text-white rounded-xl flex items-center justify-center mx-auto mb-5 shadow-xs">
            <Lock className="w-5 h-5 stroke-[2]" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight uppercase mb-2">
            Authentication Required
          </h2>
          <p className="text-xs text-zinc-600 font-medium mb-8 leading-relaxed max-w-xs mx-auto">
            Please sign in to view official tax invoices and rental deposit receipts.
          </p>
          <Link 
            href="/auth/login?callbackUrl=/orders" 
            className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 group"
          >
            <span>Sign In To Access</span>
            <Receipt className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  // 3. INVOICE LOADING SKELETON
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="h-7 bg-zinc-200 rounded w-64 mb-8 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-4">
            <div className="h-40 bg-white rounded-2xl animate-pulse border border-zinc-200" />
            <div className="h-64 bg-white rounded-2xl animate-pulse border border-zinc-200" />
          </div>
          <div className="lg:col-span-5 h-96 bg-zinc-900 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  // 4. ERROR STATE
  if (error || !order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="bg-white border border-zinc-300 rounded-2xl p-8 max-w-md w-full shadow-sm">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-3 stroke-[1.8]" />
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-1">Invoice Unavailable</h2>
          <p className="text-xs text-zinc-600 font-medium mb-6">{error || 'The requested invoice document could not be found.'}</p>
          <div className="flex items-center justify-center gap-3">
            <button 
              onClick={() => router.refresh()} 
              className="px-5 py-2.5 bg-zinc-900 text-white font-bold text-xs rounded-xl uppercase tracking-wider flex items-center gap-2 hover:bg-zinc-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
            <Link 
              href="/orders" 
              className="px-5 py-2.5 bg-zinc-100 border border-zinc-300 text-zinc-800 font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-zinc-200 transition-colors"
            >
              Back To Invoices
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 5. MAIN TAX INVOICE VIEW (HIGH-CONTRAST BALANCED THEME)
  return (
    <div className="w-full bg-zinc-100/70 min-h-screen pb-24 text-zinc-900 print:bg-white print:pb-0">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        
        {/* TOP BAR / NAVIGATION & ACTIONS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-zinc-300 print:hidden">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-900 text-white font-mono text-[10px] uppercase tracking-widest font-bold mb-2 shadow-2xs">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Official Tax Invoice</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 font-mono">
              #{order.orderNumber || order.id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-xs text-zinc-600 font-semibold mt-1">
              Booked on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={printInvoice} 
              className="py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Print Invoice</span>
            </button>
            <Link 
              href="/orders" 
              className="py-2.5 px-4 bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-900 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-zinc-900" />
              <span>Back</span>
            </Link>
          </div>
        </div>

        {/* INVOICE CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: FULFILLMENT & RENTAL ITEMS (CLEAN WHITE CARDS WITH DARK ACCENTS) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* PARTY DETAILS CARD */}
            <div className="bg-white border-2 border-zinc-200/90 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* CUSTOMER INFO */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-mono text-xs text-zinc-900 uppercase tracking-widest font-bold">
                    <span className="px-2 py-0.5 bg-zinc-900 text-white rounded text-[10px]">01</span>
                    <span>Customer</span>
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-zinc-900">{session.user?.name || 'Authorized Client'}</p>
                    <p className="font-mono text-xs text-zinc-600 font-semibold">{session.user?.email}</p>
                  </div>
                </div>

                {/* LOGISTICS / FULFILLMENT */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-mono text-xs text-zinc-900 uppercase tracking-widest font-bold">
                    <span className="px-2 py-0.5 bg-zinc-900 text-white rounded text-[10px]">02</span>
                    <span>Fulfillment</span>
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-zinc-900">
                      {order.deliveryMethod === 'delivery' ? 'Direct Delivery' : 'Store Pickup'}
                    </p>
                    <p className="text-xs text-zinc-600 font-medium leading-relaxed mt-0.5">
                      {order.deliveryAddressSnapshot
                        ? `${order.deliveryAddressSnapshot.street}, ${order.deliveryAddressSnapshot.city}, ${order.deliveryAddressSnapshot.state} ${order.deliveryAddressSnapshot.zipCode || ''}`
                        : 'RentalHub Central Station'}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* ITEMIZATION LIST */}
            <div className="bg-white border-2 border-zinc-200/90 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-zinc-900 font-bold">
                  <FileText className="w-4 h-4 text-zinc-900" />
                  <span>Itemized Equipment</span>
                </div>
                <span className="font-mono text-xs font-bold text-zinc-600">
                  {order.items?.length || 0} Item{order.items?.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-3">
                {(order.items || []).map((item: any) => (
                  <div 
                    key={item.id || item.productId} 
                    className="bg-zinc-50 border border-zinc-300/80 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-zinc-900 truncate">{item.productName}</h4>
                        <span className="font-mono text-xs text-zinc-600 font-semibold block mt-0.5">
                          {item.quantity} × {formatCurrency(item.pricePerDay)}/day · {item.rentalDays} Days
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono text-[9px] uppercase font-bold text-zinc-500 block">Subtotal</span>
                        <span className="font-mono text-sm font-extrabold text-zinc-900 tabular-nums">
                          {formatCurrency(item.rentalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Booking Dates & Security Hold Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-zinc-200 text-xs">
                      <div className="flex items-center gap-1.5 text-zinc-800 font-semibold font-mono text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                        <span>
                          {new Date(item.rentalStartAt).toLocaleDateString()} → {new Date(item.expectedReturnAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-emerald-900 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded font-mono font-bold text-[10px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Hold: {formatCurrency(item.securityDeposit)}</span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: FINANCIAL SUMMARY & SETTLEMENT (DARK TECH LEDGERS FOR MAXIMUM CONTRAST) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* PAYMENT SUMMARY CARD (DARK CONTAINER) */}
            <div className="bg-zinc-900 text-white rounded-2xl p-6 shadow-xl border border-zinc-800 space-y-5">
              
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3.5">
                <span className="font-mono text-xs uppercase tracking-wider text-zinc-300 font-bold">Payment Summary</span>
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                  {order.paymentStatus?.toUpperCase() || 'PAID'}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center text-zinc-300">
                  <span>Rental Subtotal</span>
                  <span className="font-mono text-white font-semibold tabular-nums">{formatCurrency(order.subtotal)}</span>
                </div>

                <div className="flex justify-between items-center text-zinc-300">
                  <div className="flex items-center gap-1.5">
                    <span>Security Deposit Hold</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="font-mono text-white font-semibold tabular-nums">{formatCurrency(order.securityDepositTotal)}</span>
                </div>

                <div className="flex justify-between items-center text-zinc-300">
                  <span>Logistics & Delivery</span>
                  <span className="font-mono text-white font-semibold tabular-nums">
                    {order.deliveryFee > 0 ? formatCurrency(order.deliveryFee) : 'Complimentary'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-zinc-300">
                  <span>GST (18% Statutory Tax)</span>
                  <span className="font-mono text-white font-semibold tabular-nums">{formatCurrency(order.tax || 0)}</span>
                </div>
              </div>

              <div className="pt-3.5 border-t border-zinc-800 space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Total Paid</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400 tracking-tight tabular-nums">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-zinc-400 border-t border-zinc-800">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Status: {order.paymentStatus || 'Verified'}
                </span>
                <span>Mode: {order.paymentMethod?.toUpperCase() || 'ONLINE'}</span>
              </div>

            </div>

            {/* REFUND & DEPOSIT SETTLEMENT CARD (DARK CONTAINER) */}
            <div className="bg-zinc-900 text-white rounded-2xl p-6 shadow-xl border border-zinc-800 space-y-4">
              
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <span className="font-mono text-xs uppercase tracking-wider text-zinc-300 font-bold">Deposit Settlement</span>
                <span className="font-mono text-[10px] text-zinc-400">Post-Return Check</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center text-zinc-300">
                  <span>Late Return Fees</span>
                  <span className="font-mono text-white tabular-nums">{formatCurrency(order.lateFeeTotal || 0)}</span>
                </div>

                <div className="flex justify-between items-center text-zinc-300">
                  <span>Deposit Refunded</span>
                  <span className="font-mono text-emerald-400 tabular-nums font-semibold">
                    {formatCurrency(order.securityDepositRefundTotal || 0)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-zinc-300">
                  <span>Deductions / Damages</span>
                  <span className="font-mono text-rose-400 tabular-nums">
                    {formatCurrency(order.securityDepositDeductedTotal || 0)}
                  </span>
                </div>

                <div className="pt-3 border-t border-zinc-800 flex justify-between items-center">
                  <span className="font-semibold text-zinc-300">Outstanding Balance Due</span>
                  <span className="font-mono text-sm font-bold text-white tabular-nums">
                    {formatCurrency(
                      order.bookings?.reduce((sum: number, booking: any) => sum + (booking.balanceDue || 0), 0) || 0
                    )}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Security holds returned following check-in inspection.</span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}