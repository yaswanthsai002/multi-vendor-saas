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
    <section
      className="
        w-full
        bg-white dark:bg-[#11161F]
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
        {/* =========================================================
            MOBILE
            Main image + content only
            Secondary images are completely hidden
        ========================================================= */}
        <div className="grid grid-cols-2 gap-4 md:hidden">
          {/* Main image */}
          <Link
            href="/discovery"
            className="
              group relative block
              aspect-[0.85/1]
              min-w-0
              overflow-hidden
              rounded-xl
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[var(--border-focus)]
              focus-visible:ring-offset-2
              focus-visible:ring-offset-[var(--background)]
            "
          >
            <Image
              src={discoveryImages.main}
              alt="Perigee discovery collection"
              fill
              priority
              sizes="50vw"
              className="
                object-cover
                transition-transform
                duration-[320ms]
                ease-[cubic-bezier(0.2,0.8,0.2,1)]
                group-hover:scale-[1.025]
                motion-reduce:transition-none
                motion-reduce:group-hover:scale-100
              "
            />
          </Link>

          {/* Content */}
          <div className="flex min-w-0 flex-col items-start justify-center">
            <p
              className="
                text-[10px]
                font-semibold
                leading-[1.4]
                tracking-[0.02em]
                text-[var(--text-primary)]
              "
            >
              PERIGEE DISCOVERY
            </p>

            <h2
              className="
                mt-2
                text-[24px]
                font-bold
                leading-[1.08]
                tracking-[-0.5px]
                text-[var(--text-primary)]
              "
            >
              Find something
              <br />
              less ordinary.
            </h2>

            <p
              className="
                mt-3
                text-[12px]
                leading-[1.5]
                text-[var(--text-secondary)]
              "
            >
              Thoughtfully selected products from independent brands worth discovering.
            </p>

            <Link
              href="/discovery"
              className="
                mt-4
                inline-flex
                min-h-[40px]
                items-center
                justify-center
                gap-1.5
                rounded-md
                bg-[var(--accent)]
                px-3.5
                text-[11px]
                font-medium
                text-[var(--on-accent)]
                transition-[background-color,transform]
                duration-[180ms]
                ease-[cubic-bezier(0.2,0.8,0.2,1)]
                hover:bg-[var(--accent-hover)]
                active:translate-y-px
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[var(--border-focus)]
                focus-visible:ring-offset-2
                focus-visible:ring-offset-[var(--background)]
                motion-reduce:transition-none
              "
            >
              <span>Explore Discovery</span>
              <span aria-hidden="true" className="text-[14px] leading-none">
                →
              </span>
            </Link>
          </div>
        </div>

        {/* =========================================================
            TABLET + DESKTOP
            Main image | 2 secondary images | content
        ========================================================= */}
        <div
          className="
            hidden
            md:grid
            md:grid-cols-[1.35fr_0.58fr_1fr]
            md:gap-5
            lg:gap-6
          "
        >
          {/* Main image */}
          <Link
            href="/discovery"
            className="
              group relative block
              aspect-[1.4/1]
              min-w-0
              overflow-hidden
              rounded-xl
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[var(--border-focus)]
              focus-visible:ring-offset-2
              focus-visible:ring-offset-[var(--background)]
            "
          >
            <Image
              src={discoveryImages.main}
              alt="Perigee discovery collection"
              fill
              priority
              sizes="(max-width: 1023px) 50vw, 52vw"
              className="
                object-cover
                transition-transform
                duration-[320ms]
                ease-[cubic-bezier(0.2,0.8,0.2,1)]
                group-hover:scale-[1.025]
                motion-reduce:transition-none
                motion-reduce:group-hover:scale-100
              "
            />
          </Link>

          {/* Secondary images */}
          <div
            className="
              grid
              min-w-0
              grid-cols-1
              grid-rows-2
              gap-4
            "
          >
            {/* Top image */}
            <Link
              href="/discovery"
              className="
                group relative
                min-h-0
                overflow-hidden
                rounded-xl
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[var(--border-focus)]
                focus-visible:ring-offset-2
                focus-visible:ring-offset-[var(--background)]
              "
            >
              <Image
                src={discoveryImages.top}
                alt="Featured Perigee discovery"
                fill
                sizes="(max-width: 1023px) 22vw, 20vw"
                className="
                  object-cover
                  transition-transform
                  duration-[320ms]
                  ease-[cubic-bezier(0.2,0.8,0.2,1)]
                  group-hover:scale-[1.025]
                  motion-reduce:transition-none
                  motion-reduce:group-hover:scale-100
                "
              />
            </Link>

            {/* Bottom image */}
            <Link
              href="/discovery"
              className="
                group relative
                min-h-0
                overflow-hidden
                rounded-xl
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[var(--border-focus)]
                focus-visible:ring-offset-2
                focus-visible:ring-offset-[var(--background)]
              "
            >
              <Image
                src={discoveryImages.bottom}
                alt="Featured independent brand"
                fill
                sizes="(max-width: 1023px) 22vw, 20vw"
                className="
                  object-cover
                  transition-transform
                  duration-[320ms]
                  ease-[cubic-bezier(0.2,0.8,0.2,1)]
                  group-hover:scale-[1.025]
                  motion-reduce:transition-none
                  motion-reduce:group-hover:scale-100
                "
              />
            </Link>
          </div>

          {/* Content */}
          <div
            className="
              flex
              min-w-0
              flex-col
              items-start
              justify-center
              md:pl-2
              lg:pl-4
            "
          >
            <p
              className="
                text-[12px]
                font-semibold
                leading-[1.4]
                tracking-[0.02em]
                text-[var(--text-primary)]
              "
            >
              PERIGEE DISCOVERY
            </p>

            <h2
              className="
                mt-2
                max-w-[480px]
                text-[32px]
                font-bold
                leading-[1.08]
                tracking-[-0.6px]
                text-[var(--text-primary)]
                lg:text-[40px]
                lg:tracking-[-0.8px]
              "
            >
              Find something
              <br />
              less ordinary.
            </h2>

            <p
              className="
                mt-4
                max-w-[500px]
                text-[16px]
                font-normal
                leading-[1.5]
                text-[var(--text-secondary)]
              "
            >
              Thoughtfully selected products from independent brands worth discovering.
            </p>

            <Link
              href="/discovery"
              className="
                mt-6
                inline-flex
                min-h-[48px]
                items-center
                justify-center
                gap-2
                rounded-md
                bg-[var(--accent)]
                px-5
                text-[14px]
                font-medium
                leading-[1.4]
                text-[var(--on-accent)]
                transition-[background-color,transform]
                duration-[180ms]
                ease-[cubic-bezier(0.2,0.8,0.2,1)]
                hover:bg-[var(--accent-hover)]
                active:translate-y-px
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[var(--border-focus)]
                focus-visible:ring-offset-2
                focus-visible:ring-offset-[var(--background)]
                motion-reduce:transition-none
              "
            >
              <span>Explore Discovery</span>

              <span aria-hidden="true" className="text-[18px] leading-none">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
