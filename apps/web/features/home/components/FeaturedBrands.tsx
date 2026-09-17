import { CheckCircle2, Star } from 'lucide-react';
import Link from 'next/link';

const stores = [
  {
    name: 'TechPulse',
    category: 'Electronics & Gadgets',
    rating: 4.9,
    reviews: 1240,
    productsCount: '320+ Products',
    badge: 'Top Rated',
    slug: 'techpulse',
    initial: 'TP',
  },
  {
    name: 'UrbanVogue',
    category: 'Apparel & Streetwear',
    rating: 4.8,
    reviews: 890,
    productsCount: '540+ Products',
    badge: 'Popular',
    slug: 'urbanvogue',
    initial: 'UV',
  },
  {
    name: 'Apex Living',
    category: 'Home & Smart Kitchen',
    rating: 4.7,
    reviews: 620,
    productsCount: '210+ Products',
    badge: 'Trending',
    slug: 'apex-living',
    initial: 'AL',
  },
  {
    name: 'SoundWave',
    category: 'Hi-Fi Audio & Acoustics',
    rating: 4.9,
    reviews: 410,
    productsCount: '95+ Products',
    badge: 'Verified Seller',
    slug: 'soundwave',
    initial: 'SW',
  },
  {
    name: 'ActiveFit',
    category: 'Sporting & Fitness Gear',
    rating: 4.8,
    reviews: 750,
    productsCount: '180+ Products',
    badge: 'Top Rated',
    slug: 'activefit',
    initial: 'AF',
  },
  {
    name: 'PureGlow',
    category: 'Personal Care & Wellness',
    rating: 4.9,
    reviews: 1100,
    productsCount: '260+ Products',
    badge: 'Best Quality',
    slug: 'pureglow',
    initial: 'PG',
  },
];

export default function FeaturedBrands() {
  return (
    <section className="w-full bg-background py-6 sm:py-10">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-4 flex items-end justify-between sm:mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl">
              Featured Verified Stores
            </h2>
            <p className="mt-0.5 text-xs text-text-secondary sm:text-sm">
              Shop directly from top-rated sellers with buyer protection guarantees
            </p>
          </div>

          <Link
            href="/brands"
            className="group flex min-h-9 shrink-0 items-center gap-1 rounded-md px-1 text-xs font-semibold text-accent transition-opacity hover:opacity-80 sm:text-sm"
          >
            <span>View All Stores</span>
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </div>

        {/* Storefronts Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
          {stores.map((store) => (
            <Link
              key={store.slug}
              href={`/stores/${store.slug}`}
              className="group flex flex-col justify-between overflow-hidden rounded-xl border border-border-default/80 bg-surface-raised p-4 shadow-2xs transition-all duration-300 ease-out hover:-translate-y-1 hover:border-border-strong hover:shadow-md"
            >
              <div>
                {/* Store Avatar + Verified Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 font-bold text-accent shadow-2xs transition-transform group-hover:scale-105">
                    {store.initial}
                  </div>

                  <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                    Verified
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="truncate text-sm font-bold text-text-primary transition-colors group-hover:text-accent">
                    {store.name}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-text-secondary">{store.category}</p>
                </div>

                {/* Rating & Catalog Size */}
                <div className="mt-2.5 flex items-center gap-1 text-xs">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                  <span className="font-bold text-text-primary">{store.rating}</span>
                  <span className="text-[11px] text-text-tertiary">({store.reviews})</span>
                </div>
              </div>

              <div className="mt-4 border-t border-border-subtle pt-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-text-tertiary">{store.productsCount}</span>
                  <span className="font-semibold text-accent group-hover:underline">Visit →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
