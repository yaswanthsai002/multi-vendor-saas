import { Plus } from 'lucide-react';
import Link from 'next/link';

import { CampaignManager } from '@/features/admin/components/campaign-manager';

export default function AdminCampaignsPage() {
  return (
    <div className="space-y-6 pb-12">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            Campaigns
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Schedule marketplace campaigns and product deals.
          </p>
        </div>
        <Link
          href="/admin/campaigns/editor"
          className="inline-flex cursor-pointer items-center gap-2 self-start rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-on-accent shadow-xs transition-colors hover:bg-accent-hover sm:self-auto"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Create campaign
        </Link>
      </header>
      <CampaignManager />
    </div>
  );
}
