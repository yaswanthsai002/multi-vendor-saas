import Image from 'next/image';

import HeroImage2 from '@/assets/images/Home/bags.png';
import HeroImage4 from '@/assets/images/Home/girl.png';
import HeroImage1 from '@/assets/images/Home/Livingroom.png';
import HeroImage3 from '@/assets/images/Home/tech.png';

export default function Hero() {
  return (
    <section
      className="
        w-full
        bg-[#2b211e]
        dark:bg-[#131722]
      "
    >
      <div className="mx-auto flex min-h-[360px] max-w-[1440px] flex-col md:flex-row">
        {/* LEFT CONTENT */}
        <div className="flex w-full items-center px-8 py-12 sm:px-12 lg:w-[53%] lg:px-16">
          <div className="max-w-[520px]">
            <h1
              className="
                text-[34px]
                font-semibold
                leading-[1.08]
                tracking-[-1.5px]
                text-white
                sm:text-[40px]
                lg:text-[46px]
              "
            >
              Everything You Need,
              <br />
              Discovered from
              <br />
              Distinctive Partners.
            </h1>

            <p
              className="
                mt-5
                max-w-[430px]
                text-[13px]
                leading-[1.6]
                text-white/65
                dark:text-[#B5BBC6]
              "
            >
              Curated marketplace with distinctive independent brands and their products, directly
              sourced.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              <button
                type="button"
                className="
                  rounded-[5px]
                  bg-[#d86f45]
                  px-4
                  py-[9px]
                  text-[12px]
                  font-bold
                  leading-none
                  text-white
                  transition
                  hover:bg-[#c96039]
                  dark:bg-[#E66A45]
                  dark:hover:bg-[#F08060]
                "
              >
                Shop Best Brands
              </button>

              <button
                type="button"
                className="
                  rounded-[5px]
                  border
                  border-white/40
                  px-4
                  py-[9px]
                  text-[12px]
                  font-bold
                  leading-none
                  text-white
                  transition
                  hover:bg-white/10
                  dark:border-[#343B49]
                  dark:text-[#E4E7EC]
                  dark:hover:bg-[#1B202C]
                "
              >
                Explore Sellers
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT IMAGE COLLAGE */}
        <div className="relative min-h-[360px] w-full overflow-hidden lg:w-[47%]">
          {/* Image 1 - Top Left */}
          <div className="absolute left-0 top-0 h-[57%] w-[51%] overflow-hidden rounded-[8px]">
            <Image
              src={HeroImage1}
              alt="Curated home interior"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Image 2 - Top Right */}
          <div className="absolute right-0 top-0 h-[42%] w-[47%] overflow-hidden rounded-[8px]">
            <Image
              src={HeroImage2}
              alt="Curated living space"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Image 3 - Bottom Left */}
          <div className="absolute bottom-[-12px] left-0 h-[43%] w-[51%] overflow-hidden rounded-[8px]">
            <Image src={HeroImage3} alt="Curated products" fill className="object-cover" />
          </div>

          {/* Image 4 - Bottom Right */}
          <div className="absolute bottom-0 right-0 top-[calc(43%+8px)] w-[47%] overflow-hidden rounded-[8px]">
            <Image src={HeroImage4} alt="Independent seller" fill className="object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}
