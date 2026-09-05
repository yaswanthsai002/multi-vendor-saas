'use client';

import { ChevronDown, Heart, Menu, Search, ShoppingCart, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import * as React from 'react';

import { ThemeToggle } from './theme-toggle';

const emptySubscribe = () => () => {};

function useIsMounted() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

function PerigeeBrandLogo() {
  const { resolvedTheme } = useTheme();
  const isMounted = useIsMounted();
  const isDark = isMounted && resolvedTheme === 'dark';

  return (
    <Link href="/" className="flex items-center gap-2 shrink-0 group focus-visible:outline-none">
      <Image
        src={isDark ? '/assets/perigee-primary-dark.svg' : '/assets/perigee-primary-light.svg'}
        alt="Perigee"
        width={130}
        height={38}
        priority
        className="h-8 w-auto"
      />
    </Link>
  );
}

interface HeaderProps {
  user?: {
    name: string;
    avatarUrl?: string;
  } | null;
}

export function Header({ user = null }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="w-full bg-surface-raised border-b border-border-default transition-colors duration-200 sticky top-0 z-50">
      {/* Upper Navigation Bar */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-4 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <PerigeeBrandLogo />

        {/* Center: Search Bar */}
        <div className="hidden sm:flex flex-1 max-w-2xl mx-auto px-4 items-center">
          <div className="w-full flex items-center bg-surface hover:bg-surface-hover/80 border border-border-default rounded-md px-3 py-2 text-sm focus-within:ring focus-within:ring-border-focus focus-within:border-border-focus transition-all duration-150 shadow-xs">
            <Search className="h-4 w-4 text-text-tertiary mr-2.5 shrink-0" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search distinctive products, brands..."
              className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:outline-none! focus-visible:outline-none!"
              aria-label="Search products and brands"
            />
          </div>
        </div>

        {/* Right: Utility Actions */}
        <div className="flex items-center gap-3.5 shrink-0">
          {/* Auth State: ONLY Avatar if authenticated, ONLY Sign In if guest */}
          {user ? (
            <button
              type="button"
              className="flex items-center justify-center h-8 w-8 rounded-full border border-border-default bg-surface overflow-hidden"
              aria-label="User profile"
            >
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.name}
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs font-semibold text-text-primary">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </button>
          ) : (
            <Link
              href="/signin"
              className="flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-md hover:bg-surface-hover transition-colors duration-150"
              aria-label="Sign in"
            >
              <span>Sign in</span>
            </Link>
          )}

          {/* Beautiful Sliding Pill Dark/Light Mode Toggle */}
          <ThemeToggle />

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-surface-hover text-text-secondary hover:text-text-primary cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="hidden md:block border-t border-border-subtle bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between text-xs sm:text-sm font-medium text-text-secondary">
          {/* Left Category Links */}
          <nav aria-label="Product categories" className="flex items-center gap-6">
            <button
              type="button"
              className="flex items-center gap-1 hover:text-text-primary transition-colors focus-visible:outline-none"
            >
              Shop <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              className="flex items-center gap-1 hover:text-text-primary transition-colors focus-visible:outline-none"
            >
              Categories <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <Link href="/brands" className="hover:text-text-primary transition-colors">
              Brands
            </Link>
            <Link href="/deals" className="hover:text-text-primary transition-colors">
              Deals
            </Link>
          </nav>

          {/* Right Utility Links */}
          <div className="flex items-center gap-5">
            <Link
              href="/wishlist"
              className="flex items-center gap-1.5 hover:text-text-primary transition-colors"
            >
              <Heart className="h-3.5 w-3.5" />
              <span>Wishlist</span>
            </Link>
            {/* Cart Icon with Counter Badge */}
            <Link
              href="/cart"
              className="relative p-2 rounded-md hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors duration-150"
              aria-label="Shopping Cart (2 items)"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute top-0.5 right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-accent rounded-full ring-2 ring-surface-raised">
                2
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border-default bg-surface-raised px-4 pt-3 pb-5 space-y-3">
          <div className="sm:hidden flex items-center gap-2 px-3 py-2 rounded-md border border-border-default bg-surface focus-within:ring-2 focus-within:ring-border-focus focus-within:border-border-focus transition-all duration-150">
            <Search className="h-4 w-4 text-text-tertiary shrink-0" />
            <input
              type="search"
              placeholder="Search products, brands..."
              className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:outline-none focus-visible:outline-none"
              aria-label="Search products and brands"
            />
          </div>

          <nav className="flex flex-col space-y-2 pt-2 text-sm font-medium text-text-secondary">
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 rounded hover:bg-surface-hover hover:text-text-primary"
            >
              Shop All
            </Link>
            <Link
              href="/categories"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 rounded hover:bg-surface-hover hover:text-text-primary"
            >
              Categories
            </Link>
            <Link
              href="/brands"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 rounded hover:bg-surface-hover hover:text-text-primary"
            >
              Brands
            </Link>
            <Link
              href="/deals"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 rounded hover:bg-surface-hover hover:text-text-primary"
            >
              Deals
            </Link>
            <Link
              href="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 rounded hover:bg-surface-hover hover:text-text-primary flex items-center gap-2"
            >
              Wish List
            </Link>
            <Link
              href="/cart"
              className="relative p-2 rounded-md hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors duration-150"
              aria-label="Shopping Cart (2 items)"
            >
              Cart
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
