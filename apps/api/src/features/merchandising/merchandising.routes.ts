import { Router } from 'express';

import { requireAdmin } from '../../shared/middleware/requireAdmin.js';
import { verifyToken } from '../../shared/middleware/verifyToken.js';

import {
  completePromotionDraftBanner,
  createPromotionDraft,
  discardPromotionDraft,
  getPromotionDraft,
  getHomepageCampaigns,
  listCampaigns,
  publishPromotionDraft,
  savePromotionDraft,
  uploadPromotionDraftBanner,
} from './merchandising.controller.js';

export const merchandisingRouter = Router();

merchandisingRouter.get('/merchandising/homepage', getHomepageCampaigns);
merchandisingRouter.get('/admin/campaigns', verifyToken, requireAdmin, listCampaigns);
merchandisingRouter.post('/admin/campaigns', verifyToken, requireAdmin, createPromotionDraft);
merchandisingRouter.get(
  '/admin/campaigns/:campaignId',
  verifyToken,
  requireAdmin,
  getPromotionDraft,
);
merchandisingRouter.put(
  '/admin/campaigns/:campaignId',
  verifyToken,
  requireAdmin,
  savePromotionDraft,
);
merchandisingRouter.delete(
  '/admin/campaigns/:campaignId',
  verifyToken,
  requireAdmin,
  discardPromotionDraft,
);
merchandisingRouter.patch(
  '/admin/campaigns/:campaignId',
  verifyToken,
  requireAdmin,
  publishPromotionDraft,
);
merchandisingRouter.post(
  '/admin/campaigns/:campaignId/banners/:slot',
  verifyToken,
  requireAdmin,
  uploadPromotionDraftBanner,
);
merchandisingRouter.post(
  '/admin/campaigns/:campaignId/banners/:slot/complete',
  verifyToken,
  requireAdmin,
  completePromotionDraftBanner,
);
