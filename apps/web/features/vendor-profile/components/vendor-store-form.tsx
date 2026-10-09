'use client';

import { Building, Info } from 'lucide-react';
import * as React from 'react';

interface VendorStoreFormProps {
  name: string;
  onNameChange: (val: string) => void;
  slug: string;
  tagline: string;
  onTaglineChange: (val: string) => void;
  description: string;
  onDescriptionChange: (val: string) => void;
  errors: Record<string, string>;
}

export function VendorStoreForm({
  name,
  onNameChange,
  slug,
  tagline,
  onTaglineChange,
  description,
  onDescriptionChange,
  errors,
}: VendorStoreFormProps) {
  return (
    <div className="rounded-xl bg-surface border border-border-default p-6 shadow-xs flex flex-col gap-6">
      <div className="flex items-center gap-2 text-base font-semibold text-text-primary border-b border-border-subtle pb-3">
        <Building className="h-5 w-5 text-secondary-accent" />
        <span>Store Details</span>
      </div>

      <div className="space-y-4">
        {/* Store Name & Readonly Slug Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Store Name */}
          <div>
            <label
              htmlFor="storeName"
              className="block text-xs font-medium text-text-secondary mb-1"
            >
              Store Name <span className="text-danger">*</span>
            </label>
            <input
              id="storeName"
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              className={`w-full px-3 py-2 text-sm rounded-lg bg-surface-subtle border ${
                errors.name
                  ? 'border-danger focus:ring-danger'
                  : 'border-border-default focus:ring-border-focus'
              } text-text-primary focus:outline-none focus:ring-2 transition-colors`}
              placeholder="Store display name"
              maxLength={100}
            />
            {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
          </div>

          {/* Store Handle / Slug (Immutable) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="storeSlug" className="block text-xs font-medium text-text-secondary">
                Store Handle
              </label>
              <span className="text-[11px] text-text-tertiary">Read-only</span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-mono text-text-tertiary select-none">
                @
              </span>
              <input
                id="storeSlug"
                type="text"
                value={slug}
                readOnly
                disabled
                className="w-full pl-7 pr-3 py-2 text-xs font-mono rounded-lg bg-surface-hover/60 border border-border-subtle text-text-tertiary cursor-not-allowed select-all"
              />
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="storeTagline" className="block text-xs font-medium text-text-secondary">
              Tagline
            </label>
            <span className="text-[11px] text-text-tertiary">{tagline.length}/150</span>
          </div>
          <input
            id="storeTagline"
            type="text"
            value={tagline}
            onChange={(e) => onTaglineChange(e.target.value)}
            className={`w-full px-3 py-2 text-sm rounded-lg bg-surface-subtle border ${
              errors.tagline
                ? 'border-danger focus:ring-danger'
                : 'border-border-default focus:ring-border-focus'
            } text-text-primary focus:outline-none focus:ring-2 transition-colors`}
            placeholder="A short punchy headline about your store"
            maxLength={150}
          />
          {errors.tagline && <p className="text-xs text-danger mt-1">{errors.tagline}</p>}
        </div>

        {/* Description / About */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="storeDescription"
              className="block text-xs font-medium text-text-secondary"
            >
              About the Store
            </label>
            <span className="text-[11px] text-text-tertiary">{description.length}/1000</span>
          </div>
          <textarea
            id="storeDescription"
            rows={4}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className={`w-full px-3 py-2 text-sm rounded-lg bg-surface-subtle border ${
              errors.description
                ? 'border-danger focus:ring-danger'
                : 'border-border-default focus:ring-border-focus'
            } text-text-primary focus:outline-none focus:ring-2 transition-colors resize-y`}
            placeholder="Tell customers about your story, craft, and mission..."
            maxLength={1000}
          />
          {errors.description && <p className="text-xs text-danger mt-1">{errors.description}</p>}
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-text-secondary">
        <Info className="h-4 w-4 text-secondary-accent shrink-0 mt-0.5" />
        <p>
          Store details are displayed directly on your public marketplace storefront and order
          confirmations.
        </p>
      </div>
    </div>
  );
}
