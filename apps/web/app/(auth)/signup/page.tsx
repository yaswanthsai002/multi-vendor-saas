import type { Metadata } from 'next';

import { SignupForm } from '@/features/signup/components/signup-form';
import { SignupHero } from '@/features/signup/components/signup-hero';

export const metadata: Metadata = {
  title: 'Sign Up | Perigee',
  description: 'Create your Perigee account and start exploring independent brands in close orbit.',
};

export default function SignupPage() {
  return (
    <div className="w-full flex-1 flex flex-col md:flex-row items-stretch bg-surface-raised dark:bg-surface transition-colors duration-200">
      {/* Left Column: Hero Showcase (visible on tablet and desktop) */}
      <section
        aria-label="Brand presentation"
        className="hidden md:block md:w-5/12 lg:w-[58%] xl:w-[60%] min-h-150 lg:min-h-205 relative overflow-hidden shrink-0"
      >
        <SignupHero />
      </section>

      {/* Right Column: Registration Form */}
      <section
        aria-label="Registration form"
        className="w-full md:w-7/12 lg:w-[42%] xl:w-[40%] flex flex-col justify-center items-center bg-surface-raised dark:bg-surface transition-colors duration-200 py-4 sm:py-8 px-4 sm:px-8 lg:px-12"
      >
        <SignupForm />
      </section>
    </div>
  );
}
