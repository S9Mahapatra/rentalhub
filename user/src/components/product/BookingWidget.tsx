'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowUpRight, Calendar, Loader2 } from 'lucide-react';

interface BookingWidgetProps {
  productId: string;
  isAvailable: boolean;
  minRentalDays: number;
}

export default function BookingWidget({ productId, isAvailable, minRentalDays }: BookingWidgetProps) {
  const router = useRouter();
  
  // Set default dates: Start tomorrow, End (tomorrow + minRentalDays)
  const today = new Date();
  const defaultStart = new Date(today);
  defaultStart.setDate(today.getDate() + 1);
  const defaultEnd = new Date(defaultStart);
  defaultEnd.setDate(defaultStart.getDate() + (minRentalDays || 1));

  const [startDate, setStartDate] = useState(defaultStart.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(defaultEnd.toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleBooking = async () => {
    if (!isAvailable) return;
    
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start < new Date(new Date().setHours(0,0,0,0))) {
      toast.error('Start date cannot be in the past.');
      return;
    }

    if (end <= start) {
      toast.error('End date must be after start date.');
      return;
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    const minDays = minRentalDays || 1;
    if (diffDays < minDays) {
      toast.error(`Minimum rental period is ${minDays} days.`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          quantity: 1,
          rentalStart: start.toISOString(),
          rentalEnd: end.toISOString(),
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        toast.error('Please log in to rent this item.');
        router.push('/auth/login?callbackUrl=' + encodeURIComponent(window.location.href));
        return;
      }

      if (!res.ok) {
        toast.error(data.error || 'Failed to add to cart.');
        setLoading(false);
        return;
      }

      toast.success('Added to cart successfully!');
      
      // Dispatch an event in case a cart badge in the header needs to update
      window.dispatchEvent(new Event('cart-updated'));
      
      // Navigate to cart
      router.push('/cart');
    } catch (error) {
      toast.error('An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Start Date Input */}
        <div className="flex-1 relative">
          <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest block mb-1.5 pl-1">
            Rental Start
          </label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-neutral-50/50 border border-neutral-200/80 rounded-2xl pl-10 pr-4 py-3.5 text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* End Date Input */}
        <div className="flex-1 relative">
          <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest block mb-1.5 pl-1">
            Rental End
          </label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-neutral-50/50 border border-neutral-200/80 rounded-2xl pl-10 pr-4 py-3.5 text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button 
        onClick={handleBooking}
        disabled={!isAvailable || loading}
        className={`w-full py-4 rounded-full font-black text-sm flex items-center justify-center gap-2 transition-all mt-2 ${
          isAvailable 
            ? 'bg-neutral-950 hover:bg-neutral-800 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]' 
            : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>PROCESSING...</span>
          </>
        ) : isAvailable ? (
          <>
            <span>RENT</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </>
        ) : (
          'CURRENTLY UNAVAILABLE'
        )}
      </button>
    </div>
  );
}
