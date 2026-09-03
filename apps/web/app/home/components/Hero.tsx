import Image from 'next/image';

export default function Hero() {
  return (
    <section className="w-full bg-[#2b211e]">
      <div className="mx-auto grid min-h-[360px] max-w-[1440px] grid-cols-1 md:grid-cols-[1fr_1.05fr]">
        {/* Left Content */}
        <div className="flex flex-col justify-center px-8 py-12 sm:px-12 lg:px-16">
          <div className="max-w-[520px]">
            <h1 className="text-[36px] font-semibold leading-[1.08] tracking-[-1.5px] text-white sm:text-[42px] lg:text-[48px]">
              Everything You Need,
              <br />
              Discovered from
              <br />
              Distinctive Partners.
            </h1>

            <p className="mt-5 max-w-[430px] text-[13px] leading-[1.6] text-white/65">
              Curated marketplace with distinctive independent brands and their products, directly
              sourced.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-[5px] bg-[#d86f45] px-5 py-2.5 text-[11px] font-semibold text-white transition hover:bg-[#c96039]"
              >
                Shop Best Brands
              </button>

              <button
                type="button"
                className="rounded-[5px] border border-white/40 px-5 py-2.5 text-[11px] font-medium text-white transition hover:bg-white/10"
              >
                Explore Sellers
              </button>
            </div>
          </div>
        </div>

        {/* Image Collage */}
        <div className="grid min-h-[360px] grid-cols-2 grid-rows-2">
          {/* Image 1 */}
          <div className="relative overflow-hidden">
            <Image
              src="/images/hero-1.jpg"
              alt="Curated home interior"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Image 2 */}
          <div className="relative overflow-hidden">
            <Image
              src="/images/hero-2.jpg"
              alt="Curated living space"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Image 3 */}
          <div className="relative overflow-hidden">
            <Image
              src="/images/hero-3.jpg"
              alt="Curated products"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Image 4 */}
          <div className="relative overflow-hidden">
            <Image
              src="/images/hero-4.jpg"
              alt="Independent seller"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
