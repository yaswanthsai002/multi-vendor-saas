'use client';

import { Check, Copy, ExternalLink, Globe } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

interface VendorStoreLinkCardProps {
  slug: string;
}

export function VendorStoreLinkCard({ slug }: VendorStoreLinkCardProps) {
  const [copied, setCopied] = React.useState(false);

  // Derive public URL
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const storeUrl = `${origin}/store/${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      toast.success('Store URL copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="rounded-xl bg-surface border border-border-default p-5 shadow-xs flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
        <Globe className="h-4 w-4 text-secondary-accent" />
        <span>Public Storefront</span>
      </div>

      <p className="text-xs text-text-secondary leading-relaxed">
        Your store URL is permanently bound to your verified store handle.
      </p>

      <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-subtle border border-border-subtle">
        <span className="text-xs font-mono text-text-secondary truncate flex-1 select-all">
          {storeUrl || `/store/${slug}`}
        </span>

        <button
          type="button"
          onClick={handleCopy}
          className="p-1.5 rounded-md hover:bg-surface text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          title="Copy storefront link"
          aria-label="Copy storefront link"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-success" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>

        <a
          href={`/store/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-md hover:bg-surface text-text-secondary hover:text-text-primary transition-colors"
          title="Open storefront in new tab"
          aria-label="Open storefront in new tab"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
