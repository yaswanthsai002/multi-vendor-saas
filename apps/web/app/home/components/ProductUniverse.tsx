import { BookOpen, Dumbbell, House, Laptop, Shirt, Sparkles } from 'lucide-react';
import Image from 'next/image';

import Apperal from '@/assets/images/Home/Apperal.png';
import Beauty from '@/assets/images/Home/Beauty.png';
import Books from '@/assets/images/Home/Books.png';
import Garden from '@/assets/images/Home/chair.png';
import Electronics from '@/assets/images/Home/laptop.png';
import Sports from '@/assets/images/Home/Sports.png';

const categories = [
  {
    name: 'Electronics',
    image: Electronics,
    icon: Laptop,
  },
  {
    name: 'Home & Garden',
    image: Garden,
    icon: House,
  },
  {
    name: 'Apparel',
    image: Apperal,
    icon: Shirt,
  },
  {
    name: 'Beauty',
    image: Beauty,
    icon: Sparkles,
  },
  {
    name: 'Sports',
    image: Sports,
    icon: Dumbbell,
  },
  {
    name: 'Books',
    image: Books,
    icon: BookOpen,
  },
];

export default function ProductUniverse() {
  return (
    <section
      className="
        bg-[#f8f9fa]
        py-14
        dark:bg-[#0A0D14]
        md:py-16
      "
    >
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        {/* Heading */}
        <h2
          className="
            mb-8
            text-center
            text-2xl
            font-semibold
            tracking-tight
            text-[#181818]
            dark:text-[#E4E7EC]
            md:text-[28px]
          "
        >
          Shop Our Product Universe
        </h2>

        {/* Category Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <button
                key={category.name}
                type="button"
                className="
                                    group
                                    relative
                                    h-[180px]
                                    overflow-hidden
                                    rounded-[14px]
                                    bg-[#eee7df]
                                    text-left

                                    transition-[transform,background-color,box-shadow]
                                    duration-300
                                    ease-out
                                    will-change-transform

                                    hover:scale-[1.01]
                                    hover:bg-[#f1ebe4]
                                    hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]

                                    dark:bg-[#191E2A]
                                    dark:hover:bg-[#222936]
                                    dark:hover:shadow-[0_8px_20px_rgba(0,0,0,0.30)]
                                    "
              >
                {/* Icon */}
                <div
                  className="
                    absolute
                    left-5
                    top-5
                    z-20
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    bg-white/90
                    dark:bg-[#202633]
                  "
                >
                  <Icon
                    size={23}
                    strokeWidth={1.7}
                    className="
                      text-[#222]
                      dark:text-[#E4E7EC]
                    "
                  />
                </div>

                {/* Label */}
                <span
                  className="
                    absolute
                    bottom-5
                    left-5
                    z-20
                    max-w-[120px]
                    text-[17px]
                    font-semibold
                    leading-[1.1]
                    text-[#1d1d1d]
                    dark:text-[#E4E7EC]
                  "
                >
                  {category.name}
                </span>

                {/* Product Image */}
                <div className="absolute bottom-0 right-0 h-[90%] w-[58%]">
                  <Image
                    src={category.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 55vw, (max-width: 1024px) 30vw, 230px"
                    className="
                                            object-contain
                                            object-bottom
                                            transition-transform
                                            duration-500
                                            ease-out
                                            will-change-transform
                                            group-hover:scale-[1.025]
                                            "
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
