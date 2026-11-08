import { AppError } from '../../shared/errors/AppError.js';

import {
  campaignListQuerySchema,
  campaignBannerUploadSchema,
  createPromotionDraftSchema,
  promotionDraftBannerParamsSchema,
  promotionDraftIdParamsSchema,
  promotionDraftPayloadSchema,
} from './merchandising.schema.js';
import * as merchandisingService from './merchandising.service.js';

import type { AuthenticatedRequest } from '../../shared/middleware/verifyToken.js';
import type { NextFunction, Request, Response } from 'express';

export async function getHomepageCampaigns(_req: Request, res: Response, next: NextFunction) {
  try {
    return res.status(200).json(await merchandisingService.getHomepageCampaigns());
  } catch (error) {
    return next(error);
  }
}

export async function listCampaigns(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { status } = campaignListQuerySchema.parse(req.query);
    const [items, drafts] = await Promise.all([
      status === 'draft' ? [] : merchandisingService.listCampaigns(),
      status === 'published' ? [] : merchandisingService.listPromotionDrafts(adminUserId(req)),
    ]);
    return res.status(200).json({ items, drafts });
  } catch (error) {
    return next(error);
  }
}

function adminUserId(req: AuthenticatedRequest) {
  if (typeof req.user?.sub !== 'string') {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
  }
  return req.user.sub;
}

export async function createPromotionDraft(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { sourceCampaignId } = createPromotionDraftSchema.parse(req.body);
    const draft = await merchandisingService.createPromotionDraft(
      adminUserId(req),
      sourceCampaignId,
    );
    return res.status(201).json({ draft });
  } catch (error) {
    return next(error);
  }
}

export async function getPromotionDraft(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { campaignId } = promotionDraftIdParamsSchema.parse(req.params);
    return res
      .status(200)
      .json({ draft: await merchandisingService.getPromotionDraft(adminUserId(req), campaignId) });
  } catch (error) {
    return next(error);
  }
}

export async function savePromotionDraft(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { campaignId } = promotionDraftIdParamsSchema.parse(req.params);
    const payload = promotionDraftPayloadSchema.parse(req.body);
    const draft = await merchandisingService.savePromotionDraft(
      adminUserId(req),
      campaignId,
      payload,
    );
    return res.status(200).json({ draft });
  } catch (error) {
    return next(error);
  }
}

export async function discardPromotionDraft(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { campaignId } = promotionDraftIdParamsSchema.parse(req.params);
    await merchandisingService.discardPromotionDraft(adminUserId(req), campaignId);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

export async function publishPromotionDraft(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { campaignId } = promotionDraftIdParamsSchema.parse(req.params);
    const campaign = await merchandisingService.publishPromotionDraft(adminUserId(req), campaignId);
    return res.status(200).json({ campaign });
  } catch (error) {
    return next(error);
  }
}

export async function uploadPromotionDraftBanner(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { campaignId, slot } = promotionDraftBannerParamsSchema.parse(req.params);
    const metadata = campaignBannerUploadSchema.parse(req.body);
    const result = await merchandisingService.initiateCampaignBannerUpload(
      adminUserId(req),
      campaignId,
      slot,
      metadata,
    );
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function completePromotionDraftBanner(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { campaignId, slot } = promotionDraftBannerParamsSchema.parse(req.params);
    const result = await merchandisingService.completeCampaignBannerUpload(
      adminUserId(req),
      campaignId,
      slot,
      req.body,
    );
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}
