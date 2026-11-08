import Image from 'next/image';
import Link from 'next/link';

import type { ReactNode } from 'react';

export function MarketingBanner({
  eyebrow,
  title,
  subtitle,
  imageUrl,
  mobileImageUrl,
  ctaLabel,
  href,
  viewport = 'responsive',
  preview = false,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  mobileImageUrl?: string;
  ctaLabel: string;
  href?: string;
  viewport?: 'responsive' | 'desktop' | 'mobile';
  preview?: boolean;
  children?: ReactNode;
}) {
  const mobileImage = mobileImageUrl || imageUrl;
  const hasImage = Boolean(imageUrl || mobileImageUrl);

  return (
    <article
      className={`relative isolate overflow-hidden rounded-2xl border border-border-default bg-surface-subtle ${preview ? 'h-full' : 'min-h-80 sm:min-h-96 lg:min-h-112'}`}
      style={preview ? { aspectRatio: viewport === 'mobile' ? '1 / 1' : '2.4 / 1' } : undefined}
    >
      {imageUrl && viewport !== 'mobile' && (
        <Image
          src={imageUrl}
          alt=""
          fill
          priority={!preview}
          sizes={preview ? '100vw' : '100vw'}
          className={`z-0 object-cover ${viewport === 'responsive' ? 'hidden md:block' : ''}`}
        />
      )}
      {mobileImage && viewport !== 'desktop' && (
        <Image
          src={mobileImage}
          alt=""
          fill
          priority={!preview}
          sizes={preview ? '100vw' : '100vw'}
          className={`z-0 object-cover ${viewport === 'responsive' ? 'md:hidden' : ''}`}
        />
      )}
      {hasImage && (
        <div className="absolute inset-0 z-10 bg-linear-to-r from-surface-raised/90 via-surface-raised/60 to-transparent" />
      )}
      <div
        className={`absolute inset-0 z-20 flex items-center ${preview ? 'p-4' : 'p-4 sm:p-8 lg:p-10'}`}
      >
        <div
          className={`min-w-0 max-w-full text-text-primary ${preview ? 'w-fit max-w-xs space-y-1.5' : 'max-w-xl space-y-4'}`}
        >
          {eyebrow && (
            <p
              className={`min-w-0 text-xs font-medium text-text-secondary ${preview ? 'line-clamp-1' : ''}`}
            >
              {eyebrow}
            </p>
          )}
          <h2
            className={`min-w-0 wrap-anywhere font-semibold leading-tight ${preview ? 'line-clamp-2 text-lg sm:text-xl' : 'text-3xl sm:text-4xl lg:text-5xl'}`}
          >
            {title || 'Promotion headline'}
          </h2>
          {subtitle && (
            <p
              className={`min-w-0 leading-relaxed text-text-secondary ${preview ? 'line-clamp-1 wrap-anywhere text-xs' : 'max-w-lg text-sm sm:text-base'}`}
            >
              {subtitle}
            </p>
          )}
          {(ctaLabel || children) && (
            <div
              className={`flex min-w-0 max-w-full flex-wrap items-center ${preview ? 'gap-2 pt-0.5' : 'gap-3 pt-1'}`}
            >
              {ctaLabel &&
                (preview || !href ? (
                  <span
                    className={`inline-flex max-w-full items-center justify-center rounded-md bg-accent-active py-1 text-center font-semibold leading-tight text-on-accent ${preview ? 'min-h-8 wrap-anywhere px-3 text-xs' : 'min-h-10 px-4 text-sm sm:min-h-11 sm:px-5'}`}
                  >
                    {ctaLabel}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className="inline-flex min-h-10 max-w-full items-center justify-center whitespace-normal wrap-anywhere rounded-md bg-accent-active px-4 text-center text-sm font-semibold leading-tight text-on-accent sm:min-h-11 sm:px-5"
                  >
                    {ctaLabel}
                  </Link>
                ))}
              {children}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
