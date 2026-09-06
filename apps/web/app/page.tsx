import CuratedNewFinds from '@/features/home/components/CuratedNewFinds';
import FeaturedPicks from '@/features/home/components/FeaturedPicks';
import Hero from '@/features/home/components/Hero';
import ProductUniverse from '@/features/home/components/ProductUniverse';
import TopPicks from '@/features/home/components/TopPicks';
import TrustedBrands from '@/features/home/components/TrustedBrands';
import WhyPerigee from '@/features/home/components/WhyPerigee';

export default function Home() {
  return (
    <>
      <Hero />
      <ProductUniverse />
      <CuratedNewFinds />
      <FeaturedPicks />
      <TopPicks />
      <TrustedBrands />
      <WhyPerigee />
    </>
  );
}
