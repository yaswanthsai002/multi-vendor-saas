import { randomUUID } from 'node:crypto';

import { PgDialect } from 'drizzle-orm/pg-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getDbMock } = vi.hoisted(() => ({ getDbMock: vi.fn() }));
vi.mock('@repo/db', () => ({ getDb: getDbMock }));

import { deleteCustomerAddress, updateCustomerAddress } from './customer-address.service.js';

function makeTransaction(active = true) {
  const userLimit = vi.fn().mockResolvedValue(active ? [{ userId: 'authenticated-user' }] : []);
  const userLock = vi.fn().mockReturnValue({ limit: userLimit });
  const userWhere = vi.fn().mockReturnValue({ for: userLock });
  const selectFrom = vi.fn().mockReturnValue({ where: userWhere });
  const tx = {
    select: vi.fn().mockReturnValue({ from: selectFrom }),
    update: vi.fn(),
    delete: vi.fn(),
  };
  const db = {
    transaction: vi.fn((callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx)),
  };
  return { db, tx };
}

describe('Customer address ownership', () => {
  beforeEach(() => vi.clearAllMocks());

  it('scopes address updates by both address ID and session user ID', async () => {
    const { db, tx } = makeTransaction();
    const addressWhere = vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) });
    const updateSet = vi.fn().mockReturnValue({ where: addressWhere });
    tx.update.mockReturnValue({ set: updateSet });
    getDbMock.mockReturnValue(db);

    await expect(
      updateCustomerAddress('authenticated-user', randomUUID(), { city: 'Pune' }),
    ).rejects.toMatchObject({ code: 'ADDRESS_NOT_FOUND' });

    const query = new PgDialect().sqlToQuery(addressWhere.mock.calls[0][0]);
    expect(query.sql).toContain('"customerAddresses"."addressId"');
    expect(query.sql).toContain('"customerAddresses"."userId"');
    expect(query.params).toContain('authenticated-user');
  });

  it('scopes address deletion by both address ID and session user ID', async () => {
    const { db, tx } = makeTransaction();
    const addressWhere = vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([]),
    });
    tx.delete.mockReturnValue({ where: addressWhere });
    getDbMock.mockReturnValue(db);

    await expect(deleteCustomerAddress('authenticated-user', randomUUID())).rejects.toMatchObject({
      code: 'ADDRESS_NOT_FOUND',
    });

    const query = new PgDialect().sqlToQuery(addressWhere.mock.calls[0][0]);
    expect(query.sql).toContain('"customerAddresses"."addressId"');
    expect(query.sql).toContain('"customerAddresses"."userId"');
    expect(query.params).toContain('authenticated-user');
  });

  it('rejects inactive accounts before writing addresses', async () => {
    const { db, tx } = makeTransaction(false);
    getDbMock.mockReturnValue(db);

    await expect(deleteCustomerAddress('authenticated-user', randomUUID())).rejects.toMatchObject({
      code: 'ACCOUNT_INACTIVE',
    });
    expect(tx.delete).not.toHaveBeenCalled();
  });
});
