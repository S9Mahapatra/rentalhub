import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-app border-t border-white/5 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-dark-300">
          <Link href="/policy" className="hover:text-white transition-colors">Rental Policy</Link>
          <span className="text-dark-600">|</span>
          <Link href="/protection" className="hover:text-white transition-colors">Damage Protection</Link>
          <span className="text-dark-600">|</span>
          <Link href="/locations" className="hover:text-white transition-colors">Pickup Locations</Link>
          <span className="text-dark-600">|</span>
          <Link href="/support" className="hover:text-white transition-colors">Support</Link>
          <span className="text-dark-600">|</span>
          <Link href="/host" className="hover:text-white transition-colors">Host Gear</Link>
        </div>
      </div>
    </footer>
  );
}
