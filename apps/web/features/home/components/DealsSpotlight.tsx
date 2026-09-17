'use client';

import { Clock, Flame, ShoppingCart, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const flashDeals = [
  {
    id: 'deal-1',
    name: 'Wireless Noise-Cancelling Pro Headphones',
    seller: 'TechPulse',
    sellerRating: '4.9 ★',
    price: '₹2,499',
    oldPrice: '₹4,999',
    discount: '-50%',
    rating: 4.8,
    reviews: 340,
    stockLeft: 4,
    image: '/assets/products/product2.jpg',
  },
  {
    id: 'deal-2',
    name: 'Smart Touchscreen Digital Air Fryer (4.5L)',
    seller: 'Apex Living',
    sellerRating: '4.8 ★',
    price: '₹3,299',
    oldPrice: '₹5,999',
    discount: '-45%',
    rating: 4.9,
    reviews: 512,
    stockLeft: 7,
    image: '/assets/products/product.png',
  },
  {
    id: 'deal-3',
    name: 'Full-Grain Leather Everyday Carry Backpack',
    seller: 'UrbanVogue',
    sellerRating: '4.7 ★',
    price: '₹1,899',
    oldPrice: '₹3,499',
    discount: '-46%',
    rating: 4.7,
    reviews: 189,
    stockLeft: 3,
    image: '/assets/products/product1.jpg',
  },
  {
    id: 'deal-4',
    name: 'Wireless Ergonomic Mechanical Studio Keyboard',
    seller: 'TechPulse',
    sellerRating: '4.9 ★',
    price: '₹1,999',
    oldPrice: '₹3,999',
    discount: '-50%',
    rating: 4.8,
    reviews: 275,
    stockLeft: 8,
    image: '/assets/products/product3.jpg',
  },
];

export default function DealsSpotlight() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        }
        if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        }
        if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDigits = (val: number) => String(val).padStart(2, '0');

  return (
    <section aria-label="Today's flash deals" className="w-full bg-background py-6 sm:py-10">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header with Countdown Urgency */}
        <div className="mb-4 flex flex-col justify-between gap-3 sm:mb-6 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-danger/10 px-2 py-0.5 text-xs font-bold text-danger">
                <Flame className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                FLASH DEALS
              </span>

              {/* Live countdown timer */}
              <div className="flex items-center gap-1 text-xs font-bold text-text-primary">
                <Clock className="h-3.5 w-3.5 text-text-tertiary" aria-hidden="true" />
                <span>Ends in:</span>
                <span className="rounded bg-surface-raised px-1.5 py-0.5 font-mono text-xs font-black shadow-2xs border border-border-default/60">
                  {formatDigits(timeLeft.hours)}:{formatDigits(timeLeft.minutes)}:
                  {formatDigits(timeLeft.seconds)}
                </span>
              </div>
            </div>

            <h2 className="mt-1.5 text-xl font-bold tracking-tight text-text-primary sm:text-2xl">
              Deals of the Day
            </h2>
          </div>

          <Link
            href="/deals"
            className="group flex items-center gap-1 text-xs font-semibold text-accent transition-opacity hover:opacity-80 sm:text-sm"
          >
            <span>Explore All Flash Deals</span>
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {flashDeals.map((deal) => (
            <article
              key={deal.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-border-default/80 bg-surface-raised shadow-2xs transition-all duration-300 ease-out hover:-translate-y-1 hover:border-border-strong hover:shadow-md"
            >
              {/* Product Image + Discount Pill */}
              <div className="relative aspect-square w-full overflow-hidden bg-surface-subtle">
                <Image
                  src={deal.image}
                  alt={deal.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-105"
                />

                <span className="absolute top-2 left-2 rounded-md bg-accent px-2 py-0.5 text-[11px] font-black text-on-accent shadow-xs">
                  {deal.discount}
                </span>

                <span className="absolute bottom-2 left-2 rounded-md bg-neutral-900/80 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-xs">
                  Sold by {deal.seller}
                </span>
              </div>

              {/* Card Details */}
              <div className="flex flex-1 flex-col p-3 sm:p-4">
                {/* Rating */}
                <div className="flex items-center gap-1 text-[11px] text-text-tertiary">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                  <span className="font-bold text-text-primary">{deal.rating}</span>
                  <span>({deal.reviews})</span>
                </div>

                <h3 className="mt-1 line-clamp-2 text-xs font-bold leading-snug text-text-primary sm:text-sm">
                  {deal.name}
                </h3>

                {/* Price & Strikeoff */}
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-base font-black text-text-primary sm:text-lg">
                    {deal.price}
                  </span>
                  <span className="text-xs text-text-tertiary line-through">{deal.oldPrice}</span>
                </div>

                {/* Stock Urgency Bar */}
                <div className="mt-2 text-[10px] font-semibold text-danger">
                  ⚡ Only {deal.stockLeft} left at this price!
                </div>

                {/* Add to Cart CTA */}
                <button
                  type="button"
                  className="mt-3 flex h-8.5 w-full items-center justify-center gap-1.5 rounded-md bg-accent text-xs font-bold text-on-accent transition-colors hover:bg-accent-hover active:bg-accent-active cursor-pointer"
                >
                  <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
