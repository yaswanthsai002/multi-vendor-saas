import Image from 'next/image';

export function SigninHero() {
  return (
    <div className="relative w-full h-full min-h-[500px] lg:min-h-full overflow-hidden bg-surface-subtle select-none">
      {/* Background Image */}
      <Image
        src="/images/signup-hero.jpg"
        alt="Curated artisan goods and products on display in a sunlit studio"
        fill
        priority
        sizes="(min-width: 1024px) 60vw, 100vw"
        className="object-cover object-bottom transition-all duration-300 dark:brightness-85"
      />

      {/* Subtle contrast overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-black/25 dark:from-black/50 dark:via-black/20 dark:to-black/60 pointer-events-none" />

      {/* Hero Typography */}
      <div className="relative z-10 w-full max-w-xl p-8 sm:p-12 lg:p-16 pt-12 lg:pt-20">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-text-primary dark:text-white leading-[1.15] drop-shadow-xs">
          Welcome back to Perigee.
        </h1>
        <p className="mt-3 text-base sm:text-lg text-text-secondary dark:text-gray-200 leading-relaxed font-normal drop-shadow-xs">
          Discover, support, and connect with distinctive independent brands.
        </p>
      </div>
    </div>
  );
}
