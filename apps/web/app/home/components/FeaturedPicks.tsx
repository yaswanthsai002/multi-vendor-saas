import { Star } from 'lucide-react';
import Image from 'next/image';

const products = [
  {
    brand: 'Vendor rianna',
    name: 'Distinctive ceramics',
    price: '$140.00',
    originalPrice: '$240.00',
    rating: 4.5,
    image: '/images/products/featured-1.jpg',
    avatar: '/images/avatars/vendor-rianna.jpg',
  },
  {
    brand: 'ExcHome',
    name: 'Bespoke bags',
    price: '$140.00',
    originalPrice: '$240.00',
    rating: 4.5,
    image: '/images/products/featured-2.jpg',
    avatar: '/images/avatars/exchome.jpg',
  },
  {
    brand: 'AuroBeauty',
    name: 'Curated furniture items',
    price: '$140.00',
    originalPrice: '$240.00',
    rating: 4.5,
    image: '/images/products/featured-3.jpg',
    avatar: '/images/avatars/aurobeauty.jpg',
  },
  {
    brand: 'Relicoolen',
    name: 'Curated art',
    price: '$140.00',
    originalPrice: '$240.00',
    rating: 4.5,
    image: '/images/products/featured-4.jpg',
    avatar: '/images/avatars/relicoolen.jpg',
  },
  {
    brand: 'AuroBeauty',
    name: 'Handcrafted jewelry',
    price: '$120.00',
    originalPrice: '$140.00',
    rating: 4.5,
    image: '/images/products/featured-5.jpg',
    avatar: '/images/avatars/aurobeauty.jpg',
  },
  {
    brand: 'StylinFix',
    name: 'Artisanal beauty',
    price: '$130.00',
    originalPrice: '$140.00',
    rating: 4.5,
    image: '/images/products/featured-6.jpg',
    avatar: '/images/avatars/stylinfix.jpg',
  },
];

function ProductRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-[2px]">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.floor(rating);

        return (
          <Star
            key={star}
            size={11}
            strokeWidth={1.5}
            fill={filled ? 'currentColor' : 'none'}
            className={filled ? 'text-[#d6a52f]' : 'text-[#cfcfcf]'}
          />
        );
      })}
    </div>
  );
}

export default function FeaturedPicks() {
  return (
    <section className="w-full bg-[#f8f9fa] py-12 sm:py-14">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-6">
        {/* Title */}
        <h2 className="mb-7 text-center text-[22px] font-semibold tracking-[-0.5px] text-[#171717] sm:text-[25px]">
          Featured Perigee Picks
        </h2>

        {/* Product Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article
              key={`${product.brand}-${product.name}`}
              className="
                                group
                                overflow-hidden
                                rounded-[12px]
                                border
                                border-[#dedede]
                                bg-white
                                transition-all
                                duration-300
                                ease-out
                                hover:-translate-y-1
                                hover:border-[#d4d0cc]
                                hover:shadow-[0_12px_30px_rgba(0,0,0,0.10)]
                                "
            >
              {/* Image Window */}
              <div className="p-[5px]">
                <div
                  className="
                                        relative
                                        aspect-[1.35/1]
                                        overflow-hidden
                                        rounded-[6px]
                                        bg-[#eee7df]
                                    "
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="
                                            (max-width: 640px) 100vw,
                                            (max-width: 1024px) 50vw,
                                            33vw
                                        "
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Product Info */}
              <div className="px-3 pb-3 pt-0">
                {/* Seller + Rating */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1.5">
                    {/* Avatar */}
                    <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full bg-[#e9e2da]">
                      <Image
                        src={product.avatar}
                        alt={product.brand}
                        fill
                        sizes="20px"
                        className="object-cover"
                      />
                    </div>

                    <span className="truncate text-[9px] font-medium text-[#555]">
                      {product.brand}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <ProductRating rating={product.rating} />

                    <span className="text-[8px] text-[#999]">{product.rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Product Name */}
                <h3 className="mt-1 text-[11px] font-semibold leading-[1.3] text-[#222]">
                  {product.name}
                </h3>

                {/* Pricing */}
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#171717]">{product.price}</span>

                  <span className="text-[8px] text-[#999] line-through">
                    {product.originalPrice}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
