import { Suspense } from 'react';

import type { Metadata } from 'next';

import { ResetPasswordForm } from '@/features/reset-password/components/reset-password-form';
import { ResetPasswordHero } from '@/features/reset-password/components/reset-password-hero';
import { ResetPasswordSkeleton } from '@/features/reset-password/components/reset-password-skeleton';

export const metadata: Metadata = {
  title: 'Reset Password | Perigee',
  description: 'Choose a new password to restore access to your Perigee account.',
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordSkeleton />}>
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch bg-surface-raised dark:bg-surface transition-colors duration-200">
        {/* Left: Brand Presentation Banner */}
        <section
          aria-label="Brand presentation"
          className="hidden md:block md:w-5/12 lg:w-[58%] xl:w-[60%] min-h-150 lg:min-h-205 relative overflow-hidden shrink-0"
        >
          <ResetPasswordHero />
        </section>

        {/* Right: Reset Password Form Column */}
        <section
          aria-label="Reset password form"
          className="w-full md:w-7/12 lg:w-[42%] xl:w-[40%] flex flex-col justify-center items-center bg-surface-raised dark:bg-surface transition-colors duration-200 py-6 sm:py-10 px-4 sm:px-8 lg:px-12"
        >
          <ResetPasswordForm />
        </section>
      </div>
    </Suspense>
  );
}
