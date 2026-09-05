'use client';

import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const products = [
  {
    brand: 'Vender Name',
    name: 'Punctuated handcrafted ceramic',
    price: '$79.00',
    rating: '4.2',
    image: '/images/products/new-find-1.jpg',
  },
  {
    brand: 'SaoMeno',
    name: 'Bespoke Bags',
    price: '$79.00',
    rating: '4.5',
    image: '/images/products/new-find-2.jpg',
  },
  {
    brand: 'BytLifts',
    name: 'Curated Home Tech',
    price: '$16.00',
    rating: '4.5',
    image: '/images/products/new-find-3.jpg',
  },
  {
    brand: 'AuroBeauty',
    name: 'Artisanal Coffee',
    price: '$75.00',
    rating: '4.4',
    image: '/images/products/new-find-4.jpg',
  },
  {
    brand: 'BytLifts',
    name: 'Curated Home Decor',
    price: '$79.00',
    rating: '4.5',
    image: '/images/products/new-find-5.jpg',
  },
  {
    brand: 'AuroBeauty',
    name: 'Distinctive Design',
    price: '$69.00',
    rating: '4.6',
    image: '/images/products/new-find-6.jpg',
  },
  {
    brand: 'AuroBeauty',
    name: 'Distinctive Design',
    price: '$69.00',
    rating: '4.6',
    image: '/images/products/new-find-6.jpg',
  },
];

export default function CuratedNewFinds() {
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(2);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(4);
      } else {
        setItemsPerPage(6);
      }
    };

    updateItemsPerPage();

    window.addEventListener('resize', updateItemsPerPage);

    return () => {
      window.removeEventListener('resize', updateItemsPerPage);
    };
  }, []);

  const totalPages = Math.ceil(products.length / itemsPerPage);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));
  };

  const startIndex = currentPage * itemsPerPage;

  const visibleProducts = products.slice(startIndex, startIndex + itemsPerPage);

  return (
    <section className="w-full bg-white py-14">
      <div className="mx-auto max-w-[1200px] px-6">
        {/* Heading */}
        <div className="mb-7 flex items-center justify-between">
          <h2 className="text-[25px] font-semibold tracking-[-0.6px] text-[#171717]">
            Curated New Finds
          </h2>

          {/* Carousel Controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 0}
                aria-label="Previous products"
                className="
                                    flex h-10 w-10 items-center justify-center
                                    rounded-full border border-[#d8d3ce]
                                    bg-white text-[#222] shadow-sm
                                    transition-all duration-200
                                    hover:border-[#222]
                                    hover:bg-[#f8f6f3]
                                    hover:shadow-md
                                    active:scale-95
                                    disabled:cursor-not-allowed
                                    disabled:border-[#e8e5e2]
                                    disabled:bg-[#f7f6f5]
                                    disabled:text-[#b8b4b0]
                                    disabled:shadow-none
                                "
              >
                <ChevronLeft size={19} strokeWidth={1.8} />
              </button>

              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                aria-label="Next products"
                className="
                                    flex h-10 w-10 items-center justify-center
                                    rounded-full border border-[#d8d3ce]
                                    bg-white text-[#222] shadow-sm
                                    transition-all duration-200
                                    hover:border-[#222]
                                    hover:bg-[#f8f6f3]
                                    hover:shadow-md
                                    active:scale-95
                                    disabled:cursor-not-allowed
                                    disabled:border-[#e8e5e2]
                                    disabled:bg-[#f7f6f5]
                                    disabled:text-[#b8b4b0]
                                    disabled:shadow-none
                                "
              >
                <ChevronRight size={19} strokeWidth={1.8} />
              </button>
            </div>
          )}
        </div>

        {/* Products */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {visibleProducts.map((product) => (
            <article
              key={product.name}
              className="overflow-hidden rounded-[8px] border border-[#e4e4e4] bg-white"
            >
              {/* Product Image */}
              <div className="relative h-[145px] overflow-hidden bg-[#eee8e1]">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="175px"
                  className="object-cover"
                />
              </div>

              {/* Product Details */}
              <div className="px-3 py-3">
                <p className="mb-1 text-[9px] font-medium text-[#777]">{product.brand}</p>

                <h3 className="min-h-[28px] text-[10px] font-medium leading-[1.35] text-[#222]">
                  {product.name}
                </h3>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#222]">{product.price}</span>

                  <div className="flex items-center gap-1">
                    <Star size={9} fill="currentColor" className="text-[#c59b38]" />

                    <span className="text-[9px] text-[#777]">{product.rating}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Dynamic Indicators */}
        {totalPages > 1 && (
          <div className="mt-5 flex justify-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goToPage(index)}
                aria-label={`Go to product page ${index + 1}`}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  currentPage === index ? 'w-5 bg-[#222]' : 'w-1.5 bg-[#cfcfcf]'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
