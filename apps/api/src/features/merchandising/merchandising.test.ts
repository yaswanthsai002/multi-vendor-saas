import { inspect } from 'node:util';

import { beforeEach, describe, expect, it, vi } from 'vitest';

const { query, select } = vi.hoisted(() => {
  const query = {
    from: vi.fn(),
    where: vi.fn(),
    limit: vi.fn(),
  };
  query.from.mockReturnValue(query);
  query.where.mockReturnValue(query);
  query.limit.mockResolvedValue([]);
  const select = vi.fn(() => query);
  return { query, select };
});

vi.mock('@repo/db', () => ({ getDb: () => ({ select }) }));

import { campaignListQuerySchema, createPromotionDraftSchema } from './merchandising.schema.js';
import { getPromotionDraft } from './merchandising.service.js';

describe('promotion draft ownership', () => {
  beforeEach(() => vi.clearAllMocks());

  it('does not return a draft when the session owner does not match', async () => {
    const ownerUserId = 'another-admin-id';
    await expect(
      getPromotionDraft(ownerUserId, '00000000-0000-4000-8000-000000000001'),
    ).rejects.toMatchObject({ statusCode: 404, code: 'PROMOTION_DRAFT_NOT_FOUND' });
    expect(query.where).toHaveBeenCalledOnce();
    expect(inspect(query.where.mock.calls[0]?.[0], { depth: null })).toContain(ownerUserId);
  });
});

describe('campaign admin request schemas', () => {
  it('defaults campaign listing to all statuses and rejects unknown filters', () => {
    expect(campaignListQuerySchema.parse({})).toEqual({ status: 'all' });
    expect(campaignListQuerySchema.safeParse({ status: 'archived' }).success).toBe(false);
  });

  it('uses sourceCampaignId when creating a draft from an existing campaign', () => {
    expect(
      createPromotionDraftSchema.safeParse({
        sourceCampaignId: '00000000-0000-4000-8000-000000000001',
      }).success,
    ).toBe(true);
    expect(createPromotionDraftSchema.safeParse({ campaignId: 'not-a-uuid' }).success).toBe(false);
  });
});
