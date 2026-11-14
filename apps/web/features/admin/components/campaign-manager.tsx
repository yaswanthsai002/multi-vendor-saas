'use client';

import { CalendarClock, Pencil } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

import { useAdminCampaigns, useAdminPromotionDrafts } from '../hooks/use-admin';

import type { AdminCampaign } from '../services/admin.service';

function promotionState(promotion: AdminCampaign) {
  const now = Date.now();
  if (!promotion.published) return 'Draft';
  if (new Date(promotion.startsAt).getTime() > now) return 'Scheduled';
  if (new Date(promotion.endsAt).getTime() > now) return 'Live';
  return 'Ended';
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function CampaignManager() {
  const { data, isLoading, isError, refetch } = useAdminCampaigns();
  const draftsQuery = useAdminPromotionDrafts();
  const promotions = data?.items ?? [];
  const drafts = draftsQuery.data?.items ?? [];

  return (
    <section
      aria-labelledby="promotion-list-title"
      className="space-y-4 rounded-2xl border border-border-default bg-surface-raised p-4 sm:p-6"
    >
      <div>
        <h2 id="promotion-list-title" className="text-lg font-bold text-text-primary">
          All campaigns
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Draft, scheduled, live, and ended campaigns.
        </p>
      </div>

      {isLoading || draftsQuery.isLoading ? (
        <div
          aria-label="Loading promotions"
          className="h-24 animate-pulse rounded-lg bg-surface-subtle"
        />
      ) : isError || draftsQuery.isError ? (
        <div role="alert" className="rounded-lg border border-border-default p-4">
          <h3 className="font-semibold text-text-primary">Campaigns are temporarily unavailable</h3>
          <p className="mt-1 max-w-xl text-sm text-text-secondary">
            We couldn’t retrieve campaigns and drafts. Check your connection, then reload the list.
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mt-4"
            onClick={() => {
              void refetch();
              void draftsQuery.refetch();
            }}
          >
            Reload campaigns
          </Button>
        </div>
      ) : promotions.length === 0 && drafts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-default p-6 text-center">
          <p className="font-medium text-text-primary">No promotions created yet</p>
          <p className="mt-1 text-sm text-text-secondary">
            Create one to schedule a banner and product deals.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-border-default md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-subtle text-xs uppercase tracking-wide text-text-secondary">
                <tr>
                  <th className="px-4 py-3">Promotion</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Display order</th>
                  <th className="px-4 py-3">Schedule</th>
                  <th className="px-4 py-3">Products</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {drafts.map((draft) => (
                  <tr key={draft.draftId}>
                    <td className="px-4 py-3 font-medium text-text-primary">
                      {draft.payload.title?.trim() || 'Untitled promotion'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-warning-subtle px-2 py-1 text-xs font-medium text-warning">
                        Draft
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {(draft.payload.position ?? 0) + 1}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {draft.payload.startsAt && draft.payload.endsAt
                        ? `${formatDate(draft.payload.startsAt)} – ${formatDate(draft.payload.endsAt)}`
                        : 'Not scheduled'}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {draft.payload.products?.length ?? 0}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        className="text-sm font-semibold text-accent hover:underline"
                        href={`/admin/campaigns/editor?draftId=${draft.draftId}`}
                      >
                        Continue editing
                      </Link>
                    </td>
                  </tr>
                ))}
                {promotions.map((promotion) => (
                  <tr key={promotion.campaignId}>
                    <td className="px-4 py-3 font-medium text-text-primary">{promotion.title}</td>
                    <td className="px-4 py-3 text-text-secondary">{promotionState(promotion)}</td>
                    <td className="px-4 py-3 text-text-secondary">{promotion.position + 1}</td>
                    <td className="px-4 py-3 text-text-secondary">
                      {formatDate(promotion.startsAt)} – {formatDate(promotion.endsAt)}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{promotion.products.length}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        className="text-sm font-semibold text-accent hover:underline"
                        href={`/admin/campaigns/editor?campaignId=${promotion.campaignId}`}
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="divide-y divide-border-subtle rounded-xl border border-border-default md:hidden">
            {drafts.map((draft) => (
              <article
                key={draft.draftId}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-semibold text-text-primary">
                      {draft.payload.title?.trim() || 'Untitled promotion'}
                    </h3>
                    <span className="rounded-full bg-warning-subtle px-2 py-0.5 text-xs font-medium text-warning">
                      Draft
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">
                    {draft.payload.products?.length ?? 0} products · Display order{' '}
                    {(draft.payload.position ?? 0) + 1}
                  </p>
                </div>
                <Link
                  href={`/admin/campaigns/editor?draftId=${draft.draftId}`}
                  className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border border-border-default bg-surface-raised px-2 text-xs font-medium text-text-primary hover:bg-surface-hover"
                >
                  <Pencil size={14} aria-hidden="true" />
                  Continue editing
                </Link>
              </article>
            ))}
            {promotions.map((promotion) => (
              <article
                key={promotion.campaignId}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-semibold text-text-primary">{promotion.title}</h3>
                    <span className="rounded-full bg-surface-subtle px-2 py-0.5 text-xs font-medium text-text-secondary">
                      {promotionState(promotion)}
                    </span>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-text-secondary">
                    <CalendarClock size={14} aria-hidden="true" />
                    {promotion.products.length} products · Display order {promotion.position + 1} ·{' '}
                    {formatDate(promotion.startsAt)} – {formatDate(promotion.endsAt)}
                  </p>
                </div>
                <Link
                  href={`/admin/campaigns/editor?campaignId=${promotion.campaignId}`}
                  className="inline-flex h-8 cursor-pointer items-center justify-center gap-2 rounded-md border border-border-default bg-surface-raised px-2 text-xs font-medium text-text-primary transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                >
                  <Pencil size={14} aria-hidden="true" />
                  Edit
                </Link>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
