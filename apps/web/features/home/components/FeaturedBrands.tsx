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
    logo: '/assets/brands/sage.svg',
  },
  {
    name: 'Sage Dann',
    description: 'Thoughtful home goods',
    logo: '/assets/brands/verto.svg',
  },
];

export default function FeaturedBrands() {
  return (
    <section
      className="
        w-full
        bg-[var(--background)]

        py-5

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
        {/* ====================================== */}
        {/* HEADER */}
        {/* ====================================== */}

        <div
          className="
            mb-3
            flex
            items-end
            justify-between

            sm:mb-6
          "
        >
          <div className="min-w-0">
            <h2
              className="
                text-[17px]
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
                text-[10px]
                font-normal
                leading-[1.45]
                text-[var(--text-secondary)]

                sm:text-[13px]
              "
            >
              Discover independent brands
            </p>
          </div>

          <Link
            href="/brands"
            className="
              flex
              min-h-[36px]
              shrink-0
              items-center
              gap-1
              rounded-md
              px-1
              text-[11px]
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

              sm:min-h-[44px]
              sm:px-2
              sm:text-[13px]
            "
          >
            <span>View all</span>

            <span
              aria-hidden="true"
              className="
                text-[14px]

                sm:text-[16px]
              "
            >
              →
            </span>
          </Link>
        </div>

        {/* ====================================== */}
        {/* MOBILE BRAND RAIL */}
        {/* ====================================== */}

        <div
          className="
            -mx-4
            flex
            gap-2
            overflow-x-auto
            overscroll-x-contain
            px-4
            pb-1

            [scrollbar-width:none]
            [-ms-overflow-style:none]
            [&::-webkit-scrollbar]:hidden

            sm:hidden
          "
        >
          {brands.map((brand, index) => (
            <Link
              key={`${brand.name}-${index}`}
              href={`/brands/${brand.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="
                group
                w-[126px]
                min-w-[126px]
                shrink-0
                rounded-[8px]

                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[var(--border-focus)]
                focus-visible:ring-offset-2
                focus-visible:ring-offset-[var(--background)]
              "
            >
              <article
                className="
                  flex
                  h-[94px]
                  flex-col
                  overflow-hidden
                  rounded-[8px]

                  border
                  border-[var(--border-default)]

                  bg-[var(--surface-raised)]

                  px-3
                  py-2.5

                  transition-[transform,border-color]
                  duration-[180ms]
                  ease-out

                  group-active:scale-[0.98]

                  motion-reduce:transition-none
                "
              >
                {/* Logo */}

                <div
                  className="
                    flex
                    h-[42px]
                    w-full
                    items-center
                    justify-center
                  "
                >
                  <Image
                    src={brand.logo}
                    alt={`${brand.name} logo`}
                    width={110}
                    height={42}
                    className="
                      max-h-[34px]
                      w-auto
                      max-w-[90%]
                      object-contain
                      dark:brightness-0
                      dark:invert
                    "
                  />
                </div>

                {/* Brand info */}

                <div className="mt-auto min-w-0">
                  <h3
                    className="
                      truncate
                      text-[11px]
                      font-semibold
                      leading-[1.3]
                      text-[var(--text-primary)]
                    "
                  >
                    {brand.name}
                  </h3>

                  <p
                    className="
                      mt-0.5
                      truncate
                      text-[9px]
                      font-normal
                      leading-[1.3]
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

        {/* ====================================== */}
        {/* TABLET / DESKTOP GRID */}
        {/* ====================================== */}

        <div
          className="
            hidden

            sm:grid
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
                    h-[50px]
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

                      dark:brightness-0
                      dark:invert

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
