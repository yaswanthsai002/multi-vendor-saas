'use client';

import Image from 'next/image';
import Link from 'next/link';

const discoveryImages = {
  main: '/images/discovery/discovery-main.jpg',
  top: '/images/discovery/discovery-top.jpg',
  bottom: '/images/discovery/discovery-bottom.jpg',
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
        <div
          className="
            grid
            grid-cols-1
            gap-6

            md:grid-cols-[1.35fr_0.58fr_1fr]
            md:items-center
            md:gap-5

            lg:gap-6
          "
        >
          {/* ========================================= */}
          {/* Main Image */}
          {/* ========================================= */}

          <Link
            href="/discovery"
            className="
              group
              relative
              block
              aspect-[1.4/1]
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
              sizes="
                (max-width: 767px) 100vw,
                (max-width: 1023px) 55vw,
                52vw
              "
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

          {/* ========================================= */}
          {/* Secondary Images */}
          {/* ========================================= */}

          <div
            className="
              grid
              grid-cols-2
              gap-3

              md:grid-cols-1
              md:grid-rows-2
              md:gap-4
            "
          >
            {/* Top Image */}
            <Link
              href="/discovery"
              className="
                group
                relative
                aspect-[1.35/1]
                overflow-hidden
                rounded-xl

                md:aspect-auto
                md:h-full

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
                sizes="
                  (max-width: 767px) 50vw,
                  (max-width: 1023px) 25vw,
                  20vw
                "
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

            {/* Bottom Image */}
            <Link
              href="/discovery"
              className="
                group
                relative
                aspect-[1.35/1]
                overflow-hidden
                rounded-xl

                md:aspect-auto
                md:h-full

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
                sizes="
                  (max-width: 767px) 50vw,
                  (max-width: 1023px) 25vw,
                  20vw
                "
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

          {/* ========================================= */}
          {/* Discovery Content */}
          {/* ========================================= */}

          <div
            className="
              flex
              flex-col
              items-start

              md:pl-2
              lg:pl-4
            "
          >
            {/* Eyebrow */}
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

            {/* Heading */}
            <h2
              className="
                mt-2
                max-w-[480px]

                text-[32px]
                font-bold
                leading-[1.08]
                tracking-[-0.6px]
                text-[var(--text-primary)]

                sm:text-[36px]

                lg:text-[40px]
                lg:tracking-[-0.8px]
              "
            >
              Find something
              <br />
              less ordinary.
            </h2>

            {/* Description */}
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

            {/* CTA */}
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
