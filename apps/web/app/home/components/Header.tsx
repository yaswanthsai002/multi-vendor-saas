'use client';

import { Heart, ShoppingCart, User, Info, ChevronDown } from 'lucide-react';
import Image from 'next/image';

import BrandLogo from '@/assets/perigee-primary-light.svg';

export default function Header() {
  return (
    <header className="w-full bg-white text-[#222]">
      {/* Top Header */}
      <div className="border-b border-[#e9e9e9]">
        <div className="mx-auto flex h-[58px] max-w-[1440px] items-center gap-6 px-6">
          {/* Logo */}
          <div className="flex shrink-0 items-center">
            <Image
              src={BrandLogo}
              alt="Perigee"
              priority
              width={128}
              height={32}
              className="h-7 w-auto object-contain"
            />
          </div>

          {/* Search */}
          <div className="relative max-w-[360px] flex-1">
            <input
              type="text"
              placeholder="Search distinctive products, brands..."
              className="h-[32px] w-full rounded-[4px] border border-[#e5e5e5] bg-[#fafafa] px-3 text-[11px] outline-none placeholder:text-[#999] focus:border-[#bbb]"
            />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Info */}
          <button className="text-[#555] transition hover:text-black">
            <Info size={15} strokeWidth={1.7} />
          </button>

          {/* User */}
          <button className="flex items-center gap-1.5 text-[#555] transition hover:text-black">
            <User size={17} strokeWidth={1.7} />
          </button>

          {/* Wishlist */}
          <button className="relative text-[#555] transition hover:text-black">
            <Heart size={18} strokeWidth={1.7} />
          </button>

          {/* Cart */}
          <button className="relative text-[#555] transition hover:text-black">
            <ShoppingCart size={18} strokeWidth={1.7} />

            <span className="absolute -right-2 -top-2 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-[#d86f45] px-1 text-[8px] font-semibold text-white">
              2
            </span>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-[#ededed]">
        <div className="mx-auto flex h-[42px] max-w-[1440px] items-center justify-between px-6">
          {/* Main Navigation */}
          <nav className="flex h-full items-center gap-7">
            <button className="flex items-center gap-1 text-[11px] font-medium">
              Shop
              <ChevronDown size={11} strokeWidth={1.8} />
            </button>

            <button className="flex items-center gap-1 text-[11px] font-medium">
              Categories
              <ChevronDown size={11} strokeWidth={1.8} />
            </button>

            <button className="text-[11px] font-medium">Brands</button>

            <button className="text-[11px] font-medium">Deals</button>
          </nav>

          {/* Secondary Navigation */}
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-1.5 text-[11px] font-medium">
              <Heart size={14} strokeWidth={1.7} />
              Wish List
            </button>

            <button className="flex items-center gap-1.5 text-[11px] font-medium">
              <ShoppingCart size={14} strokeWidth={1.7} />
              Cart
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
