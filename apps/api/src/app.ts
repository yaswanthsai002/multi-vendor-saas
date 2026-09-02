import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { errorHandler } from './shared/middleware/errorHandler.js';
import { notFoundHandler } from './shared/middleware/notFound.js';

const app = express();

app.disable('x-powered-by');

app.use(helmet());

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

app.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
  });
});

// Catch-all handler for unmatched routes (returns 404)
app.use(notFoundHandler);

// Global error handler MUST be the last middleware in the pipeline
app.use(errorHandler);

export default app;
