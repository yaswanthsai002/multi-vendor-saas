import { Layers, ShieldCheck, Tag, Truck } from 'lucide-react';

const benefits = [
  {
    title: 'Vast Selection',
    description: 'Over 100,000+ products across 12+ versatile retail categories.',
    icon: Layers,
  },
  {
    title: 'Direct Vendor Pricing',
    description: 'Save big with factory-direct rates and no middleman markups.',
    icon: Tag,
  },
  {
    title: 'Escrow Buyer Protection',
    description: '100% money-back guarantee with hassle-free doorstep returns.',
    icon: ShieldCheck,
  },
  {
    title: 'Fast Nationwide Delivery',
    description: 'Real-time order tracking with insured express doorstep delivery.',
    icon: Truck,
  },
];

export default function WhyPerigee() {
  return (
    <section className="w-full bg-background py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            Why Shop on Perigee
          </h2>

          <p className="mt-1 text-sm text-text-secondary sm:text-base">
            Everything you need for a safe, reliable, and rewarding multi-vendor shopping experience
          </p>
        </div>

        {/* Value proposition pillars */}
        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <article
                key={benefit.title}
                className="group rounded-2xl border border-border-default/80 bg-surface-raised p-5 text-center shadow-2xs transition-all duration-300 ease-out hover:-translate-y-1 hover:border-border-strong hover:shadow-md"
              >
                {/* Feature icon container */}
                <div className="flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-transform duration-300 group-hover:scale-108">
                    <Icon size={24} strokeWidth={1.8} />
                  </div>
                </div>

                <h3 className="mt-3.5 text-sm font-bold text-text-primary sm:text-base">
                  {benefit.title}
                </h3>

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
