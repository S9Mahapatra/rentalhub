'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, ArrowUpRight, Zap, Sparkles, Clock, CheckCircle2 } from 'lucide-react';

export default function Hero() {
  return (
    <section className="w-full max-w-[1400px] mx-auto px-4 py-4 overflow-visible">
      {/* Light, Soft Gray Hero Container */}
      <div className="relative w-full rounded-[36px] bg-[#F4F4F6] border border-neutral-200/70 p-6 sm:p-10 lg:p-14 min-h-[600px] flex flex-col justify-between overflow-visible shadow-xs">

        {/* Subtle Ambient Backdrop Glow */}
        <div className="absolute top-1/3 right-10 w-[420px] h-[420px] bg-gradient-to-tr from-neutral-300/40 via-stone-200/30 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center my-auto">

          {/* LEFT COLUMN: Editorial Typography & CTAs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 flex flex-col items-start"
          >
            {/* Top Smart Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-neutral-800 text-xs font-semibold shadow-xs border border-neutral-200/80 mb-6 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>PREMIUM RENTAL MARKETPLACE</span>
            </div>

            {/* Smart High-Contrast Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[58px] font-extrabold text-neutral-950 leading-[1.08] tracking-tight mb-6">
              RENT ANYTHING. <br />
              <span className="text-neutral-500 font-bold">
                USE IT WHEN YOU NEED IT.
              </span>
            </h1>

            <p className="text-base sm:text-lg font-normal text-neutral-600 max-w-lg mb-8 leading-relaxed">
              Access cameras, gaming consoles, camping gear, and workstations on daily rates. Insured, sanitized, and delivered straight to your door.
            </p>

            {/* Smart CTAs */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <Link
                href="/products"
                className="px-8 py-4 bg-neutral-950 hover:bg-neutral-800 text-white font-semibold rounded-full transition-all shadow-md hover:shadow-xl hover:scale-[1.02] text-sm flex items-center gap-2.5"
              >
                <span>Explore All Catalog</span>
                <ArrowUpRight className="w-4 h-4 text-neutral-300" />
              </Link>

              <Link
                href="/how-it-works"
                className="px-7 py-4 bg-white hover:bg-neutral-100 text-neutral-900 font-semibold rounded-full transition-all text-sm border border-neutral-200 shadow-xs"
              >
                How It Works
              </Link>
            </div>

            {/* Micro Trust Strip */}
            <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-neutral-200/80 w-full">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
                <div className="p-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-900 shadow-2xs">
                  <Truck className="w-3.5 h-3.5" />
                </div>
                <span>Doorstep Delivery & Pickups</span>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
                <div className="p-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-900 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <span>100% Damage Covered</span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: 3D Layered Showcase Stage */}
          <div className="lg:col-span-6 relative w-full min-h-[460px] flex items-center justify-center overflow-visible py-6">

            {/* Stage Canvas Base Card */}
            <div className="relative w-full max-w-[460px] bg-white rounded-[32px] p-6 shadow-xl border border-neutral-200/60 flex flex-col justify-between z-10">

              {/* Card Header (Padded Right so Camera doesn't cover text) */}
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4 pr-24 sm:pr-28">
                <div>
                  <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block">FEATURED KIT</span>
                  <span className="text-sm font-bold text-neutral-900">Pro Cinema Shoot Bundle</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold shrink-0">
                  Available
                </span>
              </div>

              {/* CARD BODY: Filled Content (Eliminates Empty Space) */}
              <div className="my-5 flex flex-col space-y-3 pr-28 sm:pr-32">
                <p className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider">Bundle Includes:</p>

                <ul className="space-y-2 text-xs font-medium text-neutral-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Sony A7IV 4K Cinema Body</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>24-70mm f/2.8 GM Pro Lens</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Dual Batteries & Travel Case</span>
                  </li>
                </ul>

                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-800 text-[11px] font-bold px-3 py-1 rounded-lg">
                    <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>Zero Security Deposit</span>
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                <div className="pl-1">
                  <span className="text-[11px] text-neutral-400 block font-medium">Daily Rate</span>
                  <span className="text-lg font-black text-neutral-950">₹1,299 <span className="text-xs font-normal text-neutral-500">/ day</span></span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 bg-neutral-100 px-3 py-1.5 rounded-full">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Flexi-Rent</span>
                </div>
              </div>

              {/* HERO 3D PRODUCT CUTOUT (Repositioned to top-right overflow) */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 1.5, 0]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 6,
                  ease: "easeInOut"
                }}
                className="absolute -top-8 -right-4 sm:-right-8 w-[210px] sm:w-[250px] z-30 pointer-events-none"
              >
                <img
                  src="https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?auto=format&fit=crop&w=800&q=80"
                  alt="3D Pro Camera Kit"
                  className="w-full h-44 sm:h-52 object-cover rounded-[22px] shadow-[0_20px_35px_-8px_rgba(0,0,0,0.22)] border-4 border-white transform rotate-3"
                />
              </motion.div>

              {/* FLOATING CARD 2: Gaming VR (Shifted lower so it doesn't block Daily Rate) */}
              {/* FLOATING PRODUCT SHOWCASE CARD (DJI Mini Drone) */}
              <motion.div
                animate={{
                  y: [0, 8, 0],
                  rotate: [-4, -2, -4]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 5,
                  ease: "easeInOut"
                }}
                className="absolute -bottom-14  -left-10 sm:-left-20 z-40 bg-white/95 backdrop-blur-md p-3.5 rounded-[24px] shadow-2xl border border-neutral-200/90 w-52 sm:w-60 flex items-center gap-3.5"
              >
                {/* High Visibility Product Image */}
                <div className="w-17 h-17 rounded-xl bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200/60 p-1">
                  <img
                    src="https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=300&q=80"
                    alt="DJI Mini 3 Pro Drone Kit"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>

                {/* Product Details */}
                <div className="flex flex-col">
                  <span className="text-[9px] font-extrabold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full w-fit mb-1 border border-emerald-200/60">
                    DRONES
                  </span>
                  <p className="text-xs font-bold text-neutral-900 leading-tight">DJI Mini 3 Pro Kit</p>
                  <p className="text-[12px] font-black text-neutral-950 mt-0.5">
                    ₹999 <span className="font-semibold text-neutral-400 text-[10px]">/ day</span>
                  </p>
                </div>
              </motion.div>

              {/* FLOATING CARD 3: Camping Gear Badge */}
              <motion.div
                animate={{
                  y: [0, -8, 0],
                  rotate: [2, 0, 2]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 5.5,
                  ease: "easeInOut"
                }}
                className="absolute -top-10 -left-6 z-20 bg-white/90 backdrop-blur-md p-2.5 rounded-[20px] shadow-lg border border-neutral-200/80 flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="pr-2">
                  <p className="text-xs font-bold text-neutral-900">Outdoor & Camping</p>
                  <p className="text-[10px] text-neutral-500 font-medium">Tents from ₹499/day</p>
                </div>
              </motion.div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}