import { Router } from 'express';

import { getLiveness, getReadiness } from './health.controller.js';

const healthRouter = Router();

healthRouter.get('/live', getLiveness);
healthRouter.get('/ready', getReadiness);

export default healthRouter;
