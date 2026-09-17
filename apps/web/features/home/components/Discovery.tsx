'use client';

import Image from 'next/image';
import Link from 'next/link';

import mainImage from '@/assets/images/Home/discovery1.png';
import topRight from '@/assets/images/Home/discovery2.png';
import bottomRight from '@/assets/images/Home/discovery3.png';

const discoveryImages = {
  main: mainImage,
  top: topRight,
  bottom: bottomRight,
};

export default function Discovery() {
  return (
    <section className="w-full bg-background py-6 sm:py-10 md:py-12">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Mobile Layout */}
        <div className="grid grid-cols-2 gap-4 md:hidden">
          <Link
            href="/discovery"
            className="group relative block aspect-[0.85/1] min-w-0 overflow-hidden rounded-2xl border border-border-default/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          >
            <Image
              src={discoveryImages.main}
              alt="Perigee featured marketplace showcase"
              fill
              priority
              sizes="50vw"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform group-hover:scale-105"
            />
          </Link>

          <div className="flex min-w-0 flex-col items-start justify-center">
            <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-accent uppercase">
              PERIGEE SPOTLIGHT
            </span>

            <h2 className="mt-2 text-xl font-bold leading-tight tracking-tight text-text-primary">
              Quality You Can Feel, Prices You Will Love.
            </h2>

            <p className="mt-2 text-xs leading-relaxed text-text-secondary">
              Direct from verified sellers and authorized makers. No middlemen markups.
            </p>

            <Link
              href="/discovery"
              className="mt-3 inline-flex min-h-9 items-center justify-center gap-1 rounded-md bg-accent px-3.5 text-xs font-semibold text-on-accent transition-colors hover:bg-accent-hover"
            >
              <span>Explore Deals</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* Tablet and Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-[1.3fr_0.6fr_1.1fr] md:gap-5 lg:gap-6">
          {/* Main spotlight image */}
          <Link
            href="/discovery"
            className="group relative block aspect-[1.35/1] min-w-0 overflow-hidden rounded-2xl border border-border-default/80 shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          >
            <Image
              src={discoveryImages.main}
              alt="Perigee featured lifestyle collection"
              fill
              priority
              sizes="(max-width: 1023px) 50vw, 52vw"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform group-hover:scale-105"
            />
          </Link>

          {/* Secondary feature cards */}
          <div className="grid min-w-0 grid-cols-1 grid-rows-2 gap-4">
            <Link
              href="/discovery"
              className="group relative min-h-0 overflow-hidden rounded-xl border border-border-default/80 shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
            >
              <Image
                src={discoveryImages.top}
                alt="Featured modern lifestyle product"
                fill
                sizes="(max-width: 1023px) 22vw, 20vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform group-hover:scale-105"
              />
            </Link>

            <Link
              href="/discovery"
              className="group relative min-h-0 overflow-hidden rounded-xl border border-border-default/80 shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
            >
              <Image
                src={discoveryImages.bottom}
                alt="Featured daily essentials"
                fill
                sizes="(max-width: 1023px) 22vw, 20vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform group-hover:scale-105"
              />
            </Link>
          </div>

          {/* Proposition callout */}
          <div className="flex min-w-0 flex-col items-start justify-center md:pl-2 lg:pl-6">
            <span className="rounded-md bg-accent/10 px-2.5 py-1 text-xs font-bold tracking-wider text-accent uppercase">
              PERIGEE SPOTLIGHT
            </span>

            <h2 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight text-text-primary lg:text-3xl">
              Quality You Can Feel,
              <br />
              Prices You Will Love.
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              Shop directly from verified manufacturers and trusted multi-vendor stores nationwide.
              Enjoy transparent pricing, escrow buyer protection, and doorstep delivery.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <Link
                href="/discovery"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-accent px-5 text-xs font-bold text-on-accent transition-colors hover:bg-accent-hover sm:text-sm"
              >
                <span>Shop Featured Collections</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
