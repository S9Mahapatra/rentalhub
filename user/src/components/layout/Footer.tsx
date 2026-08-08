'use client';

import Link from 'next/link';
import { 
  ShieldCheck, 
  Store, 
  Mail, 
  Clock, 
  PackageCheck, 
  FileText, 
  MapPin,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-neutral-950 text-neutral-400 border-t border-neutral-800/80 mt-20">
      
      {/* TOP BANNER: Full-Width Deposit Trust Strip */}
      <div className="w-full bg-neutral-900/90 border-b border-neutral-800/80 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
          <div className="flex items-center gap-2 text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>100% Refundable Security Deposit:</strong> Returned instantly upon timely item inspection.</span>
          </div>

          <div className="flex items-center gap-6 text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              Store Collection Available
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Automated Late Fee Rules
            </span>
          </div>
        </div>
      </div>

      {/* MAIN FOOTER NAVIGATION */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          
          {/* COLUMN 1: Brand & Tagline */}
          <div className="lg:col-span-2 flex flex-col items-start pr-0 lg:pr-8">
            <Link href="/" className="flex flex-col mb-4">
              <span className="text-2xl font-black tracking-tight text-white uppercase leading-none">
                AERO RENT
              </span>
              <span className="text-[10px] font-extrabold text-emerald-400 tracking-widest uppercase mt-1">
                PREMIUM RENTAL MARKETPLACE
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-md mb-6">
              Rent high-end camera gear, drones, workstations, and outdoor equipment on flexible daily or weekly terms. Fully insured with transparent security deposit workflows.
            </p>

            {/* Newsletter / Updates Signup */}
            <div className="w-full max-w-sm flex items-center bg-neutral-900 border border-neutral-800 rounded-full p-1.5">
              <input
                type="email"
                placeholder="Enter your email for gear updates..."
                className="w-full bg-transparent px-3 text-xs text-white placeholder-neutral-500 focus:outline-none"
              />
              <button 
                type="button"
                className="bg-white hover:bg-neutral-200 text-neutral-950 px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1"
              >
                <span>Subscribe</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* COLUMN 2: Rental Catalog */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-black text-white uppercase tracking-wider mb-1">
              Rental Catalog
            </p>
            <Link href="/products?category=cameras" className="text-xs text-neutral-400 hover:text-white transition-colors">
              Cameras & Optics
            </Link>
            <Link href="/products?category=drones" className="text-xs text-neutral-400 hover:text-white transition-colors">
              Drones & Aerial
            </Link>
            <Link href="/products?category=outdoor" className="text-xs text-neutral-400 hover:text-white transition-colors">
              Camping & Trekking Gear
            </Link>
            <Link href="/products?category=gaming" className="text-xs text-neutral-400 hover:text-white transition-colors">
              Gaming Consoles & VR
            </Link>
            <Link href="/products?category=workstations" className="text-xs text-neutral-400 hover:text-white transition-colors">
              Laptops & Workstations
            </Link>
          </div>

          {/* COLUMN 3: User Portal & Orders */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-black text-white uppercase tracking-wider mb-1">
              My Account & Portal
            </p>
            <Link href="/orders" className="text-xs text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5">
              <PackageCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Active Orders & Rentals</span>
            </Link>
            <Link href="/orders" className="text-xs text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-neutral-400" />
              <span>Download Tax Invoices</span>
            </Link>
            <Link href="/stores" className="text-xs text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
              <span>Pickup Store Locations</span>
            </Link>
            <Link href="/profile" className="text-xs text-neutral-400 hover:text-white transition-colors">
              Saved Delivery Addresses
            </Link>
            <Link href="/cart" className="text-xs text-neutral-400 hover:text-white transition-colors">
              Rental Bag & Checkout
            </Link>
          </div>

          {/* COLUMN 4: Policy & Support */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-black text-white uppercase tracking-wider mb-1">
              Rental Policies
            </p>
            <Link href="/how-it-works" className="text-xs text-neutral-400 hover:text-white transition-colors">
              How Renting Works
            </Link>
            <Link href="/how-it-works#deposit-policy" className="text-xs text-neutral-400 hover:text-white transition-colors flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
              <span>Security Deposit Rules</span>
            </Link>
            <Link href="/how-it-works#late-returns" className="text-xs text-neutral-400 hover:text-white transition-colors">
              Late Return & Penalty Calculation
            </Link>
            <a href="mailto:support@aerorent.com" className="text-xs text-emerald-400 hover:underline flex items-center gap-1.5 mt-2 font-medium">
              <Mail className="w-3.5 h-3.5" />
              <span>support@aerorent.com</span>
            </a>
          </div>

        </div>
      </div>

      {/* BOTTOM LEGAL BAR */}
      <div className="w-full bg-neutral-900/50 border-t border-neutral-900 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} AeroRent Systems Inc. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-neutral-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-neutral-300 transition-colors">
              Terms of Service
            </Link>
            <Link href="/how-it-works" className="hover:text-neutral-300 transition-colors">
              Return Inspection Guidelines
            </Link>
          </div>
        </div>
      </div>

    </footer>
  );
}