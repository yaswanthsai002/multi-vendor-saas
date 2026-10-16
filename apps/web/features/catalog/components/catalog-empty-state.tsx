import { SearchX, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface CatalogEmptyStateProps {
  hasFilters: boolean;
  onResetFilters: () => void;
}

export function CatalogEmptyState({ hasFilters, onResetFilters }: CatalogEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-default bg-surface/40 p-8 sm:p-12 text-center my-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent mb-4">
        <SearchX className="h-7 w-7" aria-hidden="true" />
      </div>

      <h3 className="text-lg font-bold text-text-primary sm:text-xl">
        {hasFilters ? 'No matching products found' : 'No products available'}
      </h3>

      <p className="mt-2 max-w-md text-xs text-text-secondary sm:text-sm">
        {hasFilters
          ? 'Try adjusting your search query, clearing some filter attributes, or removing price constraints to find what you are looking for.'
          : 'Our marketplace vendors are stocking up new arrivals. Please check back shortly.'}
      </p>

      {hasFilters && (
        <div className="mt-5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            className="flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Reset all filters</span>
          </Button>
        </div>
      )}
    </div>
  );
}
