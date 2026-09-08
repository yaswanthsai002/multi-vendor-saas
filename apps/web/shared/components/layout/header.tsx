'use client';

import { Heart, ShoppingCart, User as UserIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import { HeaderDeliveryAddress } from './header-delivery-address';
import { HeaderNavBar } from './header-nav-bar';
import { HeaderSearch } from './header-search';
import { HeaderUserMenu } from './header-user-menu';
import { useHeader } from './use-header';

export interface HeaderProps {
  initialCartCount?: number;
}

function PerigeeBrandLogo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus rounded-md"
      aria-label="Perigee Home"
    >
      <Image
        src="/assets/perigee-primary-light.svg"
        alt="Perigee"
        width={130}
        height={34}
        priority
        className="block dark:hidden h-7 sm:h-8 w-auto"
      />
      <Image
        src="/assets/perigee-primary-dark.svg"
        alt="Perigee"
        width={130}
        height={34}
        priority
        className="hidden dark:block h-7 sm:h-8 w-auto"
      />
    </Link>
  );
}

export function Header({ initialCartCount }: HeaderProps) {
  const { user, isLoading, searchQuery, setSearchQuery, cartCount } = useHeader({
    initialCartCount,
  });

  return (
    <header className="w-full bg-surface-raised border-b border-border-default transition-colors duration-200 sticky top-0 z-50">
      {/* ========================================================================= */}
      {/* DESKTOP HEADER (>= 768px / md:)                                           */}
      {/* ========================================================================= */}
      <div className="hidden md:flex flex-col">
        {/* Main Desktop Upper Navigation Bar */}
        <div className="max-w-11/12 mx-auto px-4 lg:px-8 h-16 w-full flex items-center justify-between gap-6">
          {/* Left: Brand Logo + Desktop Delivery Address Selector */}
          <div className="flex items-center gap-4 shrink-0">
            <PerigeeBrandLogo />
            <HeaderDeliveryAddress variant="desktop" />
          </div>

          {/* Center: Search Bar */}
          <div className="flex flex-1 max-w-2xl items-center mx-auto">
            <HeaderSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search products, brands & categories..."
            />
          </div>

          {/* Right: Utility Actions (Wishlist, Cart, User Menu / Signin) */}
          <div className="flex items-center gap-5 shrink-0">
            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              className="flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus rounded-md px-1 py-1"
            >
              <Heart className="h-4 w-4" aria-hidden="true" />
              <span>Wishlist</span>
            </Link>

            {/* Cart Icon with Dynamic Counter Badge */}
            <Link
              href="/cart"
              className="relative p-2 rounded-lg hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
              aria-label={`Shopping Cart (${cartCount} items)`}
            >
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 inline-flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold leading-none text-white bg-accent rounded-full ring-2 ring-surface-raised">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account: Loading skeleton, User Avatar Menu, or Signin Text Link */}
            {isLoading ? (
              <div
                className="h-9 w-9 rounded-full bg-surface-subtle animate-pulse border border-border-subtle"
                aria-label="Loading profile"
              />
            ) : user ? (
              <HeaderUserMenu user={user} />
            ) : (
              <Link
                href="/signin"
                className="text-sm font-semibold text-text-primary hover:text-accent transition-colors px-2.5 py-1.5 rounded-lg hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
              >
                Signin
              </Link>
            )}
          </div>
        </div>

        {/* Sub Navigation Bar (Desktop) */}
        <HeaderNavBar />
      </div>

      {/* ========================================================================= */}
      {/* MOBILE & TABLET HEADER (< 768px / md:hidden)                              */}
      {/* ========================================================================= */}
      <div className="flex md:hidden flex-col w-full">
        {/* Row 1: Brand Logo + Actions (Wishlist, Cart, Profile) */}
        <div className="px-3.5 pt-3 pb-2 flex items-center justify-between">
          <PerigeeBrandLogo />

          <div className="flex items-center gap-3">
            {/* Wishlist Icon Link */}
            <Link
              href="/wishlist"
              className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" aria-hidden="true" />
            </Link>

            {/* Cart Icon with dynamic badge */}
            <Link
              href="/cart"
              className="relative p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
              aria-label={`Shopping Cart (${cartCount} items)`}
            >
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold leading-none text-white bg-accent rounded-full ring-2 ring-surface-raised">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account / Profile */}
            {isLoading ? (
              <div className="h-8 w-8 rounded-full bg-surface-subtle animate-pulse border border-border-subtle" />
            ) : user ? (
              <HeaderUserMenu user={user} />
            ) : (
              <Link
                href="/signin"
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                aria-label="Account sign in"
              >
                <UserIcon className="h-5 w-5" aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>

        {/* Row 2: Search Bar */}
        <div className="px-3.5 pb-2">
          <HeaderSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search products, brands & categories..."
          />
        </div>

        {/* Row 3: Deliver to Location */}
        <div className="px-3.5 pb-2">
          <HeaderDeliveryAddress variant="mobile" />
        </div>

        {/* Row 4: Sub Navigation Bar */}
        <HeaderNavBar />
      </div>
    </header>
  );
}
