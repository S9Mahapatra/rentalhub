'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/utils';

export default function BookingsPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!session) return;
    const params = new URLSearchParams();
    if (filter) params.set('status', filter);
    fetch(`/api/bookings?${params}`).then((r) => r.json()).then(({ data }) => setBookings(data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [session, filter]);

  const handleCancel = async (id: string) => {
    const res = await fetch(`/api/bookings/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'cancel' }) });
    if (res.ok) { setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: 'cancelled' } : b)); toast.success('Booking cancelled'); }
  };

  const handleReturn = async (id: string) => {
    const res = await fetch(`/api/bookings/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'return' }) });
    const data = await res.json();
    if (res.ok) {
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: 'returned', lateFees: data.data.lateFees, depositRefundAmount: data.data.depositRefund, depositRefunded: true } : b));
      toast.success(data.data.lateFees > 0 ? `Returned. Late fees: ${formatCurrency(data.data.lateFees)}` : 'Returned successfully');
    }
  };

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-dark-400 mb-4">Please sign in to view your bookings</p>
        <Link href="/auth/login" className="px-6 py-2 bg-brand-600 text-white rounded-xl font-medium">Sign In</Link>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    confirmed: 'bg-blue-500/20 text-blue-400',
    active: 'bg-green-500/20 text-green-400',
    returned: 'bg-purple-500/20 text-purple-400',
    completed: 'bg-emerald-500/20 text-emerald-400',
    cancelled: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">My Bookings</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['', 'active', 'confirmed', 'completed', 'returned', 'cancelled'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 text-sm rounded-xl whitespace-nowrap font-medium transition-all ${filter === f ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25' : 'bg-dark-800/50 text-dark-400 hover:text-white hover:bg-dark-700'}`}>
            {f || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-dark-800 rounded-xl animate-pulse" />)}</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-dark-400 mb-4">No bookings found</p>
          <Link href="/products" className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-medium">Browse Products</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking, i) => (
            <motion.div key={booking.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-dark-800/40 border border-white/5 rounded-2xl p-4">
              <div className="flex gap-4">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-dark-700 shrink-0">
                  <Image src={booking.product.images[0] || '/placeholder.jpg'} alt={booking.product.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-white font-medium text-sm">{booking.product.name}</h3>
                      <p className="text-dark-400 text-xs mt-1">
                        {new Date(booking.rentalStart).toLocaleDateString()} - {new Date(booking.rentalEnd).toLocaleDateString()} ({booking.rentalDays} days)
                      </p>
                    </div>
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${statusColors[booking.status] || 'bg-dark-700 text-dark-300'}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-white font-semibold text-sm">{formatCurrency(booking.totalAmount)}</span>
                    <div className="flex gap-2">
                      {booking.status === 'confirmed' && (
                        <button onClick={() => handleCancel(booking.id)} className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-lg hover:bg-red-500/30 transition-colors">Cancel</button>
                      )}
                      {['active', 'delivered'].includes(booking.status) && (
                        <button onClick={() => handleReturn(booking.id)} className="px-3 py-1 bg-brand-500/20 text-brand-400 text-xs font-medium rounded-lg hover:bg-brand-500/30 transition-colors">Return</button>
                      )}
                    </div>
                  </div>
                  {booking.depositRefunded && (
                    <p className="text-xs text-emerald-400 mt-2">
                      Deposit refunded: {formatCurrency(booking.depositRefundAmount)}{booking.lateFees > 0 && ` (Late fees: ${formatCurrency(booking.lateFees)})`}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  active: 'bg-green-500/20 text-green-400',
  returned: 'bg-purple-500/20 text-purple-400',
  completed: 'bg-emerald-500/20 text-emerald-400',
  cancelled: 'bg-red-500/20 text-red-400',
};
