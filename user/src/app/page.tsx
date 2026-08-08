import Hero from '@/components/layout/Hero';
import CategoryNav from '@/components/product/CategoryNav';
import Bestsellers from '@/components/product/Bestsellers';

export default function Home() {
  return (
    <>
      <Hero />
      <CategoryNav />
      <Bestsellers />
    </>
  );
}
