'use client';

import Link from 'next/link';

import type { Product } from '@/shared/components/product-card/product-card.types';

import { ProductCard } from '@/shared/components/product-card/product-card';

const products: Product[] = [
  {
    brand: 'TechPulse',
    name: 'Wireless Studio Noise-Cancelling Headphones',
    price: '₹1,899',
    oldPrice: '₹3,499',
    discount: '-45%',
    rating: '4.8',
    reviews: 124,
    image: '/assets/products/product2.jpg',
    badge: { text: 'Best Seller', variant: 'warning' },
  },
  {
    brand: 'UrbanVogue',
    name: 'Casual Streetwear Full-Grain Backpack',
    price: '₹1,299',
    oldPrice: '₹2,199',
    discount: '-40%',
    rating: '4.7',
    reviews: 88,
    image: '/assets/products/product.png',
    badge: { text: 'Trending', variant: 'accent' },
  },
  {
    brand: 'Apex Living',
    name: 'Compact Digital Kitchen Air Fryer',
    price: '₹2,499',
    oldPrice: '₹4,499',
    discount: '-44%',
    rating: '4.9',
    reviews: 215,
    image: '/assets/products/product1.jpg',
    badge: { text: 'Top Rated', variant: 'success' },
  },
  {
    brand: 'SoundWave',
    name: 'Ultra-Bass Portable Wireless Speaker',
    price: '₹999',
    oldPrice: '₹1,899',
    discount: '-47%',
    rating: '4.8',
    reviews: 64,
    image: '/assets/products/product3.jpg',
  },
  {
    brand: 'ActiveFit',
    name: 'Breathable Running Athletic Shoes',
    price: '₹1,599',
    oldPrice: '₹2,999',
    discount: '-46%',
    rating: '4.6',
    reviews: 79,
    image: '/assets/products/product4.jpg',
  },
  {
    brand: 'PureGlow',
    name: 'Essential Skincare Botanical Gift Set',
    price: '₹799',
    oldPrice: '₹1,299',
    discount: '-38%',
    rating: '4.8',
    reviews: 135,
    image: '/assets/products/product5.jpg',
    badge: { text: 'Popular', variant: 'neutral' },
  },
  {
    brand: 'TechPulse',
    name: 'Ergonomic Vertical Wireless Mouse',
    price: '₹699',
    oldPrice: '₹1,199',
    discount: '-41%',
    rating: '4.7',
    reviews: 54,
    image: '/assets/products/product.png',
  },
  {
    brand: 'UrbanVogue',
    name: 'Classic Everyday Leather Messenger',
    price: '₹1,699',
    oldPrice: '₹2,899',
    discount: '-41%',
    rating: '4.9',
    reviews: 98,
    image: '/assets/products/product1.jpg',
    badge: { text: 'New', variant: 'accent' },
  },
];

export default function NewArrivals() {
  const handleAddToCart = () => {};

  return (
    <section className="w-full bg-background py-6 sm:py-8 md:py-10">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-4 flex items-end justify-between sm:mb-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl">
              New Arrivals & Trending Drops
            </h2>
            <p className="mt-0.5 text-xs text-text-secondary sm:text-sm">
              Fresh additions from verified multi-vendor storefronts
            </p>
          </div>

          <Link
            href="/products"
            className="group flex min-h-11 items-center gap-1 rounded-md px-1 text-xs font-semibold text-accent transition-opacity hover:opacity-80 sm:text-sm"
          >
            <span>View All Products</span>
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </div>

        {/* Product rail */}
        <div className="-mx-4 overflow-x-auto px-4 pt-2 pb-4 scrollbar-none sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex gap-3 sm:gap-4">
            {products.map((product, index) => (
              <ProductCard
                key={`${product.name}-${index}`}
                product={product}
                onAddToCart={handleAddToCart}
                className="w-[44vw] max-w-48 min-w-0 flex-none sm:w-[30vw] md:w-[22vw] lg:w-[calc((100vw-112px)/6)]"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
