import Image from 'next/image';

const brands = [
  {
    name: 'Aura',
    logo: '/images/brands/aura.svg',
  },
  {
    name: 'Rolail',
    logo: '/images/brands/rolail.svg',
  },
  {
    name: 'Indiend',
    logo: '/images/brands/indiend.svg',
  },
  {
    name: 'Reliccian',
    logo: '/images/brands/reliccian.svg',
  },
  {
    name: 'Lieanmode',
    logo: '/images/brands/lieanmode.svg',
  },
];

export default function TrustedBrands() {
  return (
    <section className="w-full bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-[1200px] px-6">
        {/* Heading */}
        <div className="text-center">
          <h2 className="text-[20px] font-semibold tracking-[-0.4px] text-[#222] sm:text-[22px]">
            Shop All Trusted Partner Brands
          </h2>

          <p className="mt-[4px] text-[15px] text-[#666]">Adapted to sound independent</p>
        </div>

        {/* Brand Logos */}
        <div className="mt-7 flex items-center justify-center gap-7 overflow-hidden sm:gap-10 md:gap-12">
          {brands.map((brand) => (
            <button
              key={brand.name}
              type="button"
              className="
                                flex
                                h-[38px]
                                w-[100px]
                                shrink-0
                                items-center
                                justify-center
                                transition-opacity
                                duration-200
                                hover:opacity-60
                            "
              aria-label={`View ${brand.name}`}
            >
              <Image
                src={brand.logo}
                alt={`${brand.name} logo`}
                width={100}
                height={38}
                className="h-auto max-h-[32px] w-auto max-w-[100px] object-contain"
              />
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            className="
                            rounded-[4px]
                            bg-[#111]
                            px-4
                            py-[7px]
                            text-[12px]
                            font-medium
                            text-white
                            transition-all
                            duration-200
                            hover:bg-[#333]
                            hover:shadow-sm
                            active:scale-[0.98]
                        "
          >
            Shop All Brands
          </button>
        </div>
      </div>
    </section>
  );
}
