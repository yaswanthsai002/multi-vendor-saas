import type { ReactNode } from 'react';

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">{title}</h1>
      <div className="mt-8 space-y-8 text-base leading-7 text-text-secondary">{children}</div>
    </article>
  );
}
