'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, User, Menu, X, Store, HelpCircle, PackageCheck } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartCount = 2; // Dynamic cart state hook

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200/80 shadow-2xs">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        
        {/* BRAND LOGO */}
        <Link href="/" className="flex flex-col">
          <span className="text-xl font-black tracking-tight text-neutral-950 uppercase leading-none">
            AERO RENT
          </span>
          <span className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase mt-0.5">
            RENTAL MARKETPLACE
          </span>
        </Link>

        {/* NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            href="/products" 
            className="text-xs font-bold text-neutral-700 hover:text-neutral-950 transition-colors uppercase tracking-wider"
          >
            Catalog
          </Link>
          <Link 
            href="/stores" 
            className="text-xs font-bold text-neutral-700 hover:text-neutral-950 transition-colors uppercase tracking-wider flex items-center gap-1.5"
          >
            <Store className="w-3.5 h-3.5 text-neutral-500" />
            <span>Store Pickup</span>
          </Link>
          <Link 
            href="/how-it-works" 
            className="text-xs font-bold text-neutral-700 hover:text-neutral-950 transition-colors uppercase tracking-wider flex items-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5 text-neutral-500" />
            <span>How It Works</span>
          </Link>
          <Link 
            href="/orders" 
            className="text-xs font-bold text-neutral-700 hover:text-neutral-950 transition-colors uppercase tracking-wider flex items-center gap-1.5"
          >
            <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>My Rentals</span>
          </Link>
        </nav>

        {/* USER ACTIONS */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/profile"
            className="flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-all border border-neutral-200/80"
          >
            <User className="w-4 h-4 text-neutral-700" />
            <span className="hidden sm:inline">Account</span>
          </Link>

          <Link
            href="/cart"
            className="flex items-center gap-2.5 px-5 py-2.5 bg-neutral-950 hover:bg-neutral-850 text-white rounded-full text-xs font-bold transition-all shadow-sm"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span>Rental Bag</span>
            {cartCount > 0 && (
              <span className="bg-emerald-400 text-neutral-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ml-0.5">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full hover:bg-neutral-100 text-neutral-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-neutral-200 px-6 py-6 flex flex-col gap-4 shadow-xl">
          <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-neutral-800">
            Catalog
          </Link>
          <Link href="/stores" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-neutral-800">
            Store Pickup Locations
          </Link>
          <Link href="/how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-neutral-800">
            How Renting Works
          </Link>
          <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-emerald-600">
            My Active Rentals
          </Link>
        </div>
      )}
    </header>
  );
}