'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { ProductCard } from '@/shared/components/product-card/product-card';

import { useHomepageCampaigns } from '../hooks/use-homepage-data';

import { CampaignCountdown } from './Hero';

function formatPrice(value: string) {
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

export default function DealsSpotlight() {
  const { data, isLoading, isError } = useHomepageCampaigns();
  const campaigns = data?.active ?? [];

  if (isLoading || isError) return null;

  const campaignsWithProducts = campaigns
    .map((campaign) => ({
      ...campaign,
      products: campaign.products.filter((product) => product.imageUrl && product.stock > 0),
    }))
    .filter((campaign) => campaign.products.length > 0);

  if (!campaignsWithProducts.length) return null;

  return (
    <div className="space-y-8 py-8 sm:py-10">
      {campaignsWithProducts.map((campaign) => (
        <section
          key={campaign.campaignId}
          aria-labelledby={`deals-${campaign.campaignId}`}
          className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                {campaign.eyebrow}
              </p>
              <h2
                id={`deals-${campaign.campaignId}`}
                className="mt-1 text-xl font-bold tracking-tight text-text-primary sm:text-2xl"
              >
                {campaign.title}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <CampaignCountdown target={campaign.endsAt} label="Ends in" />
              <Link
                href={campaign.ctaHref}
                className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
              >
                {campaign.ctaLabel} <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {campaign.products.slice(0, 8).map((product) => {
              const regularPrice = Number(product.regularPrice);
              const dealPrice = Number(product.dealPrice);
              const discount =
                regularPrice > dealPrice ? Math.round((1 - dealPrice / regularPrice) * 100) : 0;
              return (
                <ProductCard
                  key={product.productId}
                  product={{
                    id: product.productId,
                    slug: product.slug,
                    name: product.name,
                    brand: product.vendor.name,
                    price: formatPrice(product.dealPrice),
                    oldPrice: formatPrice(product.regularPrice),
                    discount: discount > 0 ? `-${discount}%` : undefined,
                    rating: product.rating ?? undefined,
                    reviewsCount: product.ratingCount,
                    image: product.imageUrl!,
                    badge: { text: 'Deal', variant: 'accent' },
                  }}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
