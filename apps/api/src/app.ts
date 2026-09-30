import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { apiRouter } from './routes.js';
import { errorHandler } from './shared/middleware/errorHandler.js';
import { notFoundHandler } from './shared/middleware/notFound.js';
import { storageService } from './shared/storage/storage.service.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../.env') });
config();

const app = express();

app.disable('x-powered-by');

// ponytail: allow frontend on port 3000 to load media assets from port 4000
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

app.use(morgan('dev'));

app.use(
  cors({
    origin: process.env.WEB_ORIGIN,
    credentials: true,
  }),
);

// Statically serve media library files
app.use(
  '/media',
  express.static(storageService.getStorageRoot(), {
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Access-Control-Allow-Origin', process.env.WEB_ORIGIN || '*');
    },
  }),
);

app.use(
  express.json({
    limit: '1mb',
  }),
);

app.use(
  express.urlencoded({
    extended: false,
    limit: '1mb',
  }),
);

app.use(cookieParser());

app.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
  });
});

// Mount the main API router under /api prefix
app.use('/api', apiRouter);

// Catch-all handler for unmatched routes (returns 404)
app.use(notFoundHandler);

// Global error handler MUST be the last middleware in the pipeline
app.use(errorHandler);

export default app;
