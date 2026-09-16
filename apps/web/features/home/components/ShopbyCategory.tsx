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
  },
  {
    name: 'Home & Living',
    image: HomeLiving,
    slug: 'home-living',
  },
  {
    name: 'Beauty',
    image: Beauty,
    slug: 'beauty',
  },
  {
    name: 'Sports',
    image: Sports,
    slug: 'sports',
  },
  {
    name: 'Fashion',
    image: Fashion,
    slug: 'fashion',
  },
  {
    name: 'Books',
    image: Books,
    slug: 'books',
  },
  {
    name: 'Accessories',
    image: Accessories,
    slug: 'accessories',
  },
  {
    name: 'Wellness',
    image: Wellness,
    slug: 'wellness',
  },
  {
    name: 'Outdoor',
    image: Outdoor,
    slug: 'outdoor',
  },
  {
    name: 'Gifts',
    image: Gifts,
    slug: 'gifts',
  },
  {
    name: 'Office',
    image: Office,
    slug: 'office',
  },
  {
    name: 'Travel',
    image: Travel,
    slug: 'travel',
  },
];

export default function ShopbyCategory() {
  return (
    <section className="bg-background pt-3 pb-6 sm:pt-5 sm:pb-10 md:pt-6 md:pb-12">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-3 flex items-center justify-between sm:mb-6">
          <h2 className="text-lg font-semibold leading-snug tracking-tight text-text-primary sm:text-xl">
            Shop by category
          </h2>

          <Link
            href="/categories"
            className="flex min-h-9 shrink-0 items-center gap-1 rounded-md px-1 text-xs font-medium leading-normal text-text-secondary transition-opacity duration-150 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:min-h-11 sm:px-2 sm:text-sm"
          >
            <span>View all</span>
            <span aria-hidden="true" className="text-sm sm:text-base">
              →
            </span>
          </Link>
        </div>

        {/* Mobile category rail */}
        <div className="-mx-4 flex gap-2 overflow-x-auto overscroll-x-contain px-4 pb-1 scrollbar-none [-ms-overflow-style:none] sm:hidden [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="group w-24 min-w-18 shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-md border border-border-subtle bg-surface-subtle transition-transform duration-150 ease-out group-active:scale-95 motion-reduce:transition-none">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="70px"
                  className="object-cover"
                />
              </div>

              <p className="mt-1.5 line-clamp-2 min-h-7 text-center text-[10px] font-medium leading-tight text-text-primary">
                {category.name}
              </p>
            </Link>
          ))}
        </div>

        {/* Tablet and Desktop category grid */}
        <div className="hidden sm:grid sm:grid-cols-3 sm:gap-x-4 sm:gap-y-6 md:grid-cols-4 lg:grid-cols-6 lg:gap-x-4 lg:gap-y-6">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="group block min-w-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <div className="relative aspect-1.5/1 w-full overflow-hidden rounded-lg border border-border-subtle bg-surface-subtle transition-[border-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:border-border-strong group-hover:shadow-xs motion-reduce:transition-none">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="
                    (max-width: 767px) 30vw,
                    (max-width: 1023px) 23vw,
                    (max-width: 1279px) 16vw,
                    190px
                  "
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </div>

              <p className="mt-2 text-center text-sm font-medium leading-normal text-text-primary">
                {category.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
