'use client';

import { ArrowLeft, ArrowRight, Clock3 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { useHomepageCampaigns } from '../hooks/use-homepage-data';

import type { HomepageCampaign } from '../services/home.service';

import { Button } from '@/components/ui/button';
import { MarketingBanner } from '@/shared/components/marketing-banner';

export function CampaignCountdown({ target, label }: { target: string; label: string }) {
  const [now, setNow] = useState<number | null>(null);
  const { refetch } = useHomepageCampaigns();

  useEffect(() => {
    const timer = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (new Date(target).getTime() <= current) {
        window.clearInterval(timer);
        void refetch();
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [target, refetch]);

  const secondsLeft = Math.max(0, Math.floor((new Date(target).getTime() - (now ?? 0)) / 1000));
  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  return (
    <span className="inline-flex items-center gap-2 rounded-md bg-surface-raised/90 px-3 py-2 text-sm font-semibold text-text-primary shadow-sm backdrop-blur-sm">
      <Clock3 size={16} aria-hidden="true" />
      <span>{label}</span>
      <time className="font-mono tabular-nums" dateTime={target}>
        {now === null
          ? '--:--:--'
          : `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`}
      </time>
    </span>
  );
}

function CampaignSlide({
  campaign,
  isUpcoming,
}: {
  campaign: HomepageCampaign;
  isUpcoming: boolean;
}) {
  return (
    <MarketingBanner
      eyebrow={isUpcoming ? 'Coming soon' : campaign.eyebrow}
      title={campaign.title}
      subtitle={campaign.subtitle}
      imageUrl={campaign.imageUrl}
      mobileImageUrl={campaign.mobileImageUrl ?? undefined}
      ctaLabel={isUpcoming ? '' : campaign.ctaLabel}
      href={isUpcoming ? undefined : campaign.ctaHref}
    >
      <CampaignCountdown
        target={isUpcoming ? campaign.startsAt : campaign.endsAt}
        label={isUpcoming ? 'Starts in' : 'Ends in'}
      />
    </MarketingBanner>
  );
}

export default function Hero() {
  const { data, isLoading, isError, refetch } = useHomepageCampaigns();
  const [activeIndex, setActiveIndex] = useState(0);
  const active = data?.active ?? [];
  const upcoming = data?.upcoming ?? [];
  const isUpcomingHero = active.length === 0;
  const slides = active.length ? active : upcoming.slice(0, 1);
  const current = slides[activeIndex % Math.max(slides.length, 1)];

  if (isLoading) {
    return (
      <div
        aria-label="Loading promotions"
        className="mx-4 mt-6 h-80 animate-pulse rounded-2xl bg-surface-subtle sm:mx-auto sm:h-96 sm:max-w-7xl"
      />
    );
  }

  if (isError) {
    return (
      <section className="mx-auto mt-6 w-full max-w-7xl px-4 sm:px-6 lg:px-8" aria-live="polite">
        <div role="alert" className="rounded-xl border border-border-default bg-surface-raised p-5">
          <h2 className="font-semibold text-text-primary">Deals couldn’t load right now</h2>
          <p className="mt-1 max-w-xl text-sm text-text-secondary">
            You can still browse the marketplace. Try again to see current and upcoming promotions.
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void refetch()}
            className="mt-4"
          >
            Reload promotions
          </Button>
        </div>
      </section>
    );
  }

  return (
    <>
      {current && (
        <section
          id={isUpcomingHero ? 'upcoming-campaigns' : 'active-deals'}
          aria-label={isUpcomingHero ? 'Upcoming campaign' : 'Current promotions'}
          className="mx-auto w-full max-w-7xl px-4 pt-5 sm:px-6 lg:px-8"
        >
          <CampaignSlide campaign={current} isUpcoming={isUpcomingHero} />
          {active.length > 1 && (
            <div className="mt-3 flex justify-end gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Previous campaign"
                onClick={() =>
                  setActiveIndex((index) => (index - 1 + active.length) % active.length)
                }
              >
                <ArrowLeft size={16} aria-hidden="true" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Next campaign"
                onClick={() => setActiveIndex((index) => (index + 1) % active.length)}
              >
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </div>
          )}
        </section>
      )}
      {(isUpcomingHero ? upcoming.slice(1) : upcoming).length > 0 && (
        <section
          aria-labelledby="upcoming-campaigns-title"
          className="mx-auto w-full max-w-7xl px-4 pt-5 sm:px-6 lg:px-8"
        >
          <h2 id="upcoming-campaigns-title" className="text-lg font-semibold text-text-primary">
            Coming soon
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(isUpcomingHero ? upcoming.slice(1) : upcoming).map((campaign) => (
              <article
                key={campaign.campaignId}
                className="flex items-center gap-4 rounded-xl border border-border-default bg-surface-raised p-3"
              >
                <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-surface-subtle">
                  <Image
                    src={campaign.mobileImageUrl || campaign.imageUrl}
                    alt=""
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                    Starts{' '}
                    {new Intl.DateTimeFormat('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      timeZone: 'Asia/Kolkata',
                    }).format(new Date(campaign.startsAt))}
                  </p>
                  <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-text-primary">
                    {campaign.title}
                  </h3>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
