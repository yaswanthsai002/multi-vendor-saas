'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type PointerEvent } from 'react';

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

const AUTO_SLIDE_TIME = 15000;

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [animate, setAnimate] = useState(true);

  const startX = useRef(0);

  /*
   * -----------------------------------------
   * NEXT
   * -----------------------------------------
   */
  const nextSlide = () => {
    setAnimate(true);
    setDragX(0);

    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  /*
   * -----------------------------------------
   * PREVIOUS
   * -----------------------------------------
   */
  const previousSlide = () => {
    setAnimate(true);
    setDragX(0);

    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  /*
   * -----------------------------------------
   * AUTO PLAY
   * -----------------------------------------
   *
   * Every 15 seconds.
   *
   * The timer resets whenever:
   * - slide changes
   * - user finishes a swipe
   */
  useEffect(() => {
    if (dragging) return;

    const timer = window.setTimeout(() => {
      nextSlide();
    }, AUTO_SLIDE_TIME);

    return () => {
      window.clearTimeout(timer);
    };
  }, [current, dragging]);

  /*
   * -----------------------------------------
   * POINTER DOWN
   * -----------------------------------------
   */
  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;

    startX.current = e.clientX;

    setDragging(true);
    setAnimate(false);
    setDragX(0);

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  /*
   * -----------------------------------------
   * POINTER MOVE
   * -----------------------------------------
   */
  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;

    const distance = e.clientX - startX.current;

    setDragX(distance * 0.85);
  };

  /*
   * -----------------------------------------
   * POINTER UP
   * -----------------------------------------
   */
  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;

    const distance = dragX;
    const threshold = 50;

    setDragging(false);

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    /*
     * Swipe left = next.
     */
    if (distance < -threshold) {
      setAnimate(true);
      setDragX(0);

      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));

      return;
    }

    /*
     * Swipe right = previous.
     */
    if (distance > threshold) {
      setAnimate(true);
      setDragX(0);

      setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

      return;
    }

    /*
     * Not enough movement.
     * Snap back.
     */
    setAnimate(true);
    setDragX(0);
  };

  /*
   * -----------------------------------------
   * POINTER CANCEL
   * -----------------------------------------
   */
  const handlePointerCancel = (e: PointerEvent<HTMLDivElement>) => {
    setDragging(false);
    setAnimate(true);
    setDragX(0);

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <section
      className="
        w-full
        overflow-hidden
        bg-white
        dark:bg-[#0A0D14]

        px-4
        py-3

        sm:px-0
        sm:py-0
      "
    >
      {/* ====================================== */}
      {/* HERO VIEWPORT */}
      {/* ====================================== */}

      <div
        className="
          relative
          w-full
          overflow-hidden
          rounded-[10px]
          touch-pan-y
          select-none

          sm:rounded-none
        "
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {/* ==================================== */}
        {/* TRACK */}
        {/* ==================================== */}

        <div
          className={`
            flex
            w-max

            ${
              animate
                ? `
                  transition-transform
                  duration-[450ms]
                  ease-out
                `
                : ''
            }
          `}
          style={{
            transform: `
              translate3d(
                calc(
                  -${current * 100}vw
                  + ${dragX}px
                ),
                0,
                0
              )
            `,
          }}
        >
          {slides.map((slide, index) => (
            <article
              key={slide.eyebrow}
              className="
                relative
                h-[140px]
                w-screen
                flex-none
                overflow-hidden
                rounded-[10px]

                sm:h-[420px]
                sm:rounded-none

                lg:h-[500px]
              "
            >
              {/* ================================= */}
              {/* IMAGE */}
              {/* ================================= */}

              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={index === 0}
                draggable={false}
                sizes="100vw"
                className="
                  pointer-events-none
                  object-cover
                  object-right

                  sm:object-center
                "
              />

              {/* ================================= */}
              {/* MOBILE BACKGROUND OVERLAY */}
              {/* ================================= */}

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  bg-gradient-to-r
                  from-[#f4efe7]
                  from-[0%]
                  via-[#f4efe7]/95
                  via-[48%]
                  to-[#f4efe7]/0
                  to-[100%]

                  sm:hidden
                "
              />

              {/* ================================= */}
              {/* DESKTOP OVERLAY */}
              {/* ================================= */}

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  hidden
                  bg-gradient-to-r
                  from-[#f4efe7]/80
                  via-[#f4efe7]/20
                  to-transparent

                  sm:block
                "
              />

              {/* ================================= */}
              {/* MOBILE CONTENT */}
              {/* ================================= */}

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  z-10

                  sm:hidden
                "
              >
                <div className="flex h-full items-center">
                  <div className="w-[62%] px-3">
                    {/* EYEBROW */}

                    <p
                      className="
                        mb-1
                        text-[7px]
                        font-bold
                        tracking-[0.3px]
                        text-[#202936]
                      "
                    >
                      {slide.eyebrow}
                    </p>

                    {/* TITLE */}

                    <h2
                      className="
                        text-[19px]
                        font-bold
                        leading-[1.02]
                        tracking-[-0.7px]
                        text-[#111827]
                      "
                    >
                      {slide.title}
                    </h2>

                    {/* DESCRIPTION */}

                    <p
                      className="
                        mt-1
                        max-w-[170px]
                        text-[7px]
                        font-medium
                        leading-[1.25]
                        text-[#374151]
                      "
                    >
                      {slide.description}
                    </p>

                    {/* BUTTONS */}

                    <div
                      className="
                        pointer-events-auto
                        mt-2
                        flex
                        gap-1.5
                      "
                    >
                      <button
                        type="button"
                        onPointerDown={(e) => {
                          e.stopPropagation();
                        }}
                        onPointerUp={(e) => {
                          e.stopPropagation();
                        }}
                        className="
                          rounded-[4px]
                          bg-[#d76542]
                          px-2.5
                          py-1.5
                          text-[7px]
                          font-bold
                          text-white
                          shadow-sm
                        "
                      >
                        {slide.primaryAction}
                      </button>

                      <button
                        type="button"
                        onPointerDown={(e) => {
                          e.stopPropagation();
                        }}
                        onPointerUp={(e) => {
                          e.stopPropagation();
                        }}
                        className="
                          rounded-[4px]
                          bg-[#557792]
                          px-2.5
                          py-1.5
                          text-[7px]
                          font-bold
                          text-white
                          shadow-sm
                        "
                      >
                        {slide.secondaryAction}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================================= */}
              {/* DESKTOP CONTENT */}
              {/* ================================= */}

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  z-10
                  hidden

                  sm:block
                "
              >
                <div className="flex h-full items-center">
                  <div
                    className="
                      w-full
                      px-6

                      sm:px-10

                      md:w-[48%]
                      md:px-8

                      lg:w-full
                      lg:px-20
                    "
                  >
                    <div
                      className="
                        max-w-[280px]

                        sm:max-w-[260px]

                        md:max-w-[300px]

                        lg:max-w-[500px]
                      "
                    >
                      {/* EYEBROW */}

                      <p
                        className="
                          mb-2
                          text-[10px]
                          font-bold
                          tracking-[0.4px]
                          text-[#202936]

                          sm:mb-2
                          sm:text-[10px]

                          md:mb-2
                          md:text-[10px]

                          lg:mb-3
                          lg:text-[13px]
                        "
                      >
                        {slide.eyebrow}
                      </p>

                      {/* TITLE */}

                      <h1
                        className="
                          text-[34px]
                          font-bold
                          leading-[1.02]
                          tracking-[-1.5px]
                          text-[#111827]

                          sm:text-[30px]
                          sm:tracking-[-1px]

                          md:text-[30px]
                          md:leading-[1.05]
                          md:tracking-[-1px]

                          lg:text-[58px]
                          lg:leading-[1.02]
                          lg:tracking-[-1.8px]
                        "
                      >
                        {slide.title}
                      </h1>

                      {/* DESCRIPTION */}

                      <p
                        className="
                          mt-3
                          max-w-[290px]
                          text-[12px]
                          font-medium
                          leading-[1.45]
                          text-[#374151]

                          sm:mt-3
                          sm:max-w-[250px]
                          sm:text-[11px]

                          md:mt-3
                          md:max-w-[260px]
                          md:text-[11px]
                          md:leading-[1.4]

                          lg:mt-4
                          lg:max-w-[400px]
                          lg:text-[14px]
                          lg:leading-[1.45]
                        "
                      >
                        {slide.description}
                      </p>

                      {/* BUTTONS */}

                      <div
                        className="
                          pointer-events-auto
                          mt-5
                          flex
                          flex-wrap
                          gap-2

                          sm:mt-5

                          md:mt-5

                          lg:mt-6
                        "
                      >
                        <button
                          type="button"
                          onPointerDown={(e) => {
                            e.stopPropagation();
                          }}
                          className="
                            rounded-[6px]
                            bg-[#d76542]
                            px-4
                            py-2.5
                            text-[11px]
                            font-bold
                            text-white

                            sm:px-4
                            sm:py-2
                            sm:text-[10px]

                            md:px-4
                            md:py-2
                            md:text-[10px]

                            lg:px-5
                            lg:py-2.5
                            lg:text-[12px]
                          "
                        >
                          {slide.primaryAction}
                        </button>

                        <button
                          type="button"
                          onPointerDown={(e) => {
                            e.stopPropagation();
                          }}
                          className="
                            rounded-[6px]
                            bg-[#557792]
                            px-4
                            py-2.5
                            text-[11px]
                            font-bold
                            text-white

                            sm:px-4
                            sm:py-2
                            sm:text-[10px]

                            md:px-4
                            md:py-2
                            md:text-[10px]

                            lg:px-5
                            lg:py-2.5
                            lg:text-[12px]
                          "
                        >
                          {slide.secondaryAction}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* ====================================== */}
        {/* MOBILE ARROWS */}
        {/* ====================================== */}

        {/* <button
          type="button"
          aria-label="Previous slide"
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
            previousSlide();
          }}
          className="
            absolute
            left-1
            top-1/2
            z-20
            flex
            h-7
            w-7
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            bg-white/70
            text-[16px]
            text-[#374151]
            backdrop-blur-sm

            sm:hidden
          "
        >
          ‹
        </button>

        <button
          type="button"
          aria-label="Next slide"
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          className="
            absolute
            right-1
            top-1/2
            z-20
            flex
            h-7
            w-7
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            bg-white/70
            text-[16px]
            text-[#374151]
            backdrop-blur-sm

            sm:hidden
          "
        >
          ›
        </button> */}
      </div>

      {/* ====================================== */}
      {/* INDICATORS */}
      {/* ====================================== */}

      <div
        className="
          flex
          items-center
          justify-center
          gap-1
          py-2

          sm:py-3
        "
      >
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => {
              setAnimate(true);
              setDragX(0);
              setCurrent(index);
            }}
            className={`
              h-[4px]
              rounded-full
              transition-all
              duration-200

              ${
                current === index
                  ? `
                    w-5
                    bg-[#667585]
                    dark:bg-[#E66A45]
                  `
                  : `
                    w-[4px]
                    bg-[#c6ccd3]
                    dark:bg-[#343B49]
                  `
              }
            `}
          />
        ))}
      </div>
    </section>
  );
}
