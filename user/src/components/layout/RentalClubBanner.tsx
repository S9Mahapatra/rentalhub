'use client';

import { Sparkles, ArrowRight } from 'lucide-react';

export default function RentalClubBanner() {
  return (
    <section className="w-full max-w-[1400px] mx-auto px-4 py-6">
      <div className="relative rounded-[32px] bg-neutral-900 text-white overflow-hidden p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-neutral-700/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-xl text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800 text-neutral-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>RENTAL PASS MEMBERSHIP</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-4">
            Join the Rental Pass & Save 20%
          </h2>

          <p className="text-neutral-400 text-sm sm:text-base mb-6">
            Get unlimited zero-deposit rentals, free doorstep delivery, and priority booking on new releases.
          </p>

          <button className="px-8 py-4 bg-white hover:bg-neutral-100 text-neutral-900 font-bold rounded-full transition-all text-sm inline-flex items-center gap-2 shadow-md">
            <span>Get VIP Rental Pass</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* VIP Pass Card UI */}
        <div className="relative z-10 w-full max-w-sm">
          <div className="bg-gradient-to-br from-neutral-800 to-neutral-950 p-6 rounded-[24px] border border-neutral-700/60 shadow-2xl flex flex-col justify-between h-56">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-lg tracking-wider text-neutral-200">VIP RENT PASS</span>
              <span className="text-xs bg-amber-400/20 text-amber-300 px-2.5 py-1 rounded-full font-bold">PRO MEMBER</span>
            </div>

            <div>
              <p className="text-xs text-neutral-400">Cardholder</p>
              <p className="font-mono text-sm tracking-widest text-neutral-200 mt-0.5">Alex Morgan</p>
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-400 border-t border-neutral-800 pt-3">
              <span>0% Security Deposit</span>
              <span>Free Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}