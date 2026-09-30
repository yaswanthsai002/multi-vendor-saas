import { randomBytes } from 'node:crypto';

import { getDb } from '@repo/db';
import { categories, productCategories } from '@repo/db/schema';
import { and, asc, eq, isNull, ne, sql } from 'drizzle-orm';

import { AppError } from '../../shared/errors/AppError.js';

import type { CreateCategoryInput, UpdateCategoryInput } from './category.schema.js';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Generates a unique category slug, handling collisions if necessary.
 */
async function generateUniqueSlug(baseText: string, currentCategoryId?: string): Promise<string> {
  const db = getDb();
  const baseSlug = slugify(baseText);
  let finalSlug = baseSlug;

  const existing = await db.query.categories.findFirst({
    where: currentCategoryId
      ? and(eq(categories.slug, finalSlug), ne(categories.categoryId, currentCategoryId))
      : eq(categories.slug, finalSlug),
  });

  if (existing) {
    // ponytail: simple random suffix on slug collision
    finalSlug = `${baseSlug}-${randomBytes(3).toString('hex')}`;
  }

  return finalSlug;
}

/**
 * Checks whether setting targetParentId as parent of categoryId would form a cycle.
 * Traverses ancestors of targetParentId to verify categoryId is never encountered.
 */
async function detectCycle(categoryId: string, targetParentId: string): Promise<void> {
  if (categoryId === targetParentId) {
    throw new AppError(409, 'CATEGORY_CYCLE', 'A category cannot become its own parent.');
  }

  const db = getDb();
  let currentId: string | null = targetParentId;
  const visited = new Set<string>();

  while (currentId) {
    if (currentId === categoryId) {
      throw new AppError(
        409,
        'CATEGORY_CYCLE',
        'A category cannot be moved under itself or one of its descendants.',
      );
    }

    if (visited.has(currentId)) {
      break;
    }
    visited.add(currentId);

    const parent: { parentCategoryId: string | null } | undefined =
      await db.query.categories.findFirst({
        where: eq(categories.categoryId, currentId),
        columns: {
          parentCategoryId: true,
        },
      });

    currentId = parent?.parentCategoryId ?? null;
  }
}

/**
 * Lists categories. Defaults to root categories (parentCategoryId IS NULL)
 * or filters by the supplied parentCategoryId.
 */
export async function listCategories(parentCategoryId?: string) {
  const db = getDb();

  const filter = parentCategoryId
    ? eq(categories.parentCategoryId, parentCategoryId)
    : isNull(categories.parentCategoryId);

  const rows = await db
    .select({
      categoryId: categories.categoryId,
      name: categories.name,
      slug: categories.slug,
      parentCategoryId: categories.parentCategoryId,
      imageUrl: categories.imageUrl,
      hasChildren: sql<boolean>`EXISTS (
        SELECT 1 FROM "categories" c2
        WHERE c2."parentCategoryId" = "categories"."categoryId"
      )`,
    })
    .from(categories)
    .where(filter)
    .orderBy(asc(categories.name));

  return rows;
}

/**
 * Retrieves a single category by ID with child status.
 */
export async function getCategoryById(categoryId: string) {
  const db = getDb();

  const [row] = await db
    .select({
      categoryId: categories.categoryId,
      name: categories.name,
      slug: categories.slug,
      parentCategoryId: categories.parentCategoryId,
      imageUrl: categories.imageUrl,
      hasChildren: sql<boolean>`EXISTS (
        SELECT 1 FROM "categories" c2
        WHERE c2."parentCategoryId" = "categories"."categoryId"
      )`,
    })
    .from(categories)
    .where(eq(categories.categoryId, categoryId));

  if (!row) {
    throw new AppError(404, 'CATEGORY_NOT_FOUND', 'Category not found.');
  }

  return row;
}

/**
 * Creates a category under an optional parent.
 */
export async function createCategory(input: CreateCategoryInput) {
  const db = getDb();

  if (input.parentCategoryId) {
    const parent = await db.query.categories.findFirst({
      where: eq(categories.categoryId, input.parentCategoryId),
      columns: { categoryId: true },
    });

    if (!parent) {
      throw new AppError(400, 'INVALID_PARENT_CATEGORY', 'Parent category does not exist.');
    }
  }

  const slug = await generateUniqueSlug(input.name);

  const [created] = await db
    .insert(categories)
    .values({
      name: input.name,
      slug,
      parentCategoryId: input.parentCategoryId ?? null,
      imageUrl: input.imageUrl ?? null,
    })
    .returning({
      categoryId: categories.categoryId,
      name: categories.name,
      slug: categories.slug,
      parentCategoryId: categories.parentCategoryId,
      imageUrl: categories.imageUrl,
    });

  return {
    ...created,
    hasChildren: false,
  };
}

/**
 * Updates a category and validates parent updates against cycles.
 */
export async function updateCategory(categoryId: string, input: UpdateCategoryInput) {
  const db = getDb();

  const existing = await db.query.categories.findFirst({
    where: eq(categories.categoryId, categoryId),
  });

  if (!existing) {
    throw new AppError(404, 'CATEGORY_NOT_FOUND', 'Category not found.');
  }

  const updatePayload: {
    name?: string;
    slug?: string;
    parentCategoryId?: string | null;
    imageUrl?: string | null;
    updatedAt: Date;
  } = {
    updatedAt: new Date(),
  };

  if (input.parentCategoryId !== undefined) {
    if (input.parentCategoryId !== null) {
      const parent = await db.query.categories.findFirst({
        where: eq(categories.categoryId, input.parentCategoryId),
        columns: { categoryId: true },
      });

      if (!parent) {
        throw new AppError(400, 'INVALID_PARENT_CATEGORY', 'Parent category does not exist.');
      }

      await detectCycle(categoryId, input.parentCategoryId);
    }
    updatePayload.parentCategoryId = input.parentCategoryId;
  }

  if (input.name !== undefined && input.name !== existing.name) {
    updatePayload.name = input.name;
    updatePayload.slug = await generateUniqueSlug(input.name, categoryId);
  }

  if (input.imageUrl !== undefined) {
    updatePayload.imageUrl = input.imageUrl;
  }

  await db.update(categories).set(updatePayload).where(eq(categories.categoryId, categoryId));

  return getCategoryById(categoryId);
}

/**
 * Deletes a category if it has no subcategories and is not assigned to products.
 */
export async function deleteCategory(categoryId: string) {
  const db = getDb();

  const existing = await db.query.categories.findFirst({
    where: eq(categories.categoryId, categoryId),
    columns: { categoryId: true },
  });

  if (!existing) {
    throw new AppError(404, 'CATEGORY_NOT_FOUND', 'Category not found.');
  }

  // Guard 1: Cannot delete if it has subcategories
  const child = await db.query.categories.findFirst({
    where: eq(categories.parentCategoryId, categoryId),
    columns: { categoryId: true },
  });

  if (child) {
    throw new AppError(
      409,
      'CATEGORY_HAS_CHILDREN',
      'Cannot delete category because it has subcategories.',
    );
  }

  // Guard 2: Cannot delete if assigned to any product
  const productUsage = await db.query.productCategories.findFirst({
    where: eq(productCategories.categoryId, categoryId),
    columns: { productId: true },
  });

  if (productUsage) {
    throw new AppError(
      409,
      'CATEGORY_IN_USE',
      'Cannot delete category because it is assigned to one or more products.',
    );
  }

  await db.delete(categories).where(eq(categories.categoryId, categoryId));

  return { message: 'Category deleted successfully.' };
}
