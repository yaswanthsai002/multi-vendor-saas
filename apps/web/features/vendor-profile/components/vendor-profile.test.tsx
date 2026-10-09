import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { VendorOwnerCard } from './vendor-owner-card';
import { VendorProfileHero } from './vendor-profile-hero';
import { VendorStoreForm } from './vendor-store-form';
import { VendorStoreLinkCard } from './vendor-store-link-card';

import type { VendorProfile } from '../types/vendor-profile.types';

const mockProfile: VendorProfile = {
  vendorId: '11111111-2222-3333-4444-555555555555',
  name: 'Acme Crafts Studio',
  slug: 'acme-crafts',
  tagline: 'Handmade pottery and clay goods',
  description: 'We design modern ceramics for home and kitchen.',
  logoUrl: 'https://example.com/logo.jpg',
  bannerUrl: 'https://example.com/banner.jpg',
  status: 'active',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  user: {
    userId: '99999999-8888-7777-6666-555555555555',
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    roles: ['vendor', 'customer'],
    emailVerifiedAt: '2026-01-01T00:00:00.000Z',
  },
};

describe('Vendor Profile UI Components', () => {
  afterEach(() => {
    cleanup();
  });

  describe('VendorProfileHero', () => {
    it('renders store name, slug, tagline, and status badge', () => {
      render(
        <VendorProfileHero
          profile={mockProfile}
          name={mockProfile.name}
          tagline={mockProfile.tagline!}
          bannerUrl={mockProfile.bannerUrl!}
          logoUrl={mockProfile.logoUrl!}
          onBannerChange={vi.fn()}
          onLogoChange={vi.fn()}
        />,
      );

      expect(screen.getByRole('heading', { name: 'Acme Crafts Studio' })).toBeDefined();
      expect(screen.getByText('@acme-crafts')).toBeDefined();
      expect(screen.getByText('Handmade pottery and clay goods')).toBeDefined();
      expect(screen.getByText('active')).toBeDefined();
    });

    it('displays live updated store name and recommended dimension chips', () => {
      render(
        <VendorProfileHero
          profile={mockProfile}
          name="Live Pottery Shop"
          tagline="New tagline"
          bannerUrl={mockProfile.bannerUrl!}
          logoUrl={mockProfile.logoUrl!}
          onBannerChange={vi.fn()}
          onLogoChange={vi.fn()}
        />,
      );

      expect(screen.getByRole('heading', { name: 'Live Pottery Shop' })).toBeDefined();
      expect(screen.getByText('New tagline')).toBeDefined();
      expect(screen.getAllByText('1200 × 400px').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('VendorStoreLinkCard', () => {
    it('renders store slug and copy action', async () => {
      render(<VendorStoreLinkCard slug="acme-crafts" />);

      expect(screen.getByText(/Public Storefront/i)).toBeDefined();
      expect(screen.getByText(/\/store\/acme-crafts/i)).toBeDefined();
      expect(screen.getByRole('button', { name: /copy storefront link/i })).toBeDefined();
    });
  });

  describe('VendorOwnerCard', () => {
    it('renders owner name input, read-only email, and verified status', () => {
      const handleNameChange = vi.fn();
      render(
        <VendorOwnerCard
          user={mockProfile.user}
          fullName="Jane Doe"
          onFullNameChange={handleNameChange}
        />,
      );

      expect(screen.getByLabelText(/Full Name/i)).toBeDefined();
      const emailInput = screen.getByLabelText(/Email Address/i) as HTMLInputElement;
      expect(emailInput.value).toBe('jane@example.com');
      expect(emailInput.disabled).toBe(true);
      expect(screen.getByText('Verified')).toBeDefined();
    });

    it('triggers name change callback when owner updates full name', async () => {
      const user = userEvent.setup();
      const handleNameChange = vi.fn();
      render(
        <VendorOwnerCard
          user={mockProfile.user}
          fullName="Jane"
          onFullNameChange={handleNameChange}
        />,
      );

      const nameInput = screen.getByLabelText(/Full Name/i);
      await user.type(nameInput, ' Doe');
      expect(handleNameChange).toHaveBeenCalled();
    });
  });

  describe('VendorStoreForm', () => {
    it('renders store name, read-only slug, tagline, and description', () => {
      render(
        <VendorStoreForm
          name="Acme Crafts"
          onNameChange={vi.fn()}
          slug="acme-crafts"
          tagline="Best pottery"
          onTaglineChange={vi.fn()}
          description="Handmade pottery"
          onDescriptionChange={vi.fn()}
          errors={{}}
        />,
      );

      expect(screen.getByLabelText(/Store Name/i)).toBeDefined();
      const slugInput = screen.getByLabelText(/Store Handle/i) as HTMLInputElement;
      expect(slugInput.value).toBe('acme-crafts');
      expect(slugInput.disabled).toBe(true);
      expect(screen.getByLabelText(/Tagline/i)).toBeDefined();
      expect(screen.getByLabelText(/About the Store/i)).toBeDefined();
    });

    it('renders field validation errors when present', () => {
      render(
        <VendorStoreForm
          name=""
          onNameChange={vi.fn()}
          slug="acme-crafts"
          tagline=""
          onTaglineChange={vi.fn()}
          description=""
          onDescriptionChange={vi.fn()}
          errors={{
            name: 'Store name must be at least 2 characters.',
          }}
        />,
      );

      expect(screen.getByText('Store name must be at least 2 characters.')).toBeDefined();
    });
  });
});
