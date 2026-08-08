'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/utils';

export default function OrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session) return;

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
  }, [session]);

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-dark-400 mb-4">Please sign in to view your invoices</p>
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
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-dark-800 rounded-xl animate-pulse" />)}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Invoices unavailable</h2>
        <p className="text-dark-400 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-medium">
          Retry
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white mb-2">No invoices yet</h2>
        <p className="text-dark-400 mb-6">Confirmed bookings will appear here as invoices.</p>
        <Link href="/products" className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-medium">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Invoices</h1>
      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="bg-dark-800/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-white font-medium">{order.orderNumber}</p>
              <p className="text-xs text-dark-400 mt-1">
                {new Date(order.createdAt).toLocaleString()} · {order.items?.length || 0} rental item(s)
              </p>
              <p className="text-xs text-dark-400 mt-1">
                Payment: {order.paymentStatus} · Deposits held: {formatCurrency(order.securityDepositTotal || 0)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white font-semibold">{formatCurrency(order.totalAmount)}</p>
              <Link href={`/orders/${order.id}`} className="text-sm text-brand-400 hover:text-brand-300">
                View invoice
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

