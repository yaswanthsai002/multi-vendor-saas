import DealsSpotlight from '@/features/home/components/DealsSpotlight';
import FeaturedBrands from '@/features/home/components/FeaturedBrands';
import Hero from '@/features/home/components/Hero';
import NewArrivals from '@/features/home/components/NewArrivals';
import ShopbyCategory from '@/features/home/components/ShopbyCategory';

export default function Home() {
  return (
    <>
      <Hero />
      <ShopbyCategory />
      <DealsSpotlight />
      <NewArrivals />
      <FeaturedBrands />
    </>
  );
}
