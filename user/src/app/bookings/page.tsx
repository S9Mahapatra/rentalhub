'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/utils';

const FILTERS = ['all', 'upcoming', 'active', 'overdue', 'completed', 'cancelled'] as const;

function formatDateTime(value: string | Date | undefined) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

function deriveBookingGroup(booking: any) {
  if (['cancelled'].includes(booking.status)) return 'cancelled';
  if (['completed', 'returned'].includes(booking.status) || booking.returnStatus === 'completed') return 'completed';
  if (booking.status === 'overdue' || booking.overdue) return 'overdue';
  if (booking.status === 'active') return 'active';
  return 'upcoming';
}

const STATUS_COLORS: Record<string, string> = {
  upcoming: 'bg-blue-500/20 text-blue-400',
  active: 'bg-green-500/20 text-green-400',
  overdue: 'bg-red-500/20 text-red-400',
  completed: 'bg-emerald-500/20 text-emerald-400',
  cancelled: 'bg-zinc-500/20 text-zinc-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  ready_for_pickup: 'bg-indigo-500/20 text-indigo-400',
  out_for_delivery: 'bg-cyan-500/20 text-cyan-400',
  pending_payment: 'bg-yellow-500/20 text-yellow-400',
  returned: 'bg-purple-500/20 text-purple-400',
};

