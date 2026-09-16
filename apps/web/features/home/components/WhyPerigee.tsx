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
    <section className="w-full bg-background py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
            Why Shop Perigee
          </h2>

          <p className="mt-1 text-base text-text-secondary sm:text-lg">
            Everything you need to shop independent brands with confidence.
          </p>
        </div>

        {/* Value proposition pillars */}
        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <article
                key={benefit.title}
                className="group rounded-lg border border-border-default bg-surface-raised px-4 py-4 text-center transition-[box-shadow,border-color,background-color] duration-300 ease-out will-change-transform motion-reduce:transition-none"
              >
                {/* Feature icon container */}
                <div className="flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-subtle transition-[transform,background-color] duration-300 ease-out group-hover:scale-105 motion-reduce:transition-none">
                    <Icon size={23} strokeWidth={1.7} className="text-text-primary" />
                  </div>
                </div>

                <h3 className="mt-4 text-base font-semibold text-text-primary">{benefit.title}</h3>

                <p className="mx-auto mt-1.5 max-w-xs text-xs leading-relaxed text-text-secondary">
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
