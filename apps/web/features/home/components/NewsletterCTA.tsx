'use client';

import { Mail, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function NewsletterCTA() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <section
      aria-label="First-order discount sign-up"
      className="w-full bg-background py-8 sm:py-12"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-accent/20 bg-linear-to-br from-surface-raised via-surface-raised to-accent/5 p-6 sm:p-10 lg:p-12 shadow-sm">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              NEW CUSTOMER PERK
            </span>

            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-text-primary sm:text-3xl lg:text-4xl">
              Get ₹200 Off Your First Order!
            </h2>

            <p className="mt-2 text-xs text-text-secondary sm:text-sm lg:text-base">
              Join over 100,000+ shoppers. Receive instant access to weekend flash deals, exclusive
              seller drops, and a flat ₹200 welcome voucher.
            </p>

            {submitted ? (
              <div className="mt-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 p-4 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                🎉 Congratulations! Your ₹200 discount code &ldquo;WELCOME200&rdquo; has been
                activated.
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-center"
              >
                <div className="relative flex-1 max-w-md">
                  <Mail
                    className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
                    aria-hidden="true"
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="h-11 w-full rounded-xl border border-border-default bg-surface-raised pl-10 pr-4 text-xs font-medium text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 sm:text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="h-11 cursor-pointer rounded-xl bg-accent px-6 text-xs font-bold text-on-accent transition-colors hover:bg-accent-hover active:bg-accent-active sm:text-sm"
                >
                  Claim ₹200 Off →
                </button>
              </form>
            )}

            <p className="mt-3 text-[11px] text-text-tertiary">
              No spam guaranteed • Valid on orders above ₹999 • Instant voucher
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
