'use client';

import { CheckCircle2, Mail, User } from 'lucide-react';
import * as React from 'react';

import type { VendorProfileUser } from '../types/vendor-profile.types';

interface VendorOwnerCardProps {
  user: VendorProfileUser;
  fullName: string;
  onFullNameChange: (val: string) => void;
  error?: string;
}

export function VendorOwnerCard({ user, fullName, onFullNameChange, error }: VendorOwnerCardProps) {
  return (
    <div className="rounded-xl bg-surface border border-border-default p-5 shadow-xs flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
        <User className="h-4 w-4 text-secondary-accent" />
        <span>Owner Identity</span>
      </div>

      <div className="space-y-3.5">
        {/* Full Name Input */}
        <div>
          <label
            htmlFor="ownerFullName"
            className="block text-xs font-medium text-text-secondary mb-1"
          >
            Full Name <span className="text-danger">*</span>
          </label>
          <input
            id="ownerFullName"
            type="text"
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
            className={`w-full px-3 py-2 text-sm rounded-lg bg-surface-subtle border ${
              error
                ? 'border-danger focus:ring-danger'
                : 'border-border-default focus:ring-border-focus'
            } text-text-primary focus:outline-none focus:ring-2 transition-colors`}
            placeholder="Your full name"
            maxLength={100}
          />
          {error && <p className="text-xs text-danger mt-1">{error}</p>}
        </div>

        {/* Read-only Email */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="ownerEmail" className="block text-xs font-medium text-text-secondary">
              Email Address
            </label>
            {user.emailVerifiedAt && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </span>
            )}
          </div>
          <div className="relative">
            <input
              id="ownerEmail"
              type="email"
              value={user.email}
              readOnly
              disabled
              className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-lg bg-surface-hover/60 border border-border-subtle text-text-tertiary cursor-not-allowed select-all"
            />
            <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-text-tertiary" />
          </div>
        </div>
      </div>
    </div>
  );
}
