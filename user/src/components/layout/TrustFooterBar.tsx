'use client';

import Link from 'next/link';
import { 
  ShieldCheck, 
  Store, 
  Mail, 
  Phone, 
  ArrowUpRight, 
  PackageCheck, 
  FileText, 
  Clock 
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full max-w-[1400px] mx-auto px-4 pb-10 pt-4">
      {/* Light Soft-Gray Footer Container */}
      <div className="bg-[#F4F4F6] border border-neutral-200/80 rounded-[36px] p-8 sm:p-12 text-neutral-800 shadow-2xs">
        
        {/* TOP SECTION: Branding, Navigation & Portal Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-neutral-200/80">

          {/* COLUMN 1 & 2: Brand & Trust Value Proposition */}
          <div className="lg:col-span-2 flex flex-col items-start pr-0 lg:pr-6">
            <Link href="/" className="flex flex-col mb-4">
              <span className="text-xl font-black tracking-tight text-neutral-950 uppercase leading-none">
                AERO RENT
              </span>
              <span className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase mt-1">
                PREMIUM RENTAL MARKETPLACE
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-sm mb-6">
              Access cinema gear, drones, camping equipment, and workstations on daily rates with transparent security deposits and doorstep delivery[cite: 11, 12].
            </p>

            {/* Trust Badge Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white text-neutral-800 text-xs font-semibold shadow-2xs border border-neutral-200/80">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Security Deposit Protection Covered[cite: 11, 12]</span>
            </div>
          </div>

          {/* COLUMN 3: Categories Catalog */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-extrabold text-neutral-950 uppercase tracking-wider mb-1">
              Rental Catalog
            </p>
            <Link href="/products?category=cameras" className="text-xs text-neutral-600 hover:text-neutral-950 transition-colors">
              Cameras & Optics
            </Link>
            <Link href="/products?category=drones" className="text-xs text-neutral-600 hover:text-neutral-950 transition-colors">
              Drones & Aerial
            </Link>
            <Link href="/products?category=outdoor" className="text-xs text-neutral-600 hover:text-neutral-950 transition-colors">
              Camping & Outdoor Gear
            </Link>
            <Link href="/products?category=gaming" className="text-xs text-neutral-600 hover:text-neutral-950 transition-colors">
              Gaming Consoles & VR
            </Link>
            <Link href="/products?category=workstations" className="text-xs text-neutral-600 hover:text-neutral-950 transition-colors">
              Laptops & Workstations
            </Link>
          </div>

          {/* COLUMN 4: User Portal & Orders */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-extrabold text-neutral-950 uppercase tracking-wider mb-1">
              My Rental Portal
            </p>
            <Link href="/orders" className="text-xs text-neutral-600 hover:text-neutral-950 transition-colors flex items-center gap-1.5">
              <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Active Orders & Tracking[cite: 11, 12]</span>
            </Link>
            <Link href="/orders" className="text-xs text-neutral-600 hover:text-neutral-950 transition-colors flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-neutral-500" />
              <span>Download Order Invoices[cite: 11, 12]</span>
            </Link>
            <Link href="/stores" className="text-xs text-neutral-600 hover:text-neutral-950 transition-colors flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-neutral-500" />
              <span>Physical Store Locations[cite: 11, 12]</span>
            </Link>
            <Link href="/profile" className="text-xs text-neutral-600 hover:text-neutral-950 transition-colors">
              Account & Saved Addresses[cite: 11, 12]
            </Link>
          </div>

          {/* COLUMN 5: Information & Policies */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-extrabold text-neutral-950 uppercase tracking-wider mb-1">
              Rental Policies
            </p>
            <Link href="/how-it-works" className="text-xs text-neutral-600 hover:text-neutral-950 transition-colors">
              How Renting Works[cite: 11, 12]
            </Link>
            <Link href="/how-it-works#deposit" className="text-xs text-neutral-600 hover:text-neutral-950 transition-colors">
              Deposit & Refund Policy[cite: 11, 12]
            </Link>
            <Link href="/how-it-works#late-fees" className="text-xs text-neutral-600 hover:text-neutral-950 transition-colors flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-neutral-500" />
              <span>Late Fee Rules[cite: 11, 12]</span>
            </Link>
            <a href="mailto:support@aerorent.com" className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1 mt-1">
              <Mail className="w-3.5 h-3.5" />
              <span>support@aerorent.com</span>
            </a>
          </div>

        </div>

        {/* BOTTOM SECTION: Copyright & Legal Badges */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 font-medium">
          <p>© {new Date().getFullYear()} AeroRent Marketplace Inc. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-neutral-700 font-semibold">Store Pickup & Dispatch Operational</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}