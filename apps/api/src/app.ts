import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { apiRouter } from './routes.js';
import { errorHandler } from './shared/middleware/errorHandler.js';
import { notFoundHandler } from './shared/middleware/notFound.js';

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(morgan('dev'));
app.use(
  cors({
    origin: process.env.WEB_ORIGIN,
    credentials: true,
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

// Mount the main API router under /api prefix
app.use('/api', apiRouter);

// Catch-all handler for unmatched routes (returns 404)
app.use(notFoundHandler);

// Global error handler MUST be the last middleware in the pipeline
app.use(errorHandler);

export default app;
