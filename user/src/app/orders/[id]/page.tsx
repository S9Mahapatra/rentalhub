'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/utils';

export default function OrderInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session || !params.id) return;

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
  }, [session, params.id]);

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-dark-400 mb-4">Please sign in to view invoices</p>
        <Link href="/auth/login" className="px-6 py-2 bg-brand-600 text-white rounded-xl font-medium">
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="h-8 bg-dark-800 rounded w-64 mb-6 animate-pulse" />
        <div className="h-[520px] bg-dark-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Invoice unavailable</h2>
        <p className="text-dark-400 mb-6">{error || 'The requested invoice could not be found.'}</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => router.refresh()} className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-medium">
            Retry
          </button>
          <Link href="/orders" className="px-6 py-2.5 bg-dark-700 text-white rounded-xl font-medium">
            Back to invoices
          </Link>
        </div>
      </div>
    );
  }

  const printInvoice = () => window.print();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-brand-400 mb-2">Invoice</p>
          <h1 className="text-2xl font-bold text-white">{order.orderNumber}</h1>
          <p className="text-sm text-dark-400 mt-1">Booked on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={printInvoice} className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium">
            Print / Save PDF
          </button>
          <Link href="/orders" className="px-4 py-2 bg-dark-700 text-white rounded-xl text-sm font-medium">
            Back
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-dark-800/40 border border-white/5 rounded-2xl p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-dark-400 mb-2">Customer</p>
              <p className="text-white font-medium">{session.user?.name}</p>
              <p className="text-dark-300 text-sm">{session.user?.email}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-dark-400 mb-2">Fulfillment</p>
              <p className="text-white font-medium">{order.deliveryMethod === 'delivery' ? 'Home Delivery' : 'Store Pickup'}</p>
              <p className="text-dark-300 text-sm">
                {order.deliveryAddressSnapshot
                  ? `${order.deliveryAddressSnapshot.street}, ${order.deliveryAddressSnapshot.city}, ${order.deliveryAddressSnapshot.state}`
                  : 'Pickup from RentalHub store'}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-dark-400 mb-3">Rental items</p>
            <div className="space-y-3">
              {(order.items || []).map((item: any) => (
                <div key={item.id || item.productId} className="rounded-xl border border-white/5 bg-dark-900/40 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-white font-medium">{item.productName}</p>
                      <p className="text-xs text-dark-400 mt-1">
                        {item.quantity} × {formatCurrency(item.pricePerDay)}/day · {item.rentalDays} days
                      </p>
                      <p className="text-xs text-dark-400 mt-1">
                        Rental period: {new Date(item.rentalStartAt).toLocaleString()} → {new Date(item.expectedReturnAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{formatCurrency(item.rentalAmount)}</p>
                      <p className="text-xs text-dark-400 mt-1">Deposit {formatCurrency(item.securityDeposit)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-dark-800/40 border border-white/5 rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wider text-dark-400 mb-3">Payment summary</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-400">Rental subtotal</span>
                <span className="text-white">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Security deposit</span>
                <span className="text-white">{formatCurrency(order.securityDepositTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Delivery fee</span>
                <span className="text-white">{formatCurrency(order.deliveryFee || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Tax</span>
                <span className="text-white">{formatCurrency(order.tax || 0)}</span>
              </div>
              <div className="border-t border-white/5 pt-2 flex justify-between">
                <span className="text-white font-semibold">Total paid</span>
                <span className="text-brand-400 font-bold">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
            <div className="mt-4 text-xs text-dark-400">
              Payment status: {order.paymentStatus} · Deposit status: {order.securityDepositRefundTotal > 0 ? 'active / settled' : 'held'}
            </div>
          </div>

          <div className="bg-dark-800/40 border border-white/5 rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wider text-dark-400 mb-3">Refund / deduction</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-400">Late fees</span>
                <span className="text-white">{formatCurrency(order.lateFeeTotal || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Refunded</span>
                <span className="text-white">{formatCurrency(order.securityDepositRefundTotal || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Deducted</span>
                <span className="text-white">{formatCurrency(order.securityDepositDeductedTotal || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Balance due</span>
                <span className="text-white">{formatCurrency(order.bookings?.reduce((sum: number, booking: any) => sum + (booking.balanceDue || 0), 0) || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

