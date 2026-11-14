import Link from 'next/link';

import { Button } from '@/components/ui/button';

export function CheckoutErrorPanel({
  message,
  onRetry,
  backHref = '/cart',
  backLabel = 'Back to cart',
}: {
  message: string;
  onRetry?: () => void;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <section
      role="alert"
      className="space-y-3 rounded-lg border border-danger bg-danger-subtle p-4 text-text-primary"
    >
      <p>{message}</p>
      <div className="flex flex-wrap items-center gap-4">
        {onRetry && (
          <Button type="button" variant="outline" onClick={onRetry}>
            Try again
          </Button>
        )}
        <Link href={backHref} className="text-accent underline">
          {backLabel}
        </Link>
      </div>
    </section>
  );
}
