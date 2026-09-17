'use client';

import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

interface DealSlide {
  id: string;
  badge: string;
  badgeVariant: 'amber' | 'accent' | 'success';
  title: string;
  description: string;
  startingPrice: string;
  originalPrice: string;
  discount: string;
  primaryAction: string;
  primaryHref: string;
  secondaryAction: string;
  secondaryHref: string;
  image: string;
  imageAlt: string;
}

const slides: DealSlide[] = [
  {
    id: 'electronics',
    badge: 'MEGA ELECTRONICS SALE • UP TO 50% OFF',
    badgeVariant: 'accent',
    title: 'Flagship Electronics & Smart Tech',
    description:
      'Ultra-thin laptops, noise-cancelling audio & smartphones direct from top verified vendors.',
    startingPrice: '₹1,499',
    originalPrice: '₹2,999',
    discount: 'Min. 40% Off',
    primaryAction: 'Shop Electronics Deals',
    primaryHref: '/category/electronics',
    secondaryAction: 'Explore All Offers',
    secondaryHref: '/deals',
    image: '/assets/hero/hero-electronics-studio.jpg',
    imageAlt:
      'Sleek silver laptop, wireless headphones, smartphone and mouse on light oak studio desk',
  },
  {
    id: 'fashion',
    badge: 'BIG FASHION CARNIVAL • 40% - 70% OFF',
    badgeVariant: 'amber',
    title: 'Trending Styles & Wardrobe Essentials',
    description:
      'Streetwear, casuals, footwear & accessories across thousands of verified vendor stores.',
    startingPrice: '₹499',
    originalPrice: '₹1,299',
    discount: 'Up to 70% Off',
    primaryAction: 'Explore Fashion Deals',
    primaryHref: '/category/fashion',
    secondaryAction: 'View Lookbook',
    secondaryHref: '/deals',
    image: '/assets/hero/hero-fashion-studio.jpg',
    imageAlt: 'Fashion models holding shopping bags with trendy streetwear',
  },
  {
    id: 'kitchen',
    badge: 'HOME & KITCHEN SALE • UP TO 60% OFF',
    badgeVariant: 'success',
    title: 'Smart Living & Kitchen Upgrades',
    description:
      'Digital air fryers, espresso machines & cookware direct from authorized manufacturers.',
    startingPrice: '₹899',
    originalPrice: '₹1,999',
    discount: 'Up to 60% Off',
    primaryAction: 'Claim Kitchen Offers',
    primaryHref: '/category/home-living',
    secondaryAction: 'Shop Cookware',
    secondaryHref: '/deals',
    image: '/assets/hero/hero-kitchen-studio.jpg',
    imageAlt:
      'Modern digital air fryer, stainless espresso machine and glass blender on marble counter',
  },
];

