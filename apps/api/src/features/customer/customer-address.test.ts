import { randomUUID } from 'node:crypto';

import { SignJWT } from 'jose';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import app from '../../app.js';

import * as service from './customer-address.service.js';

vi.mock('./customer-address.service.js', () => ({
  listCustomerAddresses: vi.fn(),
  createCustomerAddress: vi.fn(),
  updateCustomerAddress: vi.fn(),
  deleteCustomerAddress: vi.fn(),
}));

const secret = 'test-secret-at-least-32-characters-long-key';

async function sessionCookie(userId: string) {
  const token = await new SignJWT()
    .setProtectedHeader({ alg: 'HS512' })
    .setSubject(userId)
    .setIssuer('perigee-api')
    .setAudience('perigee-web-app')
    .setExpirationTime('1h')
    .sign(new TextEncoder().encode(secret));
  return `auth_token=${token}`;
}

const addressInput = {
  recipientName: 'Aarav Sharma',
  phone: '+91 9876543210',
  addressLine1: '12 Market Road',
  city: 'Hyderabad',
  state: 'Telangana',
  postalCode: '500001',
};

const addressRecord = {
  addressId: randomUUID(),
  ...addressInput,
  addressLine2: null,
  country: 'IN',
  isDefault: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Customer address API', () => {
  afterEach(() => vi.unstubAllGlobals());

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = secret;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          {
            Status: 'Success',
            PostOffice: [{ Name: 'Hyderabad G.P.O.', District: 'Hyderabad', State: 'Telangana' }],
          },
        ],
      }),
    );
  });

  it('requires an authenticated session', async () => {
    const response = await request(app).get('/api/customer/addresses');

    expect(response.status).toBe(401);
    expect(service.listCustomerAddresses).not.toHaveBeenCalled();
  });

  it('lists addresses for the authenticated account only', async () => {
    const userId = randomUUID();
    vi.mocked(service.listCustomerAddresses).mockResolvedValue({ items: [] });

    const response = await request(app)
      .get('/api/customer/addresses')
      .set('Cookie', await sessionCookie(userId));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ items: [] });
    expect(service.listCustomerAddresses).toHaveBeenCalledWith(userId);
  });

  it('rejects invalid PINs and client-supplied ownership fields', async () => {
    const cookie = await sessionCookie(randomUUID());
    const invalidPin = await request(app)
      .post('/api/customer/addresses')
      .set('Cookie', cookie)
      .send({ ...addressInput, postalCode: '123' });
    const suppliedOwner = await request(app)
      .post('/api/customer/addresses')
      .set('Cookie', cookie)
      .send({ ...addressInput, userId: randomUUID() });

    expect(invalidPin.status).toBe(400);
    expect(suppliedOwner.status).toBe(400);
    expect(service.createCustomerAddress).not.toHaveBeenCalled();
  });

  it('rejects a six-digit PIN missing from postal records', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ Status: 'Error', PostOffice: null }],
      }),
    );

    const response = await request(app)
      .post('/api/customer/addresses')
      .set('Cookie', await sessionCookie(randomUUID()))
      .send({ ...addressInput, postalCode: '999999' });

    expect(response.status).toBe(400);
    expect(service.createCustomerAddress).not.toHaveBeenCalled();
  });

  it('rejects an invalid PIN when updating an address', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ Status: 'Error', PostOffice: null }],
      }),
    );

    const response = await request(app)
      .patch(`/api/customer/addresses/${randomUUID()}`)
      .set('Cookie', await sessionCookie(randomUUID()))
      .send({ postalCode: '999999' });

    expect(response.status).toBe(400);
    expect(service.updateCustomerAddress).not.toHaveBeenCalled();
  });

  it('creates addresses under the authenticated user and applies India defaults', async () => {
    const userId = randomUUID();
    vi.mocked(service.createCustomerAddress).mockResolvedValue({ address: addressRecord });

    const response = await request(app)
      .post('/api/customer/addresses')
      .set('Cookie', await sessionCookie(userId))
      .send(addressInput);

    expect(response.status).toBe(201);
    expect(service.createCustomerAddress).toHaveBeenCalledWith(userId, {
      ...addressInput,
      addressLine2: null,
      country: 'IN',
      isDefault: false,
    });
  });

  it('uses session identity for update and delete', async () => {
    const userId = randomUUID();
    const addressId = randomUUID();
    vi.mocked(service.updateCustomerAddress).mockResolvedValue({ address: addressRecord });

    const updated = await request(app)
      .patch(`/api/customer/addresses/${addressId}`)
      .set('Cookie', await sessionCookie(userId))
      .send({ city: 'Pune' });
    const deleted = await request(app)
      .delete(`/api/customer/addresses/${addressId}`)
      .set('Cookie', await sessionCookie(userId));

    expect(updated.status).toBe(200);
    expect(service.updateCustomerAddress).toHaveBeenCalledWith(userId, addressId, { city: 'Pune' });
    expect(deleted.status).toBe(204);
    expect(service.deleteCustomerAddress).toHaveBeenCalledWith(userId, addressId);
  });
});
