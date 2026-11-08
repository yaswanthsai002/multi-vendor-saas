import { PromotionEditor } from '@/features/admin/components/promotion-editor';

export default async function CampaignEditorPage({
  searchParams,
}: {
  searchParams: Promise<{ campaignId?: string; draftId?: string }>;
}) {
  const { campaignId, draftId } = await searchParams;
  return <PromotionEditor campaignId={campaignId} draftId={draftId} />;
}
