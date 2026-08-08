import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-dark-950 border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-lg font-bold text-white">Rental<span className="text-brand-400">Hub</span></span>
            </div>
            <p className="text-sm text-dark-400 leading-relaxed">Premium rental marketplace for electronics, furniture, sports gear and more.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm text-dark-400">
              <li><Link href="/products" className="hover:text-white transition-colors">Browse Products</Link></li>
              <li><Link href="/products?bestseller=true" className="hover:text-white transition-colors">Bestsellers</Link></li>
              <li><Link href="/bookings" className="hover:text-white transition-colors">My Bookings</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Categories</h4>
            <ul className="space-y-2.5 text-sm text-dark-400">
              <li><Link href="/products?category=Electronics" className="hover:text-white transition-colors">Electronics</Link></li>
              <li><Link href="/products?category=Furniture" className="hover:text-white transition-colors">Furniture</Link></li>
              <li><Link href="/products?category=Sports" className="hover:text-white transition-colors">Sports</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2.5 text-sm text-dark-400">
              <li><span className="hover:text-white transition-colors cursor-pointer">Help Center</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-dark-500">&copy; {new Date().getFullYear()} RentalHub. All rights reserved.</p>
          <p className="text-xs text-dark-600">Built with Next.js + TypeScript + Prisma</p>
        </div>
      </div>
    </footer>
  );
}
