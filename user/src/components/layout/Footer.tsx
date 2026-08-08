import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-app border-t border-white/5 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-dark-300">
          <Link href="/products" className="hover:text-white transition-colors">Browse Products</Link>
          <span className="text-dark-600">|</span>
          <Link href="/bookings" className="hover:text-white transition-colors">My Bookings</Link>
          <span className="text-dark-600">|</span>
          <Link href="/wishlist" className="hover:text-white transition-colors">Wishlist</Link>
          <span className="text-dark-600">|</span>
          <Link href="/profile" className="hover:text-white transition-colors">My Profile</Link>
          <span className="text-dark-600">|</span>
          <Link href="/cart" className="hover:text-white transition-colors">Rent Bag</Link>
          <span className="text-dark-600">|</span>
          <Link href="/auth/register" className="hover:text-white transition-colors">Join RentalHub</Link>
        </div>
      </div>
    </footer>
  );
}
