'use client';

import { Camera, Image as ImageIcon, Store } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';

import type { VendorProfile } from '../types/vendor-profile.types';
import type { MediaItem } from '@/features/media/types/media.types';

import { MediaPickerModal } from '@/features/media/components/media-picker-modal';

interface VendorProfileHeroProps {
  profile: VendorProfile;
  name: string;
  tagline: string;
  bannerUrl: string;
  logoUrl: string;
  onBannerChange: (url: string) => void;
  onLogoChange: (url: string) => void;
}

export function VendorProfileHero({
  profile,
  name,
  tagline,
  bannerUrl,
  logoUrl,
  onBannerChange,
  onLogoChange,
}: VendorProfileHeroProps) {
  const [pickerTarget, setPickerTarget] = React.useState<'banner' | 'logo' | null>(null);

  const handleMediaConfirmed = (selectedList: MediaItem[]) => {
    const item = selectedList[0];
    if (item) {
      const url = item.original;
      if (pickerTarget === 'banner') {
        onBannerChange(url);
      } else if (pickerTarget === 'logo') {
        onLogoChange(url);
      }
    }
    setPickerTarget(null);
  };

  const statusColors =
    {
      active: 'bg-success-subtle text-success border-success/20',
      pending: 'bg-warning-subtle text-warning border-warning/20',
      suspended: 'bg-danger-subtle text-danger border-danger/20',
      rejected: 'bg-danger-subtle text-danger border-danger/20',
    }[profile.status] || 'bg-surface-subtle text-text-tertiary border-border-subtle';

  const displayName = name.trim() || profile.name || 'Untitled Store';

  return (
    <div className="relative rounded-2xl bg-surface border border-border-default overflow-hidden shadow-xs">
      {/* Banner / Cover Section with Hover Overlay */}
      <div className="relative h-44 sm:h-56 w-full bg-gradient-to-r from-secondary-accent/15 via-accent/10 to-surface-subtle overflow-hidden group">
        {bannerUrl ? (
          <Image
            src={bannerUrl}
            alt={`${displayName} cover banner`}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-text-tertiary">
            <div className="flex items-center gap-2 text-xs font-medium bg-surface/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-border-subtle">
              <ImageIcon className="h-4 w-4" />
              <span>No cover banner set (Rec: 1200 × 400px, 3:1)</span>
            </div>
          </div>
        )}

        {/* Hover-to-update overlay on banner */}
        <button
          type="button"
          onClick={() => setPickerTarget('banner')}
          className="absolute inset-0 bg-black/15 hover:bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
          aria-label="Change store banner"
        >
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface/90 dark:bg-surface-raised/90 text-text-primary text-xs font-medium shadow-md backdrop-blur-xs border border-border-default hover:scale-105 transition-transform">
            <Camera className="h-3.5 w-3.5 text-secondary-accent" />
            <span>{bannerUrl ? 'Change Banner' : 'Upload Banner'}</span>
            <span className="text-[10px] text-text-tertiary">1200 × 400px</span>
          </div>
        </button>

        {/* Recommended dimension chip in top-right for quick reference */}
        <div className="absolute top-3 right-3 pointer-events-none group-hover:opacity-0 transition-opacity">
          <span className="px-2.5 py-1 rounded-md bg-surface/80 backdrop-blur-xs text-text-secondary text-[11px] font-medium border border-border-subtle shadow-xs">
            1200 × 400px
          </span>
        </div>
      </div>

      {/* Profile Header Bar */}
      <div className="px-6 pb-6 pt-0 relative">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-4">
          {/* Logo with change trigger & dimension hint */}
          <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-2xl border-4 border-surface bg-surface-raised shadow-md overflow-hidden shrink-0 group">
            {logoUrl ? (
              <Image src={logoUrl} alt={`${displayName} logo`} fill className="object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-secondary-accent/10 text-secondary-accent">
                <Store className="h-10 w-10" />
              </div>
            )}

            <button
              type="button"
              onClick={() => setPickerTarget('logo')}
              className="absolute inset-0 bg-black/15 hover:bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
              aria-label="Change store logo"
            >
              <div className="p-2 rounded-full bg-surface/90 dark:bg-surface-raised/90 text-text-primary shadow-md backdrop-blur-xs border border-border-default hover:scale-110 transition-transform">
                <Camera className="h-4 w-4 text-secondary-accent" />
              </div>
            </button>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border uppercase tracking-wider ${statusColors}`}
            >
              {profile.status}
            </span>
          </div>
        </div>

        {/* Store Title & Slug preview (live reflection while typing) */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
            {displayName}
          </h1>
          <p className="text-xs font-mono text-text-tertiary mt-0.5">@{profile.slug}</p>
          {tagline && <p className="text-sm text-text-secondary mt-1.5 font-normal">{tagline}</p>}
        </div>
      </div>

      {/* Media Picker Modal */}
      {pickerTarget && (
        <MediaPickerModal
          open={Boolean(pickerTarget)}
          onClose={() => setPickerTarget(null)}
          onConfirm={handleMediaConfirmed}
          title={
            pickerTarget === 'banner'
              ? 'Select Store Banner (1200 × 400px)'
              : 'Select Store Logo (400 × 400px)'
          }
          description="Choose an image asset from your library or upload a new one."
          acceptedType="image"
          multiple={false}
        />
      )}
    </div>
  );
}
