'use client';

import Link from 'next/link';

/** Print/back controls — hidden from the printed sheet via `print:hidden`. */
export default function InvoiceActions({ orderId }: { orderId: string }) {
  return (
    <div className="print:hidden flex flex-wrap items-center gap-3 mb-8">
      <button
        onClick={() => window.print()}
        className="px-6 py-3 bg-neutral-950 hover:bg-neutral-800 text-white font-black text-xs tracking-widest uppercase transition-colors"
      >
        Print / Save PDF
      </button>
      <Link
        href={`/orders/${orderId}`}
        className="px-6 py-3 border-2 border-neutral-200 hover:border-neutral-400 text-neutral-950 font-black text-xs tracking-widest uppercase transition-colors"
      >
        Back to Order
      </Link>
    </div>
  );
}
