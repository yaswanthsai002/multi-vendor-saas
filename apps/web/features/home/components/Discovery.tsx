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
    <section className="w-full bg-surface-raised py-6 dark:bg-surface sm:py-8 md:py-10">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Mobile: Single featured image and marketing callout */}
        <div className="grid grid-cols-2 gap-4 md:hidden">
          <Link
            href="/discovery"
            className="group relative block aspect-[0.85/1] min-w-0 overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Image
              src={discoveryImages.main}
              alt="Perigee discovery collection"
              fill
              priority
              sizes="50vw"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          </Link>

          <div className="flex min-w-0 flex-col items-start justify-center">
            <p className="text-xs font-semibold tracking-wide text-text-primary">
              PERIGEE DISCOVERY
            </p>

            <h2 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-text-primary">
              Find something
              <br />
              less ordinary.
            </h2>

            <p className="mt-3 text-xs leading-relaxed text-text-secondary">
              Thoughtfully selected products from independent brands worth discovering.
            </p>

            <Link
              href="/discovery"
              className="mt-4 inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md bg-accent px-3.5 text-xs font-medium text-on-accent transition-colors duration-150 ease-out hover:bg-accent-hover active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
            >
              <span>Explore Discovery</span>
              <span aria-hidden="true" className="text-sm leading-none">
                →
              </span>
            </Link>
          </div>
        </div>

        {/* Tablet and Desktop: Featured grid layout */}
        <div className="hidden md:grid md:grid-cols-[1.35fr_0.58fr_1fr] md:gap-5 lg:gap-6">
          {/* Main spotlight image */}
          <Link
            href="/discovery"
            className="group relative block aspect-[1.4/1] min-w-0 overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Image
              src={discoveryImages.main}
              alt="Perigee discovery collection"
              fill
              priority
              sizes="(max-width: 1023px) 50vw, 52vw"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          </Link>

          {/* Secondary feature cards */}
          <div className="grid min-w-0 grid-cols-1 grid-rows-2 gap-4">
            <Link
              href="/discovery"
              className="group relative min-h-0 overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Image
                src={discoveryImages.top}
                alt="Featured Perigee discovery"
                fill
                sizes="(max-width: 1023px) 22vw, 20vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            </Link>

            <Link
              href="/discovery"
              className="group relative min-h-0 overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Image
                src={discoveryImages.bottom}
                alt="Featured independent brand"
                fill
                sizes="(max-width: 1023px) 22vw, 20vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            </Link>
          </div>

          {/* Discovery value proposition & call to action */}
          <div className="flex min-w-0 flex-col items-start justify-center md:pl-2 lg:pl-4">
            <p className="text-xs font-semibold tracking-wide text-text-primary">
              PERIGEE DISCOVERY
            </p>

            <h2 className="mt-2 max-w-lg text-3xl font-bold leading-tight tracking-tight text-text-primary lg:text-4xl">
              Find something
              <br />
              less ordinary.
            </h2>

            <p className="mt-4 max-w-lg text-base font-normal leading-relaxed text-text-secondary">
              Thoughtfully selected products from independent brands worth discovering.
            </p>

            <Link
              href="/discovery"
              className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-accent px-5 text-sm font-medium leading-normal text-on-accent transition-colors duration-150 ease-out hover:bg-accent-hover active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
            >
              <span>Explore Discovery</span>
              <span aria-hidden="true" className="text-lg leading-none">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
