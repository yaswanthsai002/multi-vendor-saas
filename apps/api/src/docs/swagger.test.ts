import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '../app.js';

describe('Swagger Documentation Endpoints (/api/docs)', () => {
  it('should serve raw OpenAPI 3.1 JSON specification at GET /api/docs.json', async () => {
    const res = await request(app).get('/api/docs.json');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/json');
    expect(res.body.openapi).toBe('3.1.0');
    expect(res.body.info.title).toBe('Perigee REST API');
    expect(res.body.components.securitySchemes).toEqual({
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'auth_token',
        description: 'HTTP-only session JWT cookie issued upon signin or OAuth completion.',
      },
    });

    // Verify critical documented paths exist
    expect(res.body.paths).toHaveProperty('/');
    expect(res.body.paths).toHaveProperty('/api/auth/signup');
    expect(res.body.paths).toHaveProperty('/api/auth/signin');
    expect(res.body.paths).toHaveProperty('/api/auth/signout');
    expect(res.body.paths).toHaveProperty('/api/auth/me');
    expect(res.body.paths).toHaveProperty('/api/auth/send-otp');
    expect(res.body.paths).toHaveProperty('/api/auth/verify-otp');
    expect(res.body.paths).toHaveProperty('/api/auth/verification-status');
    expect(res.body.paths).toHaveProperty('/api/auth/reset-password');
    expect(res.body.paths).toHaveProperty('/api/auth/google');
    expect(res.body.paths).toHaveProperty('/api/auth/google/callback');
  });

  it('should serve Swagger UI HTML page at GET /api/docs/', async () => {
    const res = await request(app).get('/api/docs/');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).toContain('swagger-ui');
  });
});
