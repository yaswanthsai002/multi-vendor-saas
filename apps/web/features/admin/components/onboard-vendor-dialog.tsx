'use client';

import { Check, Copy, KeyRound, Loader2, Plus, Store, X } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { useOnboardVendor } from '../hooks/use-admin';

import type { OnboardVendorResponse } from '../services/admin.service';

interface OnboardVendorDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardVendorDialog({ isOpen, onClose }: OnboardVendorDialogProps) {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [ownerEmail, setOwnerEmail] = React.useState('');
  const [ownerFullName, setOwnerFullName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isFeatured, setIsFeatured] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  // Success state for newly created credentials
  const [successResult, setSuccessResult] = React.useState<OnboardVendorResponse | null>(null);

  const onboardMutation = useOnboardVendor();

  const resetForm = () => {
    setName('');
    setDescription('');
    setOwnerEmail('');
    setOwnerFullName('');
    setPassword('');
    setIsFeatured(false);
    setSuccessResult(null);
    setCopied(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Store name is required.');
      return;
    }
    if (!ownerEmail.trim()) {
      toast.error('Owner email is required.');
      return;
    }

    try {
      // ponytail: slug and status are omitted — the application handles both
      const result = await onboardMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        ownerEmail: ownerEmail.trim().toLowerCase(),
        ownerFullName: ownerFullName.trim() || undefined,
        password: password.trim() || undefined,
        isFeatured,
      });

      if (result.temporaryPassword) {
        setSuccessResult(result);
      } else {
        handleClose();
      }
    } catch {
      // Error handled by mutation onError
    }
  };

  const copyCredentials = () => {
    if (!successResult) return;
    const text = `Merchant Credentials:\nEmail: ${successResult.owner.email}\nTemporary Password: ${successResult.temporaryPassword}\nStore: ${successResult.vendor.name}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Credentials copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-surface-raised dark:bg-surface rounded-2xl border border-border-default shadow-2xl max-w-lg w-full p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-accent-subtle/50 text-accent flex items-center justify-center shrink-0">
              <Store className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-text-primary">Onboard New Vendor</h3>
              <p className="text-xs text-text-tertiary">
                Provision a verified merchant storefront and owner account.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-text-tertiary hover:text-text-primary p-1 rounded-lg hover:bg-surface-hover cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {successResult && successResult.temporaryPassword ? (
          /* Credentials Presentation View */
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Store Onboarded & Owner Account Provisioned
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                A temporary password was generated for <strong>{successResult.owner.email}</strong>.
                Please securely share these login credentials with the vendor.
              </p>
            </div>

            <div className="space-y-2.5 p-4 rounded-xl bg-surface-subtle border border-border-default">
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>Owner Email:</span>
                <span className="font-mono font-medium text-text-primary select-all">
                  {successResult.owner.email}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-text-tertiary" />
                  Temporary Password:
                </span>
                <span className="font-mono font-bold text-text-primary bg-surface px-2 py-0.5 rounded border border-border-subtle select-all">
                  {successResult.temporaryPassword}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>Store Name:</span>
                <span className="font-medium text-text-primary">{successResult.vendor.name}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>Store Slug:</span>
                <span className="font-mono text-text-tertiary">{successResult.vendor.slug}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={copyCredentials}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-text-primary bg-surface hover:bg-surface-hover border border-border-default transition-colors cursor-pointer"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? 'Copied' : 'Copy Credentials'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-accent hover:bg-accent/90 transition-all cursor-pointer shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Onboarding Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Store Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apex Hardware & Tools"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-surface border border-border-default text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Store Description <span className="text-text-tertiary font-normal">(Optional)</span>
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of the storefront's catalog or specialties..."
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-surface border border-border-default text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Owner Email <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="merchant@example.com"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-surface border border-border-default text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Owner Full Name{' '}
                  <span className="text-text-tertiary font-normal">(For new user)</span>
                </label>
                <input
                  type="text"
                  value={ownerFullName}
                  onChange={(e) => setOwnerFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-surface border border-border-default text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Initial Password <span className="text-text-tertiary font-normal">(Optional)</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to generate secure temporary password"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-surface border border-border-default text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none"
              />
              <p className="text-[11px] text-text-tertiary mt-1">
                If the email already belongs to a registered customer, their existing login
                credentials will be preserved.
              </p>
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-border-default text-accent focus:ring-accent"
                />
                <span className="text-xs font-medium text-text-primary">
                  Mark as Featured Brand on marketplace
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-text-secondary hover:bg-surface-hover border border-border-default transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={onboardMutation.isPending}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-accent hover:bg-accent/90 transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {onboardMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {onboardMutation.isPending ? 'Provisioning...' : 'Onboard Vendor'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
