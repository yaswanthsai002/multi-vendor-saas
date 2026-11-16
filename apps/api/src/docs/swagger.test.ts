import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import request from 'supertest';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import app from '../app.js';
import { signupSchema } from '../features/auth/auth.schema.js';
import { createProductSchema, updateProductSchema } from '../features/vendor/vendor.schema.js';

import { openapiSpec } from './openapi.js';

const httpMethods = new Set(['get', 'post', 'put', 'patch', 'delete', 'options', 'head']);

function mountedOperations(filename: string, routerName: string, prefix = ''): string[] {
  const source = ts.createSourceFile(
    filename,
    readFileSync(filename, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  const imports = new Map<string, { filename: string; routerName: string }>();
  for (const statement of source.statements) {
    if (ts.isExportAssignment(statement) && ts.isIdentifier(statement.expression)) {
      if (routerName === 'default') routerName = statement.expression.text;
    }
    if (!ts.isImportDeclaration(statement) || !statement.importClause) continue;
    if (!ts.isStringLiteral(statement.moduleSpecifier)) continue;
    const specifier = statement.moduleSpecifier.text;
    if (!specifier.startsWith('.')) continue;
    const importedFile = resolve(dirname(filename), specifier.replace(/\.js$/, '.ts'));
    const clause = statement.importClause;
    if (clause.name) {
      imports.set(clause.name.text, { filename: importedFile, routerName: 'default' });
    }
    if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
      for (const binding of clause.namedBindings.elements) {
        imports.set(binding.name.text, {
          filename: importedFile,
          routerName: (binding.propertyName ?? binding.name).text,
        });
      }
    }
  }

  const operations: string[] = [];
  function rejectUnsupportedChains(node: ts.Node): void {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression) &&
      node.expression.expression.text === routerName &&
      node.expression.name.text === 'route'
    ) {
      throw new Error(`Add chained route support to this check: ${filename}`);
    }
    ts.forEachChild(node, rejectUnsupportedChains);
  }
  rejectUnsupportedChains(source);
  for (const statement of source.statements) {
    if (!ts.isExpressionStatement(statement) || !ts.isCallExpression(statement.expression))
      continue;
    const call = statement.expression;
    if (!ts.isPropertyAccessExpression(call.expression)) continue;
    const receiver = call.expression.expression;
    if (!ts.isIdentifier(receiver) || receiver.text !== routerName) continue;
    const method = call.expression.name.text;
    if (method === 'route') throw new Error(`Add chained route support to this check: ${filename}`);
    if (method !== 'use' && !httpMethods.has(method)) continue;
    const first = call.arguments[0];
    const routePath = first && ts.isStringLiteral(first) ? first.text : '';
    const fullPath = `${prefix}/${routePath}`.replace(/\/+/g, '/').replace(/\/$/, '');
    if (httpMethods.has(method)) {
      if (!first || !ts.isStringLiteral(first)) {
        throw new Error(`Add dynamic path support to this check: ${filename}`);
      }
      operations.push(`${method.toUpperCase()} ${fullPath.replace(/:(\w+)/g, '{$1}')}`);
    } else {
      for (const argument of call.arguments) {
        if (!ts.isIdentifier(argument)) continue;
        const imported = imports.get(argument.text);
        if (!imported || !/(?:\.routes|[/\\]routes)\.ts$/.test(imported.filename)) continue;
        operations.push(...mountedOperations(imported.filename, imported.routerName, fullPath));
      }
    }
  }
  return operations;
}

