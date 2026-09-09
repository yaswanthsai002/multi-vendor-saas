'use client';

import { Heart, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const products = [
  {
    brand: 'Kora',
    name: 'Kora Leather Tote',
    price: '$13.00',
    oldPrice: '$16.00',
    discount: '-15%',
    rating: '4.8',
    reviews: 2,
    image: '/assets/products/product.png',
  },
  {
    brand: 'Kora',
    name: 'Kora Leather Tote',
    price: '$17.00',
    oldPrice: '$20.00',
    discount: '-15%',
    rating: '4.7',
    reviews: 3,
    image: '/assets/products/product1.jpg',
  },
  {
    brand: 'Arlo',
    name: 'Arlo Leather Boots',
    price: '$18.00',
    oldPrice: '$21.00',
    discount: '-15%',
    rating: '4.9',
    reviews: 3,
    image: '/assets/products/product2.jpg',
  },
  {
    brand: 'Kora',
    name: 'Small Logo Ticlet',
    price: '$13.00',
    oldPrice: '$16.00',
    discount: '-15%',
    rating: '4.8',
    reviews: 1,
    image: '/assets/products/product3.jpg',
  },
  {
    brand: 'Mora',
    name: 'Pocket Leather Book',
    price: '$13.00',
    oldPrice: '$16.00',
    discount: '-15%',
    rating: '4.6',
    reviews: 3,
    image: '/assets/products/product4.jpg',
  },
  {
    brand: 'Arlo',
    name: 'Darwamhated handbag',
    price: '$18.00',
    oldPrice: '$22.00',
    discount: '-15%',
    rating: '4.8',
    reviews: 3,
    image: '/assets/products/product5.jpg',
  },
  {
    brand: 'Kora',
    name: 'Kora Leather Bag',
    price: '$13.00',
    oldPrice: '$16.00',
    discount: '-15%',
    rating: '4.7',
    reviews: 2,
    image: '/assets/products/product.png',
  },
  {
    brand: 'Mora',
    name: 'Classic Leather Tote',
    price: '$21.00',
    oldPrice: '$25.00',
    discount: '-15%',
    rating: '4.9',
    reviews: 4,
    image: '/assets/products/product1.jpg',
  },
];

export default function NewArrivals() {
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
        {/* Header */}
        <div className="mb-4 flex items-end justify-between sm:mb-5">
          <div>
            <h2
              className="
                text-[20px]
                font-semibold
                leading-[1.3]
                tracking-[-0.15px]
                text-[var(--text-primary)]
              "
            >
              New Arrivals
            </h2>

            <p
              className="
                mt-0.5
                text-[12px]
                font-normal
                leading-[1.4]
                text-[var(--text-secondary)]
              "
            >
              Fresh from brands on Perigee
            </p>
          </div>

          <Link
            href="/products"
            className="
              flex
              min-h-[44px]
              items-center
              gap-1
              rounded-md
              px-1
              text-[12px]
              font-medium
              leading-[1.4]
              text-[var(--text-primary)]
              transition-opacity
              duration-[120ms]
              hover:opacity-60
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[var(--border-focus)]
              focus-visible:ring-offset-2
              focus-visible:ring-offset-[var(--background)]
            "
          >
            View all
            <span aria-hidden="true" className="text-[14px]">
              →
            </span>
          </Link>
        </div>

        {/* Horizontal Product Rail */}
        <div
          className="
            -mx-4
            overflow-x-auto
            px-4
            pt-3
            pb-4

            sm:-mx-6
            sm:px-6
            sm:pt-3
            sm:pb-5

            lg:-mx-8
            lg:px-8

            scrollbar-none
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          <div
            className="
              flex
              gap-2
              sm:gap-3
            "
          >
            {products.map((product, index) => (
              <article
                key={`${product.name}-${index}`}
                className="
                    group
                    min-w-0
                    flex-none
                    w-[43vw]
                    sm:w-[30vw]
                    md:w-[22vw]
                    lg:w-[calc((100vw-112px)/6)]
                    max-w-[190px]

                    overflow-hidden
                    rounded-lg
                    border
                    border-[var(--border-subtle)]
                    bg-white
                    dark:bg-[var(--surface-raised)]

                    transform-gpu
                    transition-[transform,box-shadow,border-color]
                    duration-[240ms]
                    ease-[cubic-bezier(0.2,0.8,0.2,1)]
                    will-change-transform

                    hover:-translate-y-2
                    hover:border-[var(--border-default)]
                    hover:shadow-[0_12px_32px_rgba(30,35,45,0.14)]

                    dark:hover:border-[var(--border-strong)]
                    dark:hover:shadow-[0_12px_32px_rgba(0,0,0,0.32)]

                    motion-reduce:transition-none
                    motion-reduce:hover:translate-y-0
                  "
              >
                {/* Image */}
                <div
                  className="
                    relative
                    aspect-square
                    w-full
                    overflow-hidden
                    bg-[var(--surface-subtle)]
                  "
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="
                      (max-width: 639px) 43vw,
                      (max-width: 767px) 30vw,
                      (max-width: 1023px) 22vw,
                      180px
                    "
                    className="object-cover"
                  />

                  {/* Wishlist */}
                  <button
                    type="button"
                    aria-label={`Add ${product.name} to wishlist`}
                    className="
                      absolute
                      right-1.5
                      top-1.5
                      flex
                      h-7
                      w-7
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-[var(--border-default)]
                      bg-white/95
                      text-[var(--text-secondary)]
                      backdrop-blur-sm

                      transition-colors
                      duration-[120ms]

                      hover:text-[var(--accent)]

                      dark:bg-[var(--surface-raised)]/95

                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-[var(--border-focus)]
                    "
                  >
                    <Heart size={14} strokeWidth={1.7} />
                  </button>
                </div>

                {/* Product Details */}
                <div className="bg-white px-2.5 pb-3 pt-1.5 dark:bg-[var(--surface-raised)]">
                  {/* Brand */}
                  <p
                    className="
                      min-w-0
                      truncate
                      text-[10px]
                      font-semibold
                      leading-[1.35]
                      text-[var(--text-primary)]
                    "
                  >
                    {product.brand}
                  </p>

                  {/* Product name */}
                  <h3
                    className="
                      mt-0.5
                      truncate
                      text-[10px]
                      font-normal
                      leading-[1.35]
                      text-[var(--text-secondary)]
                    "
                    title={product.name}
                  >
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="mt-1 flex items-center gap-1">
                    <div
                      className="flex items-center gap-[1px]"
                      aria-label={`${product.rating} out of 5 stars`}
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={9}
                          strokeWidth={1.5}
                          fill={
                            star <= Math.round(Number(product.rating)) ? 'currentColor' : 'none'
                          }
                          className="text-[var(--warning)]"
                        />
                      ))}
                    </div>

                    <span
                      className="
                        text-[9px]
                        leading-none
                        text-[var(--text-secondary)]
                      "
                    >
                      {product.rating} ({product.reviews})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mt-1 flex items-center gap-1.5">
                    <span
                      className="
                        text-[11px]
                        font-semibold
                        leading-none
                        text-[var(--text-primary)]
                      "
                    >
                      {product.price}
                    </span>

                    <span
                      className="
                        text-[9px]
                        leading-none
                        text-[var(--text-tertiary)]
                        line-through
                      "
                    >
                      {product.oldPrice}
                    </span>

                    <span
                      className="
                        rounded-sm
                        bg-[var(--accent-subtle)]
                        px-1
                        py-0.5
                        text-[8px]
                        font-medium
                        leading-none
                        text-[var(--accent)]
                      "
                    >
                      {product.discount}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
