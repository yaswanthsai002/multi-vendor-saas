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
  /*
   * Current slide:
   *
   * 0 = Slide 1
   * 1 = Slide 2
   * 2 = Slide 3
   */
  const [current, setCurrent] = useState(0);

  /*
   * Drag position while swiping.
   */
  const [dragX, setDragX] = useState(0);

  /*
   * Whether the user is currently dragging.
   */
  const [dragging, setDragging] = useState(false);

  /*
   * Whether the slide movement should animate.
   */
  const [animate, setAnimate] = useState(true);

  /*
   * Starting pointer position.
   */
  const startX = useRef(0);

  /*
   * -----------------------------------------
   * GO TO NEXT SLIDE
   * -----------------------------------------
   */
  const nextSlide = () => {
    setAnimate(true);
    setDragX(0);

    setCurrent((prev) => {
      /*
       * If we're on the last slide,
       * go directly back to the first slide.
       */
      if (prev === slides.length - 1) {
        return 0;
      }

      return prev + 1;
    });
  };

  /*
   * -----------------------------------------
   * GO TO PREVIOUS SLIDE
   * -----------------------------------------
   */
  const previousSlide = () => {
    setAnimate(true);
    setDragX(0);

    setCurrent((prev) => {
      /*
       * If we're on the first slide,
       * go directly to the last slide.
       */
      if (prev === 0) {
        return slides.length - 1;
      }

      return prev - 1;
    });
  };

  /*
   * -----------------------------------------
   * AUTOMATIC SLIDE
   * -----------------------------------------
   *
   * Every 15 seconds:
   *
   * 1 → 2 → 3 → 1 → 2 → 3 ...
   */
  useEffect(() => {
    /*
     * Don't run the timer while the user
     * is actively swiping.
     */
    if (dragging) {
      return;
    }

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
    /*
     * Only respond to the primary mouse button.
     */
    if (e.button !== 0) {
      return;
    }

    startX.current = e.clientX;

    setDragging(true);

    /*
     * Disable transition while following
     * the user's finger.
     */
    setAnimate(false);

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  /*
   * -----------------------------------------
   * POINTER MOVE
   * -----------------------------------------
   */
  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging) {
      return;
    }

    const distance = e.clientX - startX.current;

    /*
     * Slight resistance.
     */
    setDragX(distance * 0.85);
  };

  /*
   * -----------------------------------------
   * POINTER UP
   * -----------------------------------------
   */
  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging) {
      return;
    }

    const distance = dragX;
    const threshold = 60;

    setDragging(false);

    /*
     * Release pointer capture.
     */
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    /*
     * -----------------------------------------
     * SWIPE LEFT
     * -----------------------------------------
     */
    if (distance < -threshold) {
      setAnimate(true);
      setDragX(0);

      setCurrent((prev) => {
        /*
         * LAST → FIRST
         */
        if (prev === slides.length - 1) {
          return 0;
        }

        return prev + 1;
      });

      return;
    }

    /*
     * -----------------------------------------
     * SWIPE RIGHT
     * -----------------------------------------
     */
    if (distance > threshold) {
      setAnimate(true);
      setDragX(0);

      setCurrent((prev) => {
        /*
         * FIRST → LAST
         */
        if (prev === 0) {
          return slides.length - 1;
        }

        return prev - 1;
      });

      return;
    }

    /*
     * -----------------------------------------
     * NOT ENOUGH MOVEMENT
     * -----------------------------------------
     *
     * Return to the current slide.
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
      "
    >
      {/* ====================================== */}
      {/* VIEWPORT */}
      {/* ====================================== */}

      <div
        className="
          relative
          w-full
          overflow-hidden
          touch-pan-y
          select-none
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
                  duration-[500ms]
                  ease-[cubic-bezier(0.22,0.8,0.2,1)]
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
                h-[360px]
                w-screen
                flex-none
                overflow-hidden

                sm:h-[420px]

                lg:h-[500px]
              "
            >
              {/* ============================== */}
              {/* IMAGE */}
              {/* ============================== */}

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
                  object-left

                  sm:object-center
                "
              />

              {/* ============================== */}
              {/* MOBILE OVERLAY */}
              {/* ============================== */}

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  bg-gradient-to-r
                  from-[#f4efe7]/95
                  via-[#f4efe7]/75
                  to-transparent

                  sm:hidden
                "
              />

              {/* ============================== */}
              {/* DESKTOP OVERLAY */}
              {/* ============================== */}

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

              {/* ============================== */}
              {/* CONTENT */}
              {/* ============================== */}

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  z-10
                "
              >
                <div className="flex h-full items-center">
                  <div
                    className="
                      w-full
                      px-6

                      sm:px-12

                      md:px-16

                      lg:px-20
                    "
                  >
                    <div
                      className="
                        max-w-[280px]

                        sm:max-w-[440px]

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

                          sm:mb-3
                          sm:text-[12px]

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

                          sm:text-[46px]

                          lg:text-[58px]
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

                          sm:mt-4
                          sm:max-w-[400px]
                          sm:text-[13px]

                          lg:text-[14px]
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

                          sm:mt-6
                          sm:gap-2.5
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
                            cursor-pointer
                            rounded-[6px]
                            bg-[#d76542]
                            px-4
                            py-2.5
                            text-[11px]
                            font-bold
                            text-white
                            shadow-sm

                            transition-all
                            duration-200

                            hover:-translate-y-0.5
                            hover:bg-[#c95636]
                            hover:shadow-md

                            active:scale-[0.98]

                            sm:px-5
                            sm:text-[12px]
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
                            cursor-pointer
                            rounded-[6px]
                            bg-[#557792]
                            px-4
                            py-2.5
                            text-[11px]
                            font-bold
                            text-white
                            shadow-sm

                            transition-all
                            duration-200

                            hover:-translate-y-0.5
                            hover:bg-[#496a83]
                            hover:shadow-md

                            active:scale-[0.98]

                            sm:px-5
                            sm:text-[12px]
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
      </div>

      {/* ====================================== */}
      {/* INDICATORS */}
      {/* ====================================== */}

      <div
        className="
          flex
          items-center
          justify-center
          gap-1.5
          bg-[#eef1f5]
          py-3

          dark:bg-[#0A0D14]
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
              h-[5px]
              rounded-full
              transition-all
              duration-200

              ${
                current === index
                  ? `
                    w-6
                    bg-[#667585]
                    dark:bg-[#E66A45]
                  `
                  : `
                    w-[5px]
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
