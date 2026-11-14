import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '../app.js';

describe('Swagger Documentation Endpoints (/api/docs)', () => {
  it('documents customer checkout headers, safe order contracts and vendor transitions', async () => {
    const { body } = await request(app).get('/api/docs.json');
    const paths = body.paths;
    for (const path of [
      '/api/customer/checkout/review',
      '/api/customer/orders',
      '/api/customer/orders/{orderId}',
      '/api/customer/orders/{orderId}/cancel',
      '/api/vendor/orders',
      '/api/vendor/orders/{vendorOrderId}',
      '/api/vendor/orders/{vendorOrderId}/status',
    ])
      expect(paths).toHaveProperty(path);
    expect(paths['/api/customer/orders'].post.parameters).toContainEqual(
      expect.objectContaining({ name: 'Idempotency-Key', in: 'header', required: true }),
    );
    expect(paths['/api/customer/orders'].post.responses['409']).toBeDefined();
    expect(paths['/api/customer/orders'].get.parameters).toContainEqual(
      expect.objectContaining({ name: 'limit', schema: expect.objectContaining({ maximum: 100 }) }),
    );
    for (const name of ['status', 'orderedFrom', 'orderedTo']) {
      expect(paths['/api/customer/orders'].get.parameters).toContainEqual(
        expect.objectContaining({ name, in: 'query' }),
      );
    }
    expect(paths['/api/vendor/orders/{vendorOrderId}/status'].post.description).toContain(
      'processing → completed only',
    );
    const schema = body.components.schemas.CustomerOrder;
    expect(JSON.stringify(schema)).not.toMatch(/vendorOrderId|requestFingerprint|passwordHash/);
    // Resolve every local reference so schema changes cannot silently break Swagger.
    function references(value: unknown): void {
      if (!value || typeof value !== 'object') return;
      if ('$ref' in value && typeof value.$ref === 'string' && value.$ref.startsWith('#/')) {
        const target = value.$ref
          .slice(2)
          .split('/')
          .reduce((node: Record<string, unknown>, key: string) => {
            expect(node).toHaveProperty(key);
            return node[key] as Record<string, unknown>;
          }, body);
        expect(target).toBeDefined();
      }
      for (const nested of Object.values(value)) references(nested);
    }
    references(body);
  });
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
    expect(res.body.paths).toHaveProperty('/api/health/live');
    expect(res.body.paths).toHaveProperty('/api/health/ready');
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
    expect(res.body.paths).toHaveProperty('/api/vendor/products');
    expect(res.body.paths).toHaveProperty('/api/vendor/products/{productId}');
    expect(
      res.body.paths['/api/products'].get.responses['200'].content['application/json'].schema.$ref,
    ).toBe('#/components/schemas/CatalogProductsResponse');
    expect(
      res.body.paths['/api/products/{slug}'].get.responses['200'].content['application/json'].schema
        .$ref,
    ).toBe('#/components/schemas/CatalogProductResponse');
    expect(
      res.body.paths['/api/products/facets'].get.responses['200'].content['application/json'].schema
        .$ref,
    ).toBe('#/components/schemas/CatalogFacetsResponse');
    expect(
      res.body.components.schemas.CartResponse.properties.items.items.oneOf[1].properties.price
        .description,
    ).toContain('active published campaign deal');
  });

  it('should serve Swagger UI HTML page at GET /api/docs/', async () => {
    const res = await request(app).get('/api/docs/');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).toContain('swagger-ui');
  });
});