const AUTO_SLIDE_TIME = 7000;

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, []);

  const previousSlide = useCallback(() => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, []);

  // Pause auto-advance on user hover/focus per WCAG 2.2.2
  useEffect(() => {
    if (isPaused) return;

    const timer = window.setTimeout(nextSlide, AUTO_SLIDE_TIME);
    return () => window.clearTimeout(timer);
  }, [current, isPaused, nextSlide]);

  // Keyboard navigation for assistive technologies
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      previousSlide();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSlide();
    }
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Promotional deals carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="group/hero relative mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 lg:px-8"
    >
      {/* Outer container providing positioning boundary for external navigation buttons */}
      <div className="relative w-full">
        {/* Viewport Card */}
        <div className="relative h-90 w-full overflow-hidden rounded-2xl border border-border-default/70 bg-surface-subtle shadow-xs dark:border-border-strong/40 sm:h-100 lg:h-115">
          {slides.map((slide, index) => {
            const isActive = current === index;
            return (
              <article
                key={slide.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${slides.length}: ${slide.title}`}
                aria-hidden={!isActive}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  isActive ? 'z-10 opacity-100' : 'pointer-events-none z-0 opacity-0'
                }`}
              >
                {/* Commercial Studio Photography */}
                <Image
                  src={slide.image}
                  alt={slide.imageAlt}
                  fill
                  priority={index === 0}
                  draggable={false}
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  className="pointer-events-none object-cover object-right sm:object-center"
                />

                {/* Content Box (Locked to dark typography so it NEVER washes out in dark mode) */}
                <div className="pointer-events-none absolute inset-0 z-10 flex items-end sm:items-center">
                  <div className="w-full px-5 pb-6 sm:w-3/5 sm:px-10 sm:pb-0 md:w-1/2 lg:px-14">
                    <div className="max-w-lg">
                      {/* Deal Badge */}
                      <div className="mb-2 flex items-center gap-1.5 sm:mb-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-on-accent shadow-xs sm:text-xs">
                          <Sparkles className="h-3 w-3" aria-hidden="true" />
                          {slide.badge}
                        </span>
                      </div>

                      {/* Punchy Retail Headline */}
                      <h1 className="text-xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl lg:text-4xl lg:leading-tight">
                        {slide.title}
                      </h1>

                      {/* Subtitle */}
                      <p className="mt-1.5 line-clamp-2 text-xs font-medium text-neutral-700 sm:mt-2.5 sm:line-clamp-none sm:text-sm lg:text-base">
                        {slide.description}
                      </p>

                      {/* Pricing with Strikeoff in Indian Rupees */}
                      <div className="mt-3 flex items-baseline gap-2 sm:mt-4 sm:gap-3">
                        <span className="text-lg font-black text-neutral-900 sm:text-2xl">
                          {slide.startingPrice}
                        </span>
                        <span className="text-xs font-medium text-neutral-500 line-through sm:text-sm">
                          {slide.originalPrice}
                        </span>
                        <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 sm:text-xs">
                          {slide.discount}
                        </span>
                      </div>

                      {/* Interactive Real Action Buttons */}
                      <div className="pointer-events-auto mt-4 flex flex-wrap items-center gap-2 sm:mt-5 sm:gap-3">
                        <Link
                          href={slide.primaryHref}
                          className="inline-flex h-9 items-center justify-center rounded-md bg-accent px-4 text-xs font-semibold text-on-accent shadow-sm transition-colors hover:bg-accent-hover active:bg-accent-active sm:h-10 sm:px-5 sm:text-sm"
                        >
                          {slide.primaryAction} →
                        </Link>

                        <Link
                          href={slide.secondaryHref}
                          className="inline-flex h-9 items-center justify-center rounded-md border border-neutral-300 bg-white/90 px-4 text-xs font-semibold text-neutral-900 shadow-sm backdrop-blur-xs transition-colors hover:bg-white sm:h-10 sm:px-5 sm:text-sm"
                        >
                          {slide.secondaryAction}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Carousel Navigation Buttons - Positioned Outside the Viewport Card */}
        <button
          type="button"
          onClick={previousSlide}
          aria-label="Previous slide"
          className="absolute -left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border-default bg-surface-raised text-text-primary shadow-md backdrop-blur-xs transition-all hover:scale-110 hover:border-border-strong hover:bg-surface-hover active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus sm:-left-4 sm:h-10 sm:w-10 lg:-left-5 lg:h-11 lg:w-11"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next slide"
          className="absolute -right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border-default bg-surface-raised text-text-primary shadow-md backdrop-blur-xs transition-all hover:scale-110 hover:border-border-strong hover:bg-surface-hover active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus sm:-right-4 sm:h-10 sm:w-10 lg:-right-5 lg:h-11 lg:w-11"
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="flex items-center justify-center gap-1.5 py-3">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`Go to slide ${index + 1}: ${slide.title}`}
            aria-current={current === index ? 'true' : undefined}
            onClick={() => setCurrent(index)}
            className={`h-2 cursor-pointer rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus ${
              current === index ? 'w-7 bg-accent' : 'w-2 bg-border-strong hover:bg-text-tertiary'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
