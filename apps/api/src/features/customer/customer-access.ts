import { type getDb } from '@repo/db';
import { users } from '@repo/db/schema';
import { and, eq } from 'drizzle-orm';

import { AppError } from '../../shared/errors/AppError.js';

type Database = ReturnType<typeof getDb>;
type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];

export async function activeCustomer(
  db: Database | Transaction,
  userId: string,
  lock = false,
  requireCustomer = true,
) {
  const query = db
    .select({ userId: users.userId, roles: users.roles })
    .from(users)
    .where(and(eq(users.userId, userId), eq(users.status, 'active')))
    .limit(1);
  const [user] = await (lock ? query.for('update') : query);
  if (!user) throw new AppError(403, 'ACCOUNT_INACTIVE', 'Active account required.');
  if (requireCustomer && !user.roles.includes('customer'))
    throw new AppError(403, 'CUSTOMER_REQUIRED', 'Customer account required.');
}
