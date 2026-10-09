'use client';

import { Loader2, Save, Undo } from 'lucide-react';
import * as React from 'react';

import { useUpdateVendorProfile, useVendorProfile } from '../hooks/use-vendor-profile';
import { vendorProfileFormSchema } from '../schemas/vendor-profile.schema';

import { VendorOwnerCard } from './vendor-owner-card';
import { VendorProfileHero } from './vendor-profile-hero';
import { VendorStoreForm } from './vendor-store-form';
import { VendorStoreLinkCard } from './vendor-store-link-card';

export function VendorProfileView() {
  const { data: profile, isLoading, error, refetch } = useVendorProfile();
  const updateMutation = useUpdateVendorProfile();

  // Controlled form states
  const [name, setName] = React.useState('');
  const [tagline, setTagline] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [logoUrl, setLogoUrl] = React.useState('');
  const [bannerUrl, setBannerUrl] = React.useState('');
  const [fullName, setFullName] = React.useState('');

  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

  // Sync state when profile is loaded or refetched
  React.useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setTagline(profile.tagline || '');
      setDescription(profile.description || '');
      setLogoUrl(profile.logoUrl || '');
      setBannerUrl(profile.bannerUrl || '');
      setFullName(profile.user?.fullName || '');
      setFormErrors({});
    }
  }, [profile]);

  // Track if form has unsaved modifications
  const isDirty = React.useMemo(() => {
    if (!profile) return false;
    return (
      name !== (profile.name || '') ||
      tagline !== (profile.tagline || '') ||
      description !== (profile.description || '') ||
      logoUrl !== (profile.logoUrl || '') ||
      bannerUrl !== (profile.bannerUrl || '') ||
      fullName !== (profile.user?.fullName || '')
    );
  }, [profile, name, tagline, description, logoUrl, bannerUrl, fullName]);

  const handleReset = () => {
    if (profile) {
      setName(profile.name || '');
      setTagline(profile.tagline || '');
      setDescription(profile.description || '');
      setLogoUrl(profile.logoUrl || '');
      setBannerUrl(profile.bannerUrl || '');
      setFullName(profile.user?.fullName || '');
      setFormErrors({});
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    // Validate with Zod
    const validation = vendorProfileFormSchema.safeParse({
      name,
      tagline: tagline || undefined,
      description: description || undefined,
      logoUrl: logoUrl || undefined,
      bannerUrl: bannerUrl || undefined,
      fullName,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        const path = issue.path[0];
        if (path && typeof path === 'string') {
          fieldErrors[path] = issue.message;
        }
      }
      setFormErrors(fieldErrors);
      return;
    }

    setFormErrors({});

    await updateMutation.mutateAsync({
      name: name.trim(),
      tagline: tagline.trim() || null,
      description: description.trim() || null,
      logoUrl: logoUrl || null,
      bannerUrl: bannerUrl || null,
      fullName: fullName.trim(),
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-secondary-accent" />
        <p className="text-sm text-text-secondary">Loading vendor profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <div className="p-3 rounded-full bg-danger-subtle text-danger">
          <Loader2 className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-text-primary">Unable to load profile</h2>
          <p className="text-sm text-text-secondary mt-1">
            {error instanceof Error ? error.message : 'An unexpected error occurred.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="px-4 py-2 rounded-lg bg-secondary-accent text-white text-sm font-medium hover:bg-secondary-accent/90 transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Top action bar if dirty */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border-subtle">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Store Profile</h2>
          <p className="text-xs text-text-secondary">
            Manage your public storefront identity, visual assets, and owner details.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleReset}
            disabled={!isDirty || updateMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-border-default transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Undo className="h-3.5 w-3.5" />
            <span>Discard</span>
          </button>

          <button
            type="submit"
            disabled={!isDirty || updateMutation.isPending}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-secondary-accent text-white hover:bg-secondary-accent/90 transition-colors shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>{updateMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Hero Visual Card */}
      <VendorProfileHero
        profile={profile}
        name={name}
        tagline={tagline}
        bannerUrl={bannerUrl}
        logoUrl={logoUrl}
        onBannerChange={setBannerUrl}
        onLogoChange={setLogoUrl}
      />

      {/* Main Grid: Store Details & Sidebar Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Store Form */}
        <div className="lg:col-span-2">
          <VendorStoreForm
            name={name}
            onNameChange={setName}
            slug={profile.slug}
            tagline={tagline}
            onTaglineChange={setTagline}
            description={description}
            onDescriptionChange={setDescription}
            errors={formErrors}
          />
        </div>

        {/* Right Col: Store Link & Owner Info */}
        <div className="space-y-6">
          <VendorStoreLinkCard slug={profile.slug} />
          <VendorOwnerCard
            user={profile.user}
            fullName={fullName}
            onFullNameChange={setFullName}
            error={formErrors.fullName}
          />
        </div>
      </div>
    </form>
  );
}
