import DealsSpotlight from '@/features/home/components/DealsSpotlight';
import Discovery from '@/features/home/components/Discovery';
import FeaturedBrands from '@/features/home/components/FeaturedBrands';
import Hero from '@/features/home/components/Hero';
import NewArrivals from '@/features/home/components/NewArrivals';
import NewsletterCTA from '@/features/home/components/NewsletterCTA';
import ShopbyCategory from '@/features/home/components/ShopbyCategory';
import WhyPerigee from '@/features/home/components/WhyPerigee';

export default function Home() {
  return (
    <>
      <Hero />
      <ShopbyCategory />
      <DealsSpotlight />
      <NewArrivals />
      <FeaturedBrands />
      <Discovery />
      <WhyPerigee />
      <NewsletterCTA />
    </>
  );
}
