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
    <section className="w-full bg-background py-5 sm:py-8 md:py-10">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-3 flex items-end justify-between sm:mb-6">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold leading-snug tracking-tight text-text-primary sm:text-2xl">
              Featured Brands
            </h2>
            <p className="mt-0.5 text-xs font-normal leading-normal text-text-secondary sm:text-sm">
              Discover independent brands
            </p>
          </div>

          <Link
            href="/brands"
            className="flex min-h-9 shrink-0 items-center gap-1 rounded-md px-1 text-xs font-medium text-text-primary transition-opacity duration-150 hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:min-h-11 sm:px-2 sm:text-sm"
          >
            <span>View all</span>
            <span aria-hidden="true" className="text-sm sm:text-base">
              →
            </span>
          </Link>
        </div>

        {/* Mobile horizontal brand rail */}
        <div className="-mx-4 flex gap-2 overflow-x-auto overscroll-x-contain px-4 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] sm:hidden [&::-webkit-scrollbar]:hidden">
          {brands.map((brand, index) => (
            <Link
              key={`${brand.name}-${index}`}
              href={`/brands/${brand.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="group w-32 min-w-32 shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <article className="flex h-24 flex-col overflow-hidden rounded-lg border border-border-default bg-surface-raised px-3 py-2.5 transition-[transform,border-color] duration-150 ease-out group-active:scale-95 motion-reduce:transition-none">
                <div className="flex h-11 w-full items-center justify-center">
                  <Image
                    src={brand.logo}
                    alt={`${brand.name} logo`}
                    width={110}
                    height={42}
                    className="max-h-8 w-auto max-w-[90%] object-contain dark:brightness-0 dark:invert"
                  />
                </div>

                <div className="mt-auto min-w-0">
                  <h3 className="truncate text-xs font-semibold leading-tight text-text-primary">
                    {brand.name}
                  </h3>
                  <p className="mt-0.5 truncate text-[10px] font-normal leading-tight text-text-secondary">
                    {brand.description}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* Tablet and Desktop brand grid */}
        <div className="hidden sm:grid sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">
          {brands.map((brand, index) => (
            <Link
              key={`${brand.name}-${index}`}
              href={`/brands/${brand.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="group min-w-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <article className="relative flex min-h-40 flex-col overflow-hidden rounded-lg border border-border-default bg-surface-raised px-4 pb-4 pt-5 transition-[box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:border-border-strong group-hover:shadow-md motion-reduce:transition-none">
                <div className="flex h-12 w-full items-center justify-center">
                  <Image
                    src={brand.logo}
                    alt={`${brand.name} logo`}
                    width={150}
                    height={60}
                    className="max-h-14 w-auto max-w-[85%] object-contain transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100 dark:brightness-0 dark:invert"
                  />
                </div>

                <div className="mt-auto pt-3">
                  <h3 className="truncate text-sm font-semibold leading-snug text-text-primary">
                    {brand.name}
                  </h3>
                  <p className="mt-1 truncate text-xs font-normal leading-normal text-text-secondary">
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
