'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

const slides = [
  {
    eyebrow: 'DEALS OF THE WEEK',
    title: 'Up to 40% Off',
    description: 'Selected products from independent brands.',
    primaryAction: 'Shop Deals',
    secondaryAction: 'Explore Offers',
    image: '/assets/hero/hero-1.png',
  },
  {
    eyebrow: 'NEW ARRIVALS',
    title: "Discover What's New",
    description: 'Fresh products from independent brands.',
    primaryAction: 'Shop New Arrivals',
    secondaryAction: 'Explore Brands',
    image: '/assets/hero/hero-1.png',
  },
  {
    eyebrow: 'PERIGEE DISCOVERY',
    title: 'Find Something Less Ordinary.',
    description: 'Thoughtfully selected products from independent brands worth discovering.',
    primaryAction: 'Explore Discovery',
    secondaryAction: 'Shop Collections',
    image: '/assets/hero/hero-1.png',
  },
];

const AUTO_SLIDE_TIME = 8000;

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

  // Keyboard navigation for assistive technologies and power users
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
      aria-label="Featured promotions"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="group/hero relative w-full max-w-7xl mx-auto overflow-hidden px-4 py-3"
    >
      {/* Viewport */}
      <div className="relative w-full overflow-hidden rounded-lg">
        {/* Animated track */}
        <div
          className="flex w-full transition-transform duration-300 ease-out"
          style={{ transform: `translate3d(-${current * 100}%, 0, 0)` }}
          aria-live="polite"
          aria-atomic="true"
        >
          {slides.map((slide, index) => (
            <article
              key={slide.eyebrow}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${slides.length}`}
              aria-hidden={current !== index}
              className="relative h-36 w-full flex-none overflow-hidden rounded-lg sm:h-105 sm:rounded-none lg:h-125"
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={index === 0}
                draggable={false}
                sizes="100vw"
                className="pointer-events-none object-cover object-right sm:object-center"
              />
              {/* Mobile overlay */}
              <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-[#f4efe7] via-[#f4efe7]/95 to-transparent sm:hidden" />
              {/* Desktop overlay */}
              <div className="pointer-events-none absolute inset-0 hidden bg-linear-to-r from-[#f4efe7]/80 via-[#f4efe7]/20 to-transparent sm:block" />
              {/* Mobile content */}
              <div className="pointer-events-none absolute inset-0 z-10 sm:hidden">
                <div className="flex h-full items-center">
                  <div className="w-[62%] px-3">
                    <p className="mb-1 text-[7px] font-bold tracking-wide text-text-primary">
                      {slide.eyebrow}
                    </p>

                    <h2 className="text-lg font-bold leading-tight tracking-tight text-text-primary">
                      {slide.title}
                    </h2>

                    <p className="mt-1 max-w-42 text-[7px] font-medium leading-tight text-text-secondary">
                      {slide.description}
                    </p>

                    <div className="pointer-events-auto mt-2 flex gap-1.5">
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        className="h-6 rounded px-2.5 py-1 text-[7px] font-bold shadow-xs"
                      >
                        {slide.primaryAction}
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-6 rounded border-transparent bg-secondary-accent px-2.5 py-1 text-[7px] font-bold text-on-accent shadow-xs hover:bg-secondary-accent-hover"
                      >
                        {slide.secondaryAction}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              {/* Desktop content */}
              <div className="pointer-events-none absolute inset-0 z-10 hidden sm:flex sm:items-center">
                <div className="w-full px-6 sm:px-10 md:w-1/2 md:px-8 lg:px-20">
                  <div className="max-w-70 sm:max-w-65 md:max-w-75 lg:max-w-125">
                    <p className="mb-2 text-xs font-bold tracking-wide text-text-primary lg:mb-3 lg:text-sm">
                      {slide.eyebrow}
                    </p>

                    <h1 className="text-2xl font-bold leading-tight tracking-tight text-text-primary md:text-3xl lg:text-5xl">
                      {slide.title}
                    </h1>

                    <p className="mt-3 max-w-xs text-xs font-medium leading-relaxed text-text-secondary lg:mt-4 lg:max-w-md lg:text-sm">
                      {slide.description}
                    </p>

                    <div className="pointer-events-auto mt-5 flex flex-wrap gap-2 lg:mt-6">
                      <Button
                        type="button"
                        variant="primary"
                        size="md"
                        className="px-4 py-2 text-xs font-semibold lg:px-5 lg:py-2.5 lg:text-sm"
                      >
                        {slide.primaryAction}
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        size="md"
                        className="border-transparent bg-secondary-accent px-4 py-2 text-xs font-semibold hover:bg-secondary-accent-hover lg:px-5 lg:py-2.5 lg:text-sm"
                      >
                        {slide.secondaryAction}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Accessible Arrow Controls */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={previousSlide}
          aria-label="Previous slide"
          className="absolute left-2 top-1/2 z-20 h-8 w-8 -translate-y-1/2 rounded-full p-0 bg-surface-raised/90 backdrop-blur-xs sm:left-4 sm:h-10 sm:w-10"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={nextSlide}
          aria-label="Next slide"
          className="absolute right-2 top-1/2 z-20 h-8 w-8 -translate-y-1/2 rounded-full p-0 bg-surface-raised/90 backdrop-blur-xs sm:right-4 sm:h-10 sm:w-10"
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
        </Button>
      </div>

      {/* Slide indicators */}
      <div className="flex items-center justify-center gap-1.5 py-2 sm:py-3">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            aria-current={current === index ? 'true' : undefined}
            onClick={() => setCurrent(index)}
            className={`h-1.5 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus ${
              current === index ? 'w-6 bg-accent' : 'w-1.5 bg-border-strong hover:bg-text-tertiary'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
