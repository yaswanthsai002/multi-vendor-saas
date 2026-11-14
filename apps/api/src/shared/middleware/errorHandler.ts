import { randomUUID } from 'node:crypto';

import { z, ZodError } from 'zod';

import { AppError } from '../errors/AppError.js';

import type { Request, Response, NextFunction } from 'express';

const infrastructureCodes = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  'ENOTFOUND',
  'EPIPE',
]);

function errorDiagnostics(error: unknown, depth = 0): object | undefined {
  if (typeof error !== 'object' || error === null || depth >= 3) return undefined;
  const code = 'code' in error && typeof error.code === 'string' ? error.code : undefined;
  return {
    type:
      error instanceof Error && /^[A-Za-z][A-Za-z0-9]*Error$/.test(error.name)
        ? error.name
        : 'Error',
    code: code && (/^[0-9A-Z]{5}$/.test(code) || infrastructureCodes.has(code)) ? code : undefined,
    // Arbitrary messages, SQL, driver details and cause messages can contain credentials or PII.
    frames:
      error instanceof Error
        ? error.stack
            ?.split('\n')
            .flatMap((line) => {
              if (!/^\s+at /.test(line)) return [];
              const location = line.match(
                /(?:\(|\s)((?:file:\/\/\/|[A-Za-z]:[\\/]|\/|node:)[^()\r\n]*:\d+:\d+)\)?$/,
              );
              return location ? [location[1]] : [];
            })
            .slice(0, 12)
        : undefined,
    cause: 'cause' in error ? errorDiagnostics(error.cause, depth + 1) : undefined,
  };
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const requestId = randomUUID();
  const isValidation = err instanceof ZodError;
  const isApplication = err instanceof AppError;
  const externalStatus = z
    .object({ status: z.number().optional(), statusCode: z.number().optional() })
    .safeParse(err);
  const proposedStatus = isValidation
    ? 400
    : isApplication
      ? err.statusCode
      : externalStatus.success
        ? (externalStatus.data.status ?? externalStatus.data.statusCode ?? 500)
        : 500;
  const status =
    Number.isInteger(proposedStatus) && proposedStatus >= 400 && proposedStatus < 600
      ? proposedStatus
      : 500;
  const code = isValidation ? 'VALIDATION_ERROR' : isApplication ? err.code : 'REQUEST_FAILED';
  const level = status >= 500 ? 'error' : 'warn';
  const route: unknown = req.route?.path;
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event: 'request_failed',
    requestId,
    method: req.method,
    // Route templates exclude customer identifiers, query strings and submitted data.
    route: typeof route === 'string' ? route : 'unmatched',
    status,
    code,
    message: isValidation
      ? 'Request validation failed'
      : isApplication
        ? 'Application request failed'
        : 'Unexpected request failure',
    validation: isValidation
      ? {
          issueCount: err.issues.length,
          codes: [...new Set(err.issues.map((issue) => issue.code))],
        }
      : undefined,
    error: status >= 500 ? errorDiagnostics(err) : undefined,
  };
  console[level](JSON.stringify(entry));
  res.setHeader('X-Request-Id', requestId);
  if (isValidation) {
    return res
      .status(status)
      .json({ code, error: 'Validation Error', details: z.treeifyError(err), requestId });
  }
  if (isApplication) {
    return res.status(status).json({ code, error: err.message, details: err.details, requestId });
  }
  return res
    .status(status)
    .json({ code, error: 'Unable to complete this request. Please try again.', requestId });
}
