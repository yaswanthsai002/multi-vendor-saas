import CuratedNewFinds from './components/CuratedNewFinds';
import FeaturedPicks from './components/FeaturedPicks';
import Hero from './components/Hero';
import ProductUniverse from './components/ProductUniverse';
import TopPicks from './components/TopPicks';
import TrustedBrands from './components/TrustedBrands';
import WhyPerigee from './components/WhyPerigee';

export default function Home() {
  return (
    <main>
      <Hero />
      <ProductUniverse />
      <CuratedNewFinds />
      <FeaturedPicks />
      <TopPicks />
      <TrustedBrands />
      <WhyPerigee />
    </main>
  );
}
