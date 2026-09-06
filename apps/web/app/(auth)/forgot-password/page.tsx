import { Suspense } from 'react';

import type { Metadata } from 'next';

import { ForgotPasswordForm } from '@/features/forgot-password/components/forgot-password-form';
import { ForgotPasswordHero } from '@/features/forgot-password/components/forgot-password-hero';
import { ForgotPasswordSkeleton } from '@/features/forgot-password/components/forgot-password-skeleton';

export const metadata: Metadata = {
  title: 'Forgot Password | Perigee',
  description: 'Reset your Perigee account password quickly and securely.',
};

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<ForgotPasswordSkeleton />}>
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch bg-surface-raised dark:bg-surface transition-colors duration-200">
        {/* Left: Brand Presentation Banner */}
        <section
          aria-label="Brand presentation"
          className="hidden md:block md:w-5/12 lg:w-[58%] xl:w-[60%] min-h-150 lg:min-h-205 relative overflow-hidden shrink-0"
        >
          <ForgotPasswordHero />
        </section>

        {/* Right: Forgot Password Form Column */}
        <section
          aria-label="Forgot password form"
          className="w-full md:w-7/12 lg:w-[42%] xl:w-[40%] flex flex-col justify-center items-center bg-surface-raised dark:bg-surface transition-colors duration-200 py-6 sm:py-10 px-4 sm:px-8 lg:px-12"
        >
          <ForgotPasswordForm />
        </section>
      </div>
    </Suspense>
  );
}
