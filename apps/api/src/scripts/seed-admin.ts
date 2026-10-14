import '../shared/config/env.js';

import { getDb } from '@repo/db';
import { users } from '@repo/db/schema';
import argon2 from 'argon2';
import { eq } from 'drizzle-orm';

async function seedAdmin() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@perigee.com').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const adminName = process.env.ADMIN_NAME || 'Super Admin';

  const db = getDb();

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, adminEmail),
  });

  if (existingUser) {
    const currentRoles = existingUser.roles ?? [];
    const hasAdmin = currentRoles.includes('admin');
    const updatedRoles: ('customer' | 'vendor' | 'admin')[] = hasAdmin
      ? currentRoles
      : [...currentRoles, 'admin'];

    await db
      .update(users)
      .set({
        roles: updatedRoles,
        status: 'active',
        emailVerifiedAt: existingUser.emailVerifiedAt ?? new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.userId, existingUser.userId));

    console.log(`[SeedAdmin] User ${adminEmail} updated with admin role.`);
    return;
  }

  const passwordHash = await argon2.hash(adminPassword);

  const [newUser] = await db
    .insert(users)
    .values({
      fullName: adminName,
      email: adminEmail,
      passwordHash,
      roles: ['admin'],
      status: 'active',
      emailVerifiedAt: new Date(),
    })
    .returning({
      userId: users.userId,
      email: users.email,
    });

  console.log(`[SeedAdmin] New admin created successfully: ${newUser.email} (${newUser.userId})`);
}

seedAdmin()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('[SeedAdmin] Failed to seed admin:', err);
    process.exit(1);
  });
