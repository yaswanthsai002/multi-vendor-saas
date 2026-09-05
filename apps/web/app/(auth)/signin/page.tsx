import type { Metadata } from 'next';

import { SigninForm } from '@/features/signin/components/signin-form';
import { SigninHero } from '@/features/signin/components/signin-hero';

export const metadata: Metadata = {
  title: 'Sign In | Perigee',
  description: 'Sign in to your Perigee account to access your orders and saved brands.',
};

export default function SigninPage() {
  return (
    <div className="w-full flex-1 flex flex-col md:flex-row items-stretch bg-surface-raised dark:bg-surface transition-colors duration-200">
      {/* Left Column: Hero Showcase (visible on tablet and desktop) */}
      <section
        aria-label="Brand presentation"
        className="hidden md:block md:w-5/12 lg:w-[58%] xl:w-[60%] min-h-150 lg:min-h-205 relative overflow-hidden shrink-0"
      >
        <SigninHero />
      </section>

      {/* Right Column: Authentication Form */}
      <section
        aria-label="Sign in form"
        className="w-full md:w-7/12 lg:w-[42%] xl:w-[40%] flex flex-col justify-center items-center bg-surface-raised dark:bg-surface transition-colors duration-200 py-4 sm:py-8 px-4 sm:px-8 lg:px-12"
      >
        <SigninForm />
      </section>
    </div>
  );
}
