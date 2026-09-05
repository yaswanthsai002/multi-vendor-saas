import { Star } from 'lucide-react';
import Image from 'next/image';

const products = [
  {
    brand: 'Vender Rame',
    name: 'Unique vases',
    price: '$140.00',
    originalPrice: '$140.00',
    rating: 4.7,
    image: '/images/products/hot-1.jpg',
    avatar: '/images/avatars/vender-rame.jpg',
  },
  {
    brand: 'Ecorlame',
    name: 'Distinctive Lighting',
    price: '$140.00',
    originalPrice: '$140.00',
    rating: 4.8,
    image: '/images/products/hot-2.jpg',
    avatar: '/images/avatars/ecorlame.jpg',
  },
  {
    brand: 'AuroBeauty',
    name: 'Handcrafted Home Tech',
    price: '$140.00',
    originalPrice: '$140.00',
    rating: 4.6,
    image: '/images/products/hot-3.jpg',
    avatar: '/images/avatars/aurobeauty.jpg',
  },
  {
    brand: 'AuroBeauty',
    name: 'Artisanal Apparel',
    price: '$120.00',
    originalPrice: '$140.00',
    rating: 4.7,
    image: '/images/products/hot-4.jpg',
    avatar: '/images/avatars/aurobeauty.jpg',
  },
  {
    brand: 'AuroBeauty',
    name: 'Unique Bags',
    price: '$120.00',
    originalPrice: '$140.00',
    rating: 4.8,
    image: '/images/products/hot-5.jpg',
    avatar: '/images/avatars/aurobeauty.jpg',
  },
  {
    brand: 'AuroBeauty',
    name: "Flower' Vase",
    price: '$160.00',
    originalPrice: '$140.00',
    rating: 4.5,
    image: '/images/products/hot-6.jpg',
    avatar: '/images/avatars/aurobeauty.jpg',
  },
];

function Rating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-[1px]">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={10}
            strokeWidth={1.5}
            fill={star <= Math.round(rating) ? 'currentColor' : 'none'}
            className={
              star <= Math.round(rating) ? 'text-[#d6a52f]' : 'text-[#cfcfcf] dark:text-[#4A5260]'
            }
          />
        ))}
      </div>

      <span className="text-[8px] text-[#999] dark:text-[#8B95A5]">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function TopPicks() {
  return (
    <section
      className="
        w-full
        bg-[#eee7df]
        py-14
        dark:bg-[#11161F]
        sm:py-16
      "
    >
      <div className="mx-auto max-w-[1200px] px-5 sm:px-6">
        {/* Title */}
        <h2
          className="
            mb-8
            text-center
            text-[22px]
            font-semibold
            tracking-[-0.5px]
            text-[#222]
            dark:text-[#E4E7EC]
            sm:text-[25px]
          "
        >
          Top Picks: What&apos;s Hot
        </h2>

        {/* Products */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article
              key={`${product.brand}-${product.name}`}
              className="
                group
                overflow-hidden
                rounded-[9px]
                border
                border-[#ddd5cd]
                bg-white

                transition-[transform,box-shadow,border-color,background-color]
                duration-500
                ease-[cubic-bezier(0.2,0,0,1)]
                will-change-transform

                hover:scale-[1.008]
                hover:border-[#d0c8c0]
                hover:bg-[#fdfcfb]
                hover:shadow-[0_14px_32px_rgba(0,0,0,0.10)]

                dark:border-[#252A33]
                dark:bg-[#0D1117]
                dark:hover:border-[#343B49]
                dark:hover:bg-[#151A21]
                dark:hover:shadow-[0_14px_32px_rgba(0,0,0,0.32)]
                "
            >
              {/* Image */}
              <div
                className="
                  relative
                  aspect-[1.15/1]
                  overflow-hidden
                  bg-[#ddd4ca]
                  dark:bg-[#151A23]
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
                  className="
                    object-cover
                    transition-transform
                    duration-700
                    ease-[cubic-bezier(0.2,0,0,1)]
                    will-change-transform
                    group-hover:scale-[1.025]
                    "
                />

                {/* Best Seller */}
                <div
                  className="
                    absolute
                    left-3
                    top-3
                    rounded-[3px]
                    bg-[#d19a35]
                    px-2
                    py-1
                    text-[7px]
                    font-bold
                    uppercase
                    tracking-[0.5px]
                    text-white
                    shadow-[0_2px_6px_rgba(0,0,0,0.12)]
                    transition-transform
                    duration-300
                    ease-out
                    group-hover:scale-[1.02]
                  "
                >
                  Best Seller
                </div>
              </div>

              {/* Information */}
              <div className="px-3.5 pb-4 pt-3">
                {/* Seller + Rating */}
                <div className="flex items-center justify-between gap-2">
                  {/* Seller */}
                  <div className="flex min-w-0 items-center gap-1.5">
                    <div
                      className="
                        relative
                        h-5
                        w-5
                        shrink-0
                        overflow-hidden
                        rounded-full
                        bg-[#e8e1d9]
                        dark:bg-[#202633]
                      "
                    >
                      <Image
                        src={product.avatar}
                        alt={product.brand}
                        fill
                        sizes="20px"
                        className="object-cover"
                      />
                    </div>

                    <span
                      className="
                        truncate
                        text-[9px]
                        font-medium
                        text-[#666]
                        dark:text-[#9AA3B2]
                      "
                    >
                      {product.brand}
                    </span>
                  </div>

                  {/* Rating */}
                  <Rating rating={product.rating} />
                </div>

                {/* Product */}
                <h3
                  className="
                    mt-1.5
                    text-[12px]
                    font-semibold
                    leading-[1.3]
                    text-[#222]
                    dark:text-[#E4E7EC]
                  "
                >
                  {product.name}
                </h3>

                {/* Price */}
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className="
                      text-[12px]
                      font-bold
                      text-[#171717]
                      dark:text-[#E4E7EC]
                    "
                  >
                    {product.price}
                  </span>

                  <span
                    className="
                      text-[8px]
                      text-[#999]
                      dark:text-[#8B95A5]
                      line-through
                    "
                  >
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
