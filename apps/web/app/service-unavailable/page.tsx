import { ArrowRight, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default async function ServiceUnavailablePage({
  searchParams,
}: {
  searchParams: Promise<{ retry?: string }>;
}) {
  const { retry } = await searchParams;
  let retryHref = '/';
  if (retry) {
    try {
      const target = new URL(retry, 'https://perigee.invalid');
      if (target.origin === 'https://perigee.invalid') {
        retryHref = `${target.pathname}${target.search}${target.hash}`;
      }
    } catch {
      // Keep the safe home fallback for malformed retry targets.
    }
  }

  return (
    <section className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
      <div className="w-full max-w-xl rounded-xl border border-border-default bg-surface-raised p-6 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-warning/20 bg-warning-subtle text-warning">
          <ShieldAlert aria-hidden="true" className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
          We can’t check your sign-in right now
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-text-secondary sm:text-base">
          The service that checks your session is temporarily unavailable. Please try again shortly.
        </p>
        <Link
          className="group mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-md border border-transparent bg-accent px-5 text-sm font-medium text-on-accent shadow-sm transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2"
          href={retryHref}
        >
          Try again
          <ArrowRight
            aria-hidden="true"
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          />
        </Link>
        <p className="mt-6 text-xs text-text-tertiary">
          If this keeps happening, wait a moment and try again.
        </p>
      </div>
    </section>
  );
}
