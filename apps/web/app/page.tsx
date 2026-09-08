import Discovery from '@/features/home/components/Discovery';
import FeaturedBrands from '@/features/home/components/FeaturedBrands';
import Hero from '@/features/home/components/Hero';
import NewArrivals from '@/features/home/components/NewArrivals';
import ShopbyCategory from '@/features/home/components/ShopbyCategory';
// import TopPicks from '@/features/home/components/TopPicks';
import WhyPerigee from '@/features/home/components/WhyPerigee';

export default function Home() {
  return (
    <>
      <Hero />
      <ShopbyCategory />
      <NewArrivals />
      <FeaturedBrands />
      {/* <TopPicks /> */}
      <Discovery />
      <WhyPerigee />
    </>
  );
}