describe('Swagger Documentation Endpoints (/api/docs)', () => {
  it('keeps product and signup request constraints aligned with their runtime validators', () => {
    for (const { runtime, documented } of [
      {
        runtime: createProductSchema,
        documented: openapiSpec.components.schemas.CreateProductInput,
      },
      {
        runtime: updateProductSchema,
        documented: openapiSpec.components.schemas.UpdateProductInput,
      },
      { runtime: signupSchema, documented: openapiSpec.components.schemas.SignUpInput },
    ]) {
      const { $schema: _schema, ...expected } = z.toJSONSchema(runtime, { io: 'input' });
      expect(documented).toMatchObject(expected);
    }
  });
  it('documents every mounted business operation without stale paths or methods', () => {
    const actual = mountedOperations(
      fileURLToPath(new URL('../app.ts', import.meta.url)),
      'app',
    ).filter((operation) => !/^GET \/api\/docs(?:\.json)?$/.test(operation));
    const documented = Object.entries(openapiSpec.paths).flatMap(([path, item]) =>
      Object.keys(item)
        .filter((method) => httpMethods.has(method))
        .map((method) => `${method.toUpperCase()} ${path}`),
    );
    expect(actual.length).toBeGreaterThan(0);
    expect(new Set(actual).size).toBe(actual.length);
    expect(documented.sort()).toEqual(actual.sort());
  });
  it('declares each path parameter and each successful response body', () => {
    for (const [path, item] of Object.entries(openapiSpec.paths)) {
      const inherited = 'parameters' in item ? item.parameters : [];
      for (const [method, operation] of Object.entries(item)) {
        if (!httpMethods.has(method)) continue;
        expect(operation).toHaveProperty('responses');
        if (!operation || typeof operation !== 'object' || !('responses' in operation)) continue;
        const parameters = [
          ...inherited,
          ...('parameters' in operation ? operation.parameters : []),
        ];
        const names = [...path.matchAll(/\{(\w+)\}/g)].map((match) => match[1]);
        for (const name of names) {
          expect(parameters).toContainEqual(
            expect.objectContaining({ name, in: 'path', required: true }),
          );
        }
        for (const parameter of parameters) {
          if (parameter.in === 'path') expect(names).toContain(parameter.name);
        }
        for (const [status, response] of Object.entries(operation.responses)) {
          if (!status.startsWith('2') || status === '204') continue;
          expect(response, `${method.toUpperCase()} ${path} ${status}`).toHaveProperty('content');
        }
      }
    }
  });
  it('keeps composed routes, references and tags valid', async () => {
    const { body } = await request(app).get('/api/docs.json');
    expect(Object.keys(body).filter((key) => key.startsWith('/'))).toEqual([]);
    for (const path of [
      '/api/cart',
      '/api/cart/items',
      '/api/cart/items/{productId}',
      '/api/locations/pincodes/{postalCode}',
      '/api/customer/addresses',
      '/api/customer/addresses/{addressId}',
      '/api/wishlist',
    ]) {
      expect(body.paths).toHaveProperty(path);
    }

    function checkReferences(value: unknown): void {
      if (!value || typeof value !== 'object') return;
      if ('$ref' in value && typeof value.$ref === 'string' && value.$ref.startsWith('#/')) {
        let target: unknown = body;
        for (const segment of value.$ref.slice(2).split('/')) {
          expect(target).toHaveProperty(segment);
          target = Object.getOwnPropertyDescriptor(target, segment)?.value;
        }
        expect(target).toBeDefined();
      }
      for (const nested of Object.values(value)) checkReferences(nested);
    }
    checkReferences(body);
    const tagNames = body.tags.map((tag: { name: string }) => tag.name);
    expect(new Set(tagNames).size).toBe(tagNames.length);
    for (const path of Object.values(body.paths)) {
      if (!path || typeof path !== 'object') continue;
      for (const operation of Object.values(path)) {
        if (!operation || typeof operation !== 'object' || !('tags' in operation)) continue;
        expect(Array.isArray(operation.tags)).toBe(true);
        if (!Array.isArray(operation.tags)) continue;
        for (const tag of operation.tags) expect(tagNames).toContain(tag);
      }
    }
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
    expect(res.body.components.schemas.SendOtpResponse.properties).not.toHaveProperty('otp');
    expect(res.body.components.schemas.SendOtpInput.properties.purpose.enum).toEqual([
      'password_reset',
      'email_verification',
    ]);
    expect(res.body.components.schemas.VerifyOtpInput.properties.purpose.enum).toEqual([
      'password_reset',
      'email_verification',
    ]);
    expect(res.body.paths['/api/auth/send-otp'].post.responses['500']).toBeDefined();
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
