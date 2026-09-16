'use client';

import Link from 'next/link';

import type { Product } from '@/shared/components/product-card/product-card.types';

import { ProductCard } from '@/shared/components/product-card/product-card';

const products: Product[] = [
  {
    brand: 'Kora',
    name: 'Kora Leather Tote',
    price: '$13.00',
    oldPrice: '$16.00',
    discount: '-15%',
    rating: '4.8',
    reviews: 24,
    image: '/assets/products/product.png',
    badge: { text: 'Best Seller', variant: 'warning' },
  },
  {
    brand: 'Kora',
    name: 'Kora Classic Shoulder Bag',
    price: '$17.00',
    oldPrice: '$20.00',
    discount: '-15%',
    rating: '4.7',
    reviews: 18,
    image: '/assets/products/product1.jpg',
    badge: { text: 'New', variant: 'accent' },
  },
  {
    brand: 'Arlo',
    name: 'Arlo Artisan Leather Boots',
    price: '$18.00',
    oldPrice: '$21.00',
    discount: '-15%',
    rating: '4.9',
    reviews: 32,
    image: '/assets/products/product2.jpg',
    badge: { text: 'Top Rated', variant: 'success' },
  },
  {
    brand: 'Kora',
    name: 'Small Logo Leather Ticlet',
    price: '$13.00',
    oldPrice: '$16.00',
    discount: '-15%',
    rating: '4.8',
    reviews: 12,
    image: '/assets/products/product3.jpg',
  },
  {
    brand: 'Mora',
    name: 'Pocket Handbound Leather Book',
    price: '$13.00',
    oldPrice: '$16.00',
    discount: '-15%',
    rating: '4.6',
    reviews: 9,
    image: '/assets/products/product4.jpg',
  },
  {
    brand: 'Arlo',
    name: 'Handcrafted Minimalist Handbag',
    price: '$18.00',
    oldPrice: '$22.00',
    discount: '-15%',
    rating: '4.8',
    reviews: 15,
    image: '/assets/products/product5.jpg',
    badge: { text: 'Popular', variant: 'neutral' },
  },
  {
    brand: 'Kora',
    name: 'Kora Compact Travel Bag',
    price: '$13.00',
    oldPrice: '$16.00',
    discount: '-15%',
    rating: '4.7',
    reviews: 14,
    image: '/assets/products/product.png',
  },
  {
    brand: 'Mora',
    name: 'Classic Daily Leather Tote',
    price: '$21.00',
    oldPrice: '$25.00',
    discount: '-15%',
    rating: '4.9',
    reviews: 28,
    image: '/assets/products/product1.jpg',
    badge: { text: 'Trending', variant: 'accent' },
  },
];

export default function NewArrivals() {
  const handleAddToCart = () => {};

  return (
    <section className="w-full bg-surface-raised py-6 dark:bg-surface sm:py-8 md:py-10">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-4 flex items-end justify-between sm:mb-5">
          <div>
            <h2 className="text-xl font-semibold leading-snug tracking-tight text-text-primary">
              New Arrivals
            </h2>
            <p className="mt-0.5 text-xs font-normal leading-normal text-text-secondary">
              Fresh from brands on Perigee
            </p>
          </div>

          <Link
            href="/products"
            className="flex min-h-11 items-center gap-1 rounded-md px-1 text-xs font-medium leading-normal text-text-primary transition-opacity duration-150 hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            View all
            <span aria-hidden="true" className="text-sm">
              →
            </span>
          </Link>
        </div>

        {/* Product rail */}
        <div className="-mx-4 overflow-x-auto px-4 pt-3 pb-4 sm:-mx-6 sm:px-6 sm:pt-3 sm:pb-5 lg:-mx-8 lg:px-8 scrollbar-none [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-2 sm:gap-3">
            {products.map((product, index) => (
              <ProductCard
                key={`${product.name}-${index}`}
                product={product}
                onAddToCart={handleAddToCart}
                className="w-[43vw] max-w-48 min-w-0 flex-none sm:w-[30vw] md:w-[22vw] lg:w-[calc((100vw-112px)/6)]"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
