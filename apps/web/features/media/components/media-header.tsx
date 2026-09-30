'use client';

import { UploadCloud } from 'lucide-react';
import * as React from 'react';

interface MediaHeaderProps {
  onOpenUpload: () => void;
}

export function MediaHeader({ onOpenUpload }: MediaHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border-default">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Media Library</h1>
        <p className="text-sm text-text-secondary mt-1">
          Manage your images and videos for use across your products.
        </p>
      </div>
      <div>
        <button
          type="button"
          onClick={onOpenUpload}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-on-accent text-sm font-semibold hover:bg-accent-hover active:bg-accent-active transition-colors shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
        >
          <UploadCloud className="h-4 w-4" />
          <span>Upload media</span>
        </button>
      </div>
    </div>
  );
}
