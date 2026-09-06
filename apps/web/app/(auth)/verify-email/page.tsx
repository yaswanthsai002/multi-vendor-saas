import { Suspense } from 'react';

import type { Metadata } from 'next';

import { VerifyEmailForm } from '@/features/verify-email/components/verify-email-form';
import { VerifyEmailHero } from '@/features/verify-email/components/verify-email-hero';
import { VerifyEmailSkeleton } from '@/features/verify-email/components/verify-email-skeleton';

export const metadata: Metadata = {
  title: 'Verify Your Email | Perigee',
  description: 'Enter your 6-digit verification code to confirm your email address on Perigee.',
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailSkeleton />}>
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch bg-surface-raised dark:bg-surface transition-colors duration-200">
        {/* Left: Brand Presentation Banner */}
        <section
          aria-label="Brand presentation"
          className="hidden md:block md:w-5/12 lg:w-[58%] xl:w-[60%] min-h-150 lg:min-h-205 relative overflow-hidden shrink-0"
        >
          <VerifyEmailHero />
        </section>

        {/* Right: Verification Form Column */}
        <section
          aria-label="Email verification form"
          className="w-full md:w-7/12 lg:w-[42%] xl:w-[40%] flex flex-col justify-center items-center bg-surface-raised dark:bg-surface transition-colors duration-200 py-6 sm:py-10 px-4 sm:px-8 lg:px-12"
        >
          <VerifyEmailForm />
        </section>
      </div>
    </Suspense>
  );
}
