import { getReadinessStatus } from './health.service.js';

import type { Request, Response } from 'express';

export function getLiveness(_req: Request, res: Response) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
  });
}

export async function getReadiness(_req: Request, res: Response) {
  const health = await getReadinessStatus();

  res.status(health.status === 'ok' ? 200 : 503).json(health);
}