export default function BookingsPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all');

  useEffect(() => {
    if (!session) return;

    setLoading(true);
    setError('');

    fetch('/api/bookings?limit=100')
      .then(async (r) => {
        const payload = await r.json();
        if (!r.ok) throw new Error(payload.error || 'Failed to load bookings');
        return payload;
      })
      .then(({ data }) => setBookings(data || []))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [session]);

  const visibleBookings = useMemo(() => {
    if (filter === 'all') return bookings;
    return bookings.filter((booking) => deriveBookingGroup(booking) === filter);
  }, [bookings, filter]);

  const handleAction = async (id: string, action: 'cancel' | 'confirm_pickup' | 'return') => {
    try {
      const body: Record<string, unknown> = { action };
      if (action === 'return') {
        body.returnCondition = 'good';
      }
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Failed to update booking');

      const updated = payload.data.booking || payload.data;
      setBookings((prev) => prev.map((booking) => (booking.id === id ? { ...booking, ...updated } : booking)));
      window.dispatchEvent(new Event('cart-updated'));

      if (action === 'cancel') {
        toast.success('Booking cancelled');
      } else if (action === 'confirm_pickup') {
        toast.success('Pickup confirmed');
      } else if (action === 'return') {
        toast.success(
          payload.data.lateFee?.totalLateFee > 0
            ? `Returned with late fee ${formatCurrency(payload.data.lateFee.totalLateFee)}`
            : 'Return processed'
        );
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update booking');
    }
  };

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-dark-400 mb-4">Please sign in to view your bookings</p>
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
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-dark-800 rounded-xl animate-pulse" />)}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Bookings unavailable</h2>
        <p className="text-dark-400 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-medium">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Bookings</h1>
          <p className="text-sm text-dark-400 mt-1">Upcoming bookings, active rentals, overdue items, returns, and invoice history.</p>
        </div>
        <Link href="/orders" className="text-sm text-brand-400 hover:text-brand-300">
          View invoices
        </Link>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {FILTERS.map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`px-4 py-1.5 text-sm rounded-xl whitespace-nowrap font-medium transition-all ${
              filter === item
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25'
                : 'bg-dark-800/50 text-dark-400 hover:text-white hover:bg-dark-700'
            }`}
          >
            {item === 'all' ? 'All' : item.replace('_', ' ')}
          </button>
        ))}
      </div>

      {visibleBookings.length === 0 ? (
        <div className="text-center py-20 bg-dark-800/20 border border-white/5 rounded-2xl">
          <p className="text-dark-400 mb-4">No bookings found</p>
          <Link href="/products" className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-medium">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleBookings.map((booking, i) => {
            const group = deriveBookingGroup(booking);
            const productImage = booking.product?.imageUrl || booking.product?.images?.[0] || '/placeholder.jpg';
            const canCancel = ['draft', 'pending_payment', 'confirmed', 'ready_for_pickup', 'out_for_delivery'].includes(booking.status);
            const canPickup = ['confirmed', 'ready_for_pickup', 'out_for_delivery'].includes(booking.status) && !booking.actualPickupAt;
            const canReturn = ['active', 'overdue'].includes(booking.status);

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-dark-800/40 border border-white/5 rounded-2xl p-4"
              >
                <div className="flex gap-4">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-dark-700 shrink-0">
                    <Image src={productImage} alt={booking.product?.name || 'Product'} fill className="object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-white font-medium text-sm truncate">{booking.product?.name}</h3>
                          <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${STATUS_COLORS[booking.status] || STATUS_COLORS[group]}`}>
                            {booking.status}
                          </span>
                          {booking.overdue && <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-500/20 text-red-400">Overdue</span>}
                        </div>
                        <p className="text-dark-400 text-xs mt-1">
                          {formatDateTime(booking.rentalStartAt || booking.rentalStart)} → {formatDateTime(booking.expectedReturnAt || booking.rentalEnd)}
                        </p>
                        <p className="text-dark-400 text-xs mt-1">
                          Pickup: {booking.deliveryMethod === 'pickup' ? 'Store pickup' : 'Delivery'} · {formatDateTime(booking.pickupScheduledAt)}
                        </p>
                        <p className="text-dark-400 text-xs mt-1">
                          Return: {formatDateTime(booking.actualReturnAt || booking.actualReturnDate)} · Condition: {booking.returnCondition || 'Pending'}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-white font-semibold">{formatCurrency(booking.totalAmount)}</p>
                        <p className="text-xs text-dark-400 mt-1">
                          Qty {booking.quantity} · {booking.rentalDays} days
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                      <div className="rounded-xl border border-white/5 bg-dark-900/40 p-3">
                        <p className="text-xs text-dark-400 uppercase tracking-wider mb-1">Deposit</p>
                        <p className="text-sm text-white">{formatCurrency(booking.securityDeposit)} held</p>
                        <p className="text-xs text-dark-400 mt-1">
                          Refund: {booking.depositRefundStatus || 'pending'} · Deducted: {formatCurrency(booking.depositDeductedAmount || 0)}
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/5 bg-dark-900/40 p-3">
                        <p className="text-xs text-dark-400 uppercase tracking-wider mb-1">Late fee</p>
                        <p className="text-sm text-white">{formatCurrency(booking.lateFees || 0)}</p>
                        <p className="text-xs text-dark-400 mt-1">
                          {booking.lateDurationHours || 0} hours · {booking.lateDurationDays || 0} days late
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/5 bg-dark-900/40 p-3">
                        <p className="text-xs text-dark-400 uppercase tracking-wider mb-1">Invoice</p>
                        {booking.orderId ? (
                          <Link href={`/orders/${booking.orderId}`} className="text-sm text-brand-400 hover:text-brand-300">
                            {booking.invoiceNumber || booking.orderId}
                          </Link>
                        ) : (
                          <p className="text-sm text-dark-300">Pending</p>
                        )}
                        <p className="text-xs text-dark-400 mt-1">
                          Payment: {booking.paymentStatus || 'pending'} · Deposit: {booking.depositHeldStatus || 'pending'}
                        </p>
                      </div>
                    </div>

                    {booking.deliveryAddressSnapshot && (
                      <div className="mt-4 text-xs text-dark-400">
                        Delivery address: {booking.deliveryAddressSnapshot.street}, {booking.deliveryAddressSnapshot.city}, {booking.deliveryAddressSnapshot.state} {booking.deliveryAddressSnapshot.zipCode}
                      </div>
                    )}

                    {booking.deductionReason && (
                      <p className="text-xs text-amber-400 mt-2">
                        Deduction reason: {booking.deductionReason}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-4">
                      {canCancel && (
                        <button
                          onClick={() => handleAction(booking.id, 'cancel')}
                          className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                      {canPickup && (
                        <button
                          onClick={() => handleAction(booking.id, 'confirm_pickup')}
                          className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-xs font-medium rounded-lg hover:bg-indigo-500/30 transition-colors"
                        >
                          Confirm Pickup
                        </button>
                      )}
                      {canReturn && (
                        <button
                          onClick={() => handleAction(booking.id, 'return')}
                          className="px-3 py-1 bg-brand-500/20 text-brand-400 text-xs font-medium rounded-lg hover:bg-brand-500/30 transition-colors"
                        >
                          Return
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

