import { PgDialect } from 'drizzle-orm/pg-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { db, resolveUrl } = vi.hoisted(() => ({
  db: { select: vi.fn() },
  resolveUrl: vi.fn(),
}));

vi.mock('@repo/db', () => ({ getDb: vi.fn(() => db) }));
vi.mock('../../shared/storage/storage.service.js', () => ({
  STORAGE_BUCKETS: { productMedia: 'product-media' },
  storageService: { resolveUrl },
}));

import { getCart } from './cart.service.js';

function selectQuery(result: unknown[], terminal: 'limit' | 'where') {
  const query: Record<string, ReturnType<typeof vi.fn>> = {};
  for (const method of ['from', 'where', 'limit', 'leftJoin', 'innerJoin']) {
    query[method] = vi.fn(() => (method === terminal ? Promise.resolve(result) : query));
  }
  return query;
}

describe('getCart pricing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resolveUrl.mockReturnValue('https://cdn.example.com/item.webp');
  });

  it('returns effective campaign prices and totals, while hiding unavailable product details', async () => {
    const activeUser = selectQuery([{ userId: 'customer-1' }], 'limit');
    const cart = selectQuery([{ cartId: 'cart-1' }], 'limit');
    const items = selectQuery(
      [
        {
          productId: 'product-1',
          quantity: 2,
          name: 'Desk lamp',
          slug: 'desk-lamp',
          price: '79.00',
          mrp: '100.00',
          stock: 5,
          mediaId: null,
          mediaVendorId: null,
          vendorId: 'vendor-1',
          vendorName: 'Light Co',
          available: true,
          lineTotal: '158.00',
        },
        { productId: 'product-2', quantity: 1, available: false },
      ],
      'where',
    );
    const totals = selectQuery([{ subtotal: '158.00' }], 'where');
    db.select
      .mockReturnValueOnce(activeUser)
      .mockReturnValueOnce(cart)
      .mockReturnValueOnce(items)
      .mockReturnValueOnce(totals);

    const result = await getCart('customer-1');

    expect(result.items).toEqual([
      expect.objectContaining({ price: '79.00', lineTotal: '158.00', quantity: 2 }),
      { productId: 'product-2', quantity: 1, available: false },
    ]);
    expect(result.subtotal).toBe('158.00');
    expect(result.itemCount).toBe(3);
    expect(result.items[0]).not.toHaveProperty('regularPrice');

    const dialect = new PgDialect();
    const itemSelection = db.select.mock.calls[2][0];
    const subtotalSelection = db.select.mock.calls[3][0];
    expect(dialect.sqlToQuery(itemSelection.price).sql).toContain('"campaign_products"');
    expect(dialect.sqlToQuery(itemSelection.lineTotal).sql).toContain('"campaign_products"');
    expect(dialect.sqlToQuery(subtotalSelection.subtotal).sql).toContain('"campaign_products"');
  });
});
