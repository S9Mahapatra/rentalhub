'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { Search, Calendar, Heart, ShoppingBag, User } from 'lucide-react';

const CATEGORIES = [
  { name: 'CAMERAS', href: '/products?category=cameras' },
  { name: 'LENSES', href: '/products?category=lenses' },
  { name: 'LIGHTING', href: '/products?category=lighting' },
  { name: 'AUDIO', href: '/products?category=audio' },
  { name: 'DRONES', href: '/products?category=drones' },
  { name: 'KITS', href: '/products?category=kits' },
  { name: 'ACCESSORIES', href: '/products?category=accessories' },
  { name: 'OFFERS', href: '/products?category=offers' },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <nav className="w-full bg-app text-dark-200 border-b border-white/5">
      {/* Announcement Bar */}
      <div className="w-full bg-black border-b border-white/5 py-1.5 flex justify-center items-center text-[11px] sm:text-xs tracking-wider">
        <span className="text-brand-500 mr-1">⚡</span>
        <span className="text-white/80">FAST TRACK RENTALS: Book gear instantly with zero deposits! ||</span>
        <Link href="/offers" className="text-brand-400 font-bold ml-1 hover:text-brand-300 transition-colors uppercase">
          EXPLORE NOW
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header Row */}
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <span className="text-3xl sm:text-4xl font-serif font-bold text-brand-500 tracking-tight">
              Arcadia
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full flex items-center">
              <div className="absolute left-4 text-dark-400 pointer-events-none">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Search 'Sony FX3', 'Lighting Kits', 'RED Komodo'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-search border-none rounded-l-full py-2.5 pl-12 pr-4 text-sm text-white placeholder-dark-400 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
              />
              <button 
                type="submit"
                className="bg-brand-500 hover:bg-brand-400 text-black font-semibold text-sm px-6 py-2.5 rounded-r-full transition-colors h-full"
              >
                Search
              </button>
            </div>
          </form>

          {/* Action Links */}
          <div className="flex items-center gap-2 sm:gap-6">
            <Link href="/bookings" className={`hidden lg:flex items-center gap-2 text-sm transition-colors ${pathname === '/bookings' ? 'text-brand-400' : 'text-dark-300 hover:text-white'}`}>
              <Calendar size={18} />
              <span>Bookings</span>
            </Link>

            <Link href="/wishlist" className={`hidden sm:flex items-center gap-2 text-sm transition-colors ${pathname === '/wishlist' ? 'text-brand-400' : 'text-dark-300 hover:text-white'}`}>
              <Heart size={18} />
              <span>Wishlist (2)</span>
            </Link>

            <Link href="/cart" className={`flex items-center gap-2 text-sm transition-colors ${pathname === '/cart' ? 'text-brand-400' : 'text-dark-300 hover:text-white'}`}>
              <ShoppingBag size={18} />
              <span>Rent Bag (0)</span>
            </Link>

            {/* User Menu */}
            {session?.user ? (
              <div className="relative ml-2">
                <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-black font-semibold text-sm">
                    {session.user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-card border border-white/10 rounded-xl shadow-2xl py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-white/5">
                          <p className="text-sm font-semibold text-white">{session.user.name}</p>
                          <p className="text-xs text-dark-400 mt-0.5 truncate">{session.user.email}</p>
                        </div>
                        <Link href="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-dark-300 hover:text-white hover:bg-white/5 transition-colors">
                          My Profile
                        </Link>
                        <Link href="/bookings" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-dark-300 hover:text-white hover:bg-white/5 transition-colors">
                          My Bookings
                        </Link>
                        <button onClick={() => { signOut(); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors">
                          Sign Out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/auth/login" className="ml-2 flex items-center justify-center w-8 h-8 rounded-full bg-search text-dark-300 hover:text-white hover:bg-white/10 transition-colors">
                <User size={18} />
              </Link>
            )}
          </div>
        </div>

        {/* Category Nav Row */}
        <div className="hidden md:flex items-center justify-center gap-8 py-3 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <Link 
              key={cat.name} 
              href={cat.href}
              className="text-xs font-semibold tracking-widest text-dark-200 hover:text-brand-400 transition-colors whitespace-nowrap"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
