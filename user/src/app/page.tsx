import Hero from '@/components/layout/Hero';
import SearchAndFilterBar from '@/components/layout/SearchAndFilterBar';
import Bestsellers from '@/components/layout/Bestsellers'; // Rendered as "Most Rented Gear"
import BentoCategoryGrid from '@/components/layout/BentoCategoryGrid';
import RentalFeatures from '@/components/layout/RentalFeatures';
import RentalClubBanner from '@/components/layout/RentalClubBanner';
import TrustFooterBar from '@/components/layout/TrustFooterBar';

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-neutral-900 space-y-12 pb-12">
      {/* 1. Hero Banner */}
      <Hero />

      {/* 2. Date & Rental Search */}
      <SearchAndFilterBar />

      {/* 3. Most Rented Equipment */}
      <Bestsellers />

      {/* 4. Bento Category Explorer */}
      <BentoCategoryGrid />

      {/* 5. Why Rent With Us */}
      <RentalFeatures />

      {/* 6. VIP Rental Pass Banner */}
      {/* <RentalClubBanner /> */}

      {/* 7. Rental Guarantee Trust Bar */}
      {/* <TrustFooterBar /> */}
    </main>
  );
}