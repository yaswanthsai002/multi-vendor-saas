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
    <section
      className="
        bg-[var(--background)]
        pt-4
        pb-8
        sm:pt-5
        sm:pb-10
        md:pt-6
        md:pb-12
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-[1280px]
          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* Header */}
        <div
          className="
            mb-5
            flex
            items-center
            justify-between
            sm:mb-6
          "
        >
          <h2
            className="
              text-[20px]
              font-semibold
              leading-[1.3]
              tracking-[-0.15px]
              text-[var(--text-primary)]
              md:text-[20px]
            "
          >
            Shop by category
          </h2>

          <Link
            href="/categories"
            className="
              flex
              min-h-[44px]
              items-center
              gap-1
              rounded-md
              px-2
              text-[14px]
              font-medium
              leading-[1.4]
              text-[var(--text-secondary)]
              transition-opacity
              duration-[120ms]
              hover:opacity-70
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[var(--border-focus)]
              focus-visible:ring-offset-2
              focus-visible:ring-offset-[var(--background)]
            "
          >
            <span>View all</span>
            <span aria-hidden="true" className="text-[16px]">
              →
            </span>
          </Link>
        </div>

        {/* Category Grid */}
        <div
          className="
            grid
            grid-cols-2
            gap-x-3
            gap-y-5

            sm:grid-cols-3
            sm:gap-x-4
            sm:gap-y-6

            md:grid-cols-4

            lg:grid-cols-6
            lg:gap-x-4
            lg:gap-y-6
          "
        >
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="
                group
                block
                min-w-0
                rounded-lg
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[var(--border-focus)]
                focus-visible:ring-offset-2
                focus-visible:ring-offset-[var(--background)]
              "
            >
              {/* Image */}
              <div
                className="
                  relative
                  aspect-[1.5/1]
                  w-full
                  overflow-hidden
                  rounded-lg
                  border
                  border-[var(--border-subtle)]
                  bg-[var(--surface-subtle)]
                  transition-transform
                  duration-[120ms]
                  ease-[cubic-bezier(0.2,0,0,1)]
                  group-hover:scale-[1.01]
                  motion-reduce:transition-none
                  motion-reduce:group-hover:scale-100
                "
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="
                    (max-width: 639px) 45vw,
                    (max-width: 767px) 30vw,
                    (max-width: 1023px) 23vw,
                    (max-width: 1279px) 16vw,
                    190px
                  "
                  className="
                    object-cover
                  "
                />
              </div>

              {/* Category Name */}
              <p
                className="
                  mt-2
                  text-center
                  text-[14px]
                  font-medium
                  leading-[1.4]
                  text-[var(--text-primary)]
                "
              >
                {category.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
