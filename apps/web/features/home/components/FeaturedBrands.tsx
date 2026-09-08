'use client';

import Image from 'next/image';
import Link from 'next/link';

const brands = [
  {
    name: 'Aura',
    description: 'Thoughtful home goods',
    logo: '/assets/brands/aura.svg',
  },
  {
    name: 'Sage',
    description: 'Thoughtful home goods',
    logo: '/assets/brands/sage.svg',
  },
  {
    name: 'Verto',
    description: 'Thoughtful home goods',
    logo: '/assets/brands/verto.svg',
  },
  {
    name: 'Aura',
    description: 'Thoughtful home goods',
    logo: '/assets/brands/aura.svg',
  },
  {
    name: 'Sage',
    description: 'Thoughtful home goods',
    logo: '/assets/brands/sage-mark.svg',
  },
  {
    name: 'Sage Dann',
    description: 'Thoughtful home goods',
    logo: '/assets/brands/sage-dann.svg',
  },
];

export default function FeaturedBrands() {
  return (
    <section
      className="
        w-full
        bg-[var(--background)]
        py-6
        sm:py-8
        md:py-10
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
        <div className="mb-5 flex items-end justify-between sm:mb-6">
          <div>
            <h2
              className="
                text-[20px]
                font-semibold
                leading-[1.3]
                tracking-[-0.15px]
                text-[var(--text-primary)]
                sm:text-[22px]
              "
            >
              Featured Brands
            </h2>

            <p
              className="
                mt-0.5
                text-[13px]
                font-normal
                leading-[1.45]
                text-[var(--text-secondary)]
              "
            >
              Discover independent brands
            </p>
          </div>

          <Link
            href="/brands"
            className="
              flex
              min-h-[44px]
              items-center
              gap-1
              rounded-md
              px-1
              text-[13px]
              font-medium
              text-[var(--text-primary)]

              transition-opacity
              duration-[120ms]
              hover:opacity-60

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

        {/* Brand Grid */}
        <div
          className="
            grid
            grid-cols-2
            gap-3

            sm:grid-cols-3
            sm:gap-4

            md:grid-cols-4

            lg:grid-cols-6
          "
        >
          {brands.map((brand, index) => (
            <Link
              key={`${brand.name}-${index}`}
              href={`/brands/${brand.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="
                group
                min-w-0
                rounded-lg

                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[var(--border-focus)]
                focus-visible:ring-offset-2
                focus-visible:ring-offset-[var(--background)]
              "
            >
              <article
                className="
                  relative
                  flex
                  min-h-[160px]
                  flex-col
                  overflow-hidden
                  rounded-lg

                  border
                  border-[var(--border-default)]

                  bg-[var(--surface-raised)]

                  px-4
                  pb-4
                  pt-5

                  transition-[transform,box-shadow,border-color]
                  duration-[240ms]
                  ease-[cubic-bezier(0.2,0.8,0.2,1)]
                  will-change-transform

                  group-hover:-translate-y-1
                  group-hover:border-[var(--border-strong)]
                  group-hover:shadow-[0_8px_24px_rgba(30,35,45,0.10)]

                  dark:group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.24)]

                  motion-reduce:transition-none
                  motion-reduce:group-hover:translate-y-0
                "
              >
                {/* Logo */}
                <div
                  className="
                    flex
                    h-[72px]
                    w-full
                    items-center
                    justify-center
                  "
                >
                  <Image
                    src={brand.logo}
                    alt={`${brand.name} logo`}
                    width={150}
                    height={60}
                    className="
                      max-h-[58px]
                      w-auto
                      max-w-[85%]
                      object-contain

                      transition-transform
                      duration-[240ms]
                      ease-[cubic-bezier(0.2,0.8,0.2,1)]

                      group-hover:scale-[1.02]

                      motion-reduce:transition-none
                      motion-reduce:group-hover:scale-100
                    "
                  />
                </div>

                {/* Brand Info */}
                <div className="mt-auto pt-3">
                  <h3
                    className="
                      truncate
                      text-[15px]
                      font-semibold
                      leading-[1.35]
                      text-[var(--text-primary)]
                    "
                  >
                    {brand.name}
                  </h3>

                  <p
                    className="
                      mt-1
                      truncate
                      text-[13px]
                      font-normal
                      leading-[1.45]
                      text-[var(--text-secondary)]
                    "
                  >
                    {brand.description}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
