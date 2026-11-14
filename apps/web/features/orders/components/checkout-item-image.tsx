'use client';

import { Package } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export function CheckoutItemImage({
  src,
  name,
  compact = false,
}: {
  src: string | null;
  name: string;
  compact?: boolean;
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-lg ${compact ? 'h-8 w-8' : 'h-16 w-16 sm:h-24 sm:w-24'}`}
    >
      {src && failedSource !== src ? (
        <Image
          src={src}
          alt={name}
          fill
          sizes={compact ? '32px' : '(min-width: 640px) 112px, 80px'}
          className="object-contain"
          onError={() => setFailedSource(src)}
        />
      ) : (
        <div
          className="flex h-full items-center justify-center"
          role="img"
          aria-label={`No image available for ${name}`}
        >
          <Package className="h-6 w-6 text-text-tertiary" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
