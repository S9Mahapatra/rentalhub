'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

type VerifyState = 'checking' | 'paid' | 'pending' | 'failed';

function PaymentStatus() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order_id');
  const [state, setState] = useState<VerifyState>('checking');
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  // React 18 StrictMode mounts effects twice in development; without this the
  // verification would fire two overlapping requests.
  const verified = useRef(false);

  useEffect(() => {
    if (!orderNumber) {
      setState('failed');
      setMessage('Missing order reference.');
      return;
    }

    if (verified.current) return;
    verified.current = true;

    fetch('/api/payments/cashfree/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderNumber }),
    })
      .then(async (res) => {
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error || 'Could not verify payment');
        return payload.data;
      })
      .then(async (data: { status: VerifyState; orderId: string }) => {
        setOrderId(data.orderId);
        setState(data.status);

        if (data.status === 'paid') {
          await fetch('/api/cart', { method: 'DELETE' });
          window.dispatchEvent(new Event('cart-updated'));
          router.replace(`/orders/${data.orderId}`);
        }
      })
      .catch((err: Error) => {
        setState('failed');
        setMessage(err.message);
      });
  }, [orderNumber, router]);

  if (state === 'checking' || state === 'paid') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500 mb-6" />
        <h1 className="text-2xl font-black text-neutral-950 mb-2 tracking-tight">
          {state === 'paid' ? 'Payment confirmed' : 'Confirming your payment'}
        </h1>
        <p className="text-neutral-500 font-medium max-w-sm">
          {state === 'paid'
            ? 'Taking you to your booking...'
            : 'Please do not close this window while we verify the transaction.'}
        </p>
      </div>
    );
  }

  if (state === 'pending') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-black text-neutral-950 mb-2 tracking-tight">Payment not completed</h1>
        <p className="text-neutral-500 font-medium mb-8 max-w-sm">
          We have not received your payment yet. If money left your account it will be confirmed
          automatically within a few minutes.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/checkout" className="px-8 py-4 bg-neutral-950 hover:bg-neutral-800 text-white font-black text-sm rounded-full transition-all shadow-lg hover:shadow-xl">
            TRY AGAIN
          </Link>
          {orderId && (
            <Link href={`/orders/${orderId}`} className="px-8 py-4 bg-white border-2 border-neutral-200 hover:border-neutral-300 text-neutral-950 font-black text-sm rounded-full transition-all">
              VIEW ORDER
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-black text-neutral-950 mb-2 tracking-tight">Payment failed</h1>
      <p className="text-neutral-500 font-medium mb-8 max-w-sm">
        {message || 'Your payment could not be completed. You have not been charged.'}
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link href="/checkout" className="px-8 py-4 bg-neutral-950 hover:bg-neutral-800 text-white font-black text-sm rounded-full transition-all shadow-lg hover:shadow-xl">
          BACK TO CHECKOUT
        </Link>
        <Link href="/cart" className="px-8 py-4 bg-white border-2 border-neutral-200 hover:border-neutral-300 text-neutral-950 font-black text-sm rounded-full transition-all">
          VIEW CART
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500" />
        </div>
      }
    >
      <PaymentStatus />
    </Suspense>
  );
}
