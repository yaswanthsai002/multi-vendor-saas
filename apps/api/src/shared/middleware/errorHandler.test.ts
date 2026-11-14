import express from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { AppError } from '../errors/AppError.js';

import { errorHandler } from './errorHandler.js';

function failingApp(error: unknown) {
  const app = express();
  app.get('/orders/:orderId', (_req, _res, next) => next(error));
  app.use(errorHandler);
  return app;
}

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe('request failure logging', () => {
  it('logs known application failures once, with status, code and matching response ID', async () => {
    const response = await request(failingApp(new AppError(409, 'CART_CHANGED', 'Review cart')))
      .get('/orders/customer-private-id?token=private-token')
      .set('Authorization', 'Bearer private-credential');
    expect(response.status).toBe(409);
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.error).not.toHaveBeenCalled();
    const entry = JSON.parse(vi.mocked(console.warn).mock.calls[0][0]);
    expect(entry).toMatchObject({
      level: 'warn',
      status: 409,
      code: 'CART_CHANGED',
      method: 'GET',
      route: '/orders/:orderId',
      requestId: response.body.requestId,
    });
    expect(response.headers['x-request-id']).toBe(entry.requestId);
    expect(JSON.stringify(entry)).not.toMatch(/private|Bearer|Review cart/);
  });

  it('logs validation counts and codes without submitted values or custom messages', async () => {
    const parsed = z
      .object({ email: z.email('private validation message') })
      .safeParse({ email: 'private-value' });
    if (parsed.success) throw new Error('Expected validation failure');
    const response = await request(failingApp(parsed.error)).get('/orders/private-id');
    expect(response.status).toBe(400);
    const entry = JSON.parse(vi.mocked(console.warn).mock.calls[0][0]);
    expect(entry).toMatchObject({
      code: 'VALIDATION_ERROR',
      validation: { issueCount: 1, codes: ['invalid_format'] },
    });
    expect(JSON.stringify(entry)).not.toContain('private');
  });

  it('logs 5xx cause codes and stack frames without SQL, error messages or credentials', async () => {
    const cause = Object.assign(new Error('password=private-password'), {
      code: '23505',
      detail: 'private-email@example.test',
      query: 'private SQL',
    });
    const error = new Error('Failed query: private SQL\n    at private-password', { cause });
    const response = await request(failingApp(error)).get('/orders/private-id');
    expect(response.status).toBe(500);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.warn).not.toHaveBeenCalled();
    const entry = JSON.parse(vi.mocked(console.error).mock.calls[0][0]);
    expect(entry).toMatchObject({
      status: 500,
      error: { type: 'Error', cause: { code: '23505' } },
    });
    expect(entry.error.frames.length).toBeGreaterThan(0);
    expect(JSON.stringify(entry)).not.toMatch(/private|password|Failed query/);
    expect(JSON.stringify(response.body)).not.toMatch(/23505|private|stack|cause/);
  });

  it('handles cyclic causes and invalid status codes without breaking error responses', async () => {
    const error = Object.assign(new Error('private-message', { cause: undefined }), {
      status: 599.5,
    });
    error.cause = error;
    const response = await request(failingApp(error)).get('/orders/private-id');
    expect(response.status).toBe(500);
    expect(
      JSON.parse(vi.mocked(console.error).mock.calls[0][0]).error.cause.cause.cause,
    ).toBeUndefined();
  });

  it('logs server-side AppError failures at error severity and preserves safe response contract', async () => {
    const response = await request(
      failingApp(new AppError(503, 'STORAGE_UNAVAILABLE', 'Please try again')),
    ).get('/orders/1');
    expect(response.status).toBe(503);
    expect(JSON.parse(vi.mocked(console.error).mock.calls[0][0])).toMatchObject({
      level: 'error',
      code: 'STORAGE_UNAVAILABLE',
      status: 503,
    });
    expect(response.body.error).toBe('Please try again');
  });
});
