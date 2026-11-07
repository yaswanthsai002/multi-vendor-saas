import { getDb } from '@repo/db';
import { customerAddresses, users } from '@repo/db/schema';
import { and, desc, eq } from 'drizzle-orm';

import { AppError } from '../../shared/errors/AppError.js';

import type {
  CreateCustomerAddressInput,
  UpdateCustomerAddressInput,
} from './customer-address.schema.js';

type Transaction = Parameters<Parameters<ReturnType<typeof getDb>['transaction']>[0]>[0];

const addressColumns = {
  addressId: customerAddresses.addressId,
  recipientName: customerAddresses.recipientName,
  phone: customerAddresses.phone,
  addressLine1: customerAddresses.addressLine1,
  addressLine2: customerAddresses.addressLine2,
  city: customerAddresses.city,
  state: customerAddresses.state,
  postalCode: customerAddresses.postalCode,
  country: customerAddresses.country,
  isDefault: customerAddresses.isDefault,
  createdAt: customerAddresses.createdAt,
  updatedAt: customerAddresses.updatedAt,
};

async function lockActiveUser(tx: Transaction, userId: string) {
  const [user] = await tx
    .select({ userId: users.userId })
    .from(users)
    .where(and(eq(users.userId, userId), eq(users.status, 'active')))
    .for('update')
    .limit(1);
  if (!user) throw new AppError(403, 'ACCOUNT_INACTIVE', 'Active account required.');
}

async function activeUser(userId: string) {
  const db = getDb();
  const [user] = await db
    .select({ userId: users.userId })
    .from(users)
    .where(and(eq(users.userId, userId), eq(users.status, 'active')))
    .limit(1);
  if (!user) throw new AppError(403, 'ACCOUNT_INACTIVE', 'Active account required.');
}

export async function listCustomerAddresses(userId: string) {
  await activeUser(userId);
  const rows = await getDb()
    .select(addressColumns)
    .from(customerAddresses)
    .where(eq(customerAddresses.userId, userId))
    .orderBy(desc(customerAddresses.isDefault), desc(customerAddresses.createdAt));
  return { items: rows };
}

export async function createCustomerAddress(userId: string, input: CreateCustomerAddressInput) {
  const db = getDb();
  return db.transaction(async (tx) => {
    await lockActiveUser(tx, userId);
    if (input.isDefault) {
      await tx
        .update(customerAddresses)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(eq(customerAddresses.userId, userId));
    }
    const [address] = await tx
      .insert(customerAddresses)
      .values({ ...input, userId, country: 'IN' })
      .returning(addressColumns);
    return { address };
  });
}

export async function updateCustomerAddress(
  userId: string,
  addressId: string,
  input: UpdateCustomerAddressInput,
) {
  const db = getDb();
  return db.transaction(async (tx) => {
    await lockActiveUser(tx, userId);
    if (input.isDefault) {
      await tx
        .update(customerAddresses)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(eq(customerAddresses.userId, userId));
    }
    const [address] = await tx
      .update(customerAddresses)
      .set({ ...input, updatedAt: new Date() })
      .where(and(eq(customerAddresses.addressId, addressId), eq(customerAddresses.userId, userId)))
      .returning(addressColumns);
    if (!address) throw new AppError(404, 'ADDRESS_NOT_FOUND', 'Address not found.');
    return { address };
  });
}

export async function deleteCustomerAddress(userId: string, addressId: string) {
  const db = getDb();
  await db.transaction(async (tx) => {
    await lockActiveUser(tx, userId);
    const [deleted] = await tx
      .delete(customerAddresses)
      .where(and(eq(customerAddresses.addressId, addressId), eq(customerAddresses.userId, userId)))
      .returning({ addressId: customerAddresses.addressId });
    if (!deleted) throw new AppError(404, 'ADDRESS_NOT_FOUND', 'Address not found.');
  });
}
