import { CreditCard, Globe2, HandHeart, LayoutGrid } from 'lucide-react';

const benefits = [
  {
    title: 'Diverse Selections',
    description: 'Diverse selections, vendors, and makers.',
    icon: LayoutGrid,
  },
  {
    title: 'Trusted Vendors',
    description: 'Ensure vendors and supported sellers.',
    icon: HandHeart,
  },
  {
    title: 'Secure Payments',
    description: 'Secure payments and protected transactions.',
    icon: CreditCard,
  },
  {
    title: 'Global Shipping',
    description: 'Thoughtful delivery and global shipping.',
    icon: Globe2,
  },
];

export default function WhyPerigee() {
  return (
    <section
      className="
        w-full
        bg-[#f4f6f9]
        py-12
        dark:bg-[#11161F]
        sm:py-14
      "
    >
      <div className="mx-auto max-w-[1200px] px-5 sm:px-6">
        {/* Heading */}
        <div className="text-center">
          <h2
            className="
              text-[23px]
              font-semibold
              tracking-[-0.6px]
              text-[#222]
              dark:text-[#E4E7EC]
              sm:text-[25px]
            "
          >
            Why Shop Perigee
          </h2>

          <p
            className="
              mt-1
              text-[18px]
              text-[#555]
              dark:text-[#9AA3B2]
            "
          >
            Adapted body-md
          </p>
        </div>

        {/* Benefits */}
        <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <article
                key={benefit.title}
                className="
                    group
                    rounded-[8px]
                    border
                    border-[#dcdfe3]
                    bg-white
                    px-4
                    py-4
                    text-center

                    transition-[transform,box-shadow,border-color,background-color]
                    duration-500
                    ease-[cubic-bezier(0.2,0,0,1)]
                    will-change-transform

                    hover:scale-[1.008]
                    hover:border-[#d3d6da]
                    hover:bg-[#fdfcfb]
                    hover:shadow-[0_14px_32px_rgba(0,0,0,0.08)]

                    dark:border-[#252A33]
                    dark:bg-[#0D1117]
                    dark:hover:border-[#343B49]
                    dark:hover:bg-[#151A21]
                    dark:hover:shadow-[0_14px_32px_rgba(0,0,0,0.30)]
                    "
              >
                {/* Icon */}
                <div className="flex justify-center">
                  <div
                    className="
                        flex
                        h-[54px]
                        w-[54px]
                        items-center
                        justify-center
                        rounded-full
                        bg-[#eee8e1]
                        transition-[transform,background-color]
                        duration-500
                        ease-[cubic-bezier(0.2,0,0,1)]
                        group-hover:scale-[1.025]
                        dark:bg-[#202633]
                        dark:group-hover:bg-[#252B38]
                    "
                  >
                    <Icon size={23} strokeWidth={1.7} className="text-[#222] dark:text-[#E4E7EC]" />
                  </div>
                </div>

                {/* Title */}
                <h3
                  className="
                    mt-4
                    text-[16px]
                    font-semibold
                    text-[#292929]
                    dark:text-[#E4E7EC]
                  "
                >
                  {benefit.title}
                </h3>

                {/* Description */}
                <p
                  className="
                    mx-auto
                    mt-1.5
                    max-w-[150px]
                    text-[12px]
                    leading-[1.45]
                    text-[#777]
                    dark:text-[#9AA3B2]
                  "
                >
                  {benefit.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
