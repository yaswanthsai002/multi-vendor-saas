import Image from 'next/image';
import Link from 'next/link';

import Electronics from '@/assets/images/Home/category/01_electronics.png';
import HomeLiving from '@/assets/images/Home/category/02_home_living.png';
import Beauty from '@/assets/images/Home/category/03_beauty.png';
import Sports from '@/assets/images/Home/category/04_sports.png';
import Fashion from '@/assets/images/Home/category/05_fashion.png';
import Books from '@/assets/images/Home/category/06_books.png';
import Accessories from '@/assets/images/Home/category/07_accessories.png';
import Wellness from '@/assets/images/Home/category/08_wellness.png';
import Outdoor from '@/assets/images/Home/category/09_outdoor.png';
import Gifts from '@/assets/images/Home/category/10_gifts.png';
import Office from '@/assets/images/Home/category/11_office.png';
import Travel from '@/assets/images/Home/category/12_travel.png';

const categories = [
  {
    name: 'Electronics',
    image: Electronics,
    slug: 'electronics',
    deal: 'Up to 50% Off',
  },
  {
    name: 'Home & Living',
    image: HomeLiving,
    slug: 'home-living',
    deal: 'From ₹499',
  },
  {
    name: 'Beauty',
    image: Beauty,
    slug: 'beauty',
    deal: 'Min. 30% Off',
  },
  {
    name: 'Sports',
    image: Sports,
    slug: 'sports',
    deal: 'Starting ₹299',
  },
  {
    name: 'Fashion',
    image: Fashion,
    slug: 'fashion',
    deal: '40% - 70% Off',
  },
  {
    name: 'Books',
    image: Books,
    slug: 'books',
    deal: 'From ₹199',
  },
  {
    name: 'Accessories',
    image: Accessories,
    slug: 'accessories',
    deal: 'Min. 35% Off',
  },
  {
    name: 'Wellness',
    image: Wellness,
    slug: 'wellness',
    deal: 'Up to 40% Off',
  },
  {
    name: 'Outdoor',
    image: Outdoor,
    slug: 'outdoor',
    deal: 'Special Offers',
  },
  {
    name: 'Gifts',
    image: Gifts,
    slug: 'gifts',
    deal: 'Under ₹999',
  },
  {
    name: 'Office',
    image: Office,
    slug: 'office',
    deal: 'Up to 45% Off',
  },
  {
    name: 'Travel',
    image: Travel,
    slug: 'travel',
    deal: 'Flat 30% Off',
  },
];

export default function ShopbyCategory() {
  return (
    <section className="bg-background pt-4 pb-8 sm:pt-6 sm:pb-12">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-4 flex items-end justify-between sm:mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl">
              Shop by Category
            </h2>
            <p className="mt-0.5 text-xs text-text-secondary sm:text-sm">
              Explore thousands of products with verified seller guarantees
            </p>
          </div>

          <Link
            href="/categories"
            className="group flex min-h-9 shrink-0 items-center gap-1 rounded-md px-1 text-xs font-semibold text-accent transition-opacity hover:opacity-80 sm:text-sm"
          >
            <span>View All Categories</span>
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </div>

        {/* Mobile category rail */}
        <div className="-mx-4 flex gap-3 overflow-x-auto overscroll-x-contain px-4 pb-2 scrollbar-none sm:hidden">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="group w-28 min-w-28 shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border-default/80 bg-surface-subtle shadow-2xs transition-transform duration-200 group-hover:scale-102 group-active:scale-95">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
                <span className="absolute bottom-1.5 left-1.5 rounded-sm bg-neutral-900/85 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-2xs">
                  {category.deal}
                </span>
              </div>

              <p className="mt-1.5 truncate text-center text-xs font-bold text-text-primary">
                {category.name}
              </p>
            </Link>
          ))}
        </div>

        {/* Tablet and Desktop category grid */}
        <div className="hidden sm:grid sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="group block min-w-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
            >
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-border-default/70 bg-surface-subtle shadow-2xs transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:border-border-strong group-hover:shadow-md">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 767px) 33vw, (max-width: 1023px) 25vw, 190px"
                  className="object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-106"
                />
                {/* Deal Tag */}
                <div className="absolute top-2 left-2">
                  <span className="rounded-md bg-neutral-900/85 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs backdrop-blur-xs">
                    {category.deal}
                  </span>
                </div>
              </div>

              <p className="mt-2 text-center text-sm font-bold text-text-primary transition-colors group-hover:text-accent">
                {category.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
