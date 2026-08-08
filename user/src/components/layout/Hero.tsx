'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="relative w-full h-[450px] md:h-[550px] flex items-center justify-center overflow-hidden bg-app">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1589808383238-03487c0ff3ad?q=80&w=2070&auto=format&fit=crop)' }}
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-app via-app/80 to-transparent" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-app via-transparent to-transparent" />

      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
        <div className="flex-1">
          {/* Empty space for layout balance as seen in the image */}
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 flex flex-col items-center md:items-start text-center md:text-left pt-20 md:pt-0"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-bold text-white leading-tight tracking-tight mb-4">
            RENT THE ULTIMATE KITS
          </h1>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 mt-4">
            <span className="text-2xl font-semibold text-white">
              FROM $15/hr
            </span>
            <Link
              href="/quote"
              className="px-8 py-3.5 bg-brand-500 hover:bg-brand-400 text-black font-bold rounded-full transition-all duration-300 transform hover:scale-105"
            >
              GET INSTANT QUOTE
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Pagination dots indicator placeholder */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        <div className="w-2 h-2 rounded-full bg-brand-500" />
        <div className="w-2 h-2 rounded-full bg-white/30" />
        <div className="w-2 h-2 rounded-full bg-white/30" />
        <div className="w-2 h-2 rounded-full bg-white/30" />
      </div>
    </section>
  );
}
