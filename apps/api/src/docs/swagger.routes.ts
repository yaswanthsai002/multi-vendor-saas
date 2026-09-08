import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';

import { openapiSpec } from './openapi.js';

export const swaggerRouter = Router();

// Serve raw OpenAPI 3.1 JSON specification
swaggerRouter.get('/docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(openapiSpec);
});

// Serve interactive Swagger UI documentation
swaggerRouter.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
