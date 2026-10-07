import { getDb } from '@repo/db';
import { categories } from '@repo/db/schema';

import { redis } from '../../shared/redis/redis.client.js';

export interface CategoryLookup {
  categoryId: string;
  name: string;
  slug: string;
  parentCategoryId: string | null;
}

export interface CategoryTaxonomyItem {
  categoryId: string;
  name: string;
  slug: string;
  parentCategoryId: string | null;
  path: string;
  isLeaf: boolean;
}

export interface CategoryTaxonomyResult {
  list: CategoryTaxonomyItem[];
  leafList: CategoryTaxonomyItem[];
  lookup: (query: string) => CategoryTaxonomyItem | undefined;
}

export const CATEGORY_MAP_REDIS_KEY = 'catalog:categories:map';

let localMemoryCache: Map<string, CategoryLookup> | null = null;
let localTaxonomyCache: CategoryTaxonomyResult | null = null;
let localMemoryCachedAt = 0;
const LOCAL_CACHE_TTL_MS = 60 * 1000;

/**
 * Retrieves the full category slug map.
 * Fast path: checks in-memory cache -> checks Redis -> loads from PostgreSQL and hydrates caches.
 */
export async function getCategoryMap(): Promise<Map<string, CategoryLookup>> {
  const now = Date.now();
  if (localMemoryCache && now - localMemoryCachedAt < LOCAL_CACHE_TTL_MS) {
    return localMemoryCache;
  }

  try {
    const cachedJson = await redis.get(CATEGORY_MAP_REDIS_KEY);
    if (cachedJson) {
      const parsed = JSON.parse(cachedJson) as Record<string, CategoryLookup>;
      localMemoryCache = new Map(Object.entries(parsed));
      localMemoryCachedAt = now;
      return localMemoryCache;
    }
  } catch {
    // Non-fatal: fallback to direct DB lookup
  }

  const db = getDb();
  const rawRows = await db
    .select({
      categoryId: categories.categoryId,
      name: categories.name,
      slug: categories.slug,
      parentCategoryId: categories.parentCategoryId,
    })
    .from(categories);

  const rows = Array.isArray(rawRows) ? rawRows : [];
  const mapObj: Record<string, CategoryLookup> = {};
  const mapInstance = new Map<string, CategoryLookup>();

  for (const row of rows) {
    mapObj[row.slug] = row;
    mapInstance.set(row.slug, row);
  }

  localMemoryCache = mapInstance;
  localMemoryCachedAt = now;

  try {
    await redis.set(CATEGORY_MAP_REDIS_KEY, JSON.stringify(mapObj), 'EX', 86400); // 24 hours TTL
  } catch {
    // Non-fatal
  }

  return mapInstance;
}

/**
 * Retrieves full taxonomy with hierarchy paths, leaf categorization,
 * and multi-index lookup supporting slug, full breadcrumb path, or name.
 */
export async function getCategoryTaxonomy(): Promise<CategoryTaxonomyResult> {
  const now = Date.now();
  if (localTaxonomyCache && now - localMemoryCachedAt < LOCAL_CACHE_TTL_MS) {
    return localTaxonomyCache;
  }

  const slugMap = await getCategoryMap();
  const items = Array.from(slugMap.values());

  const idMap = new Map<string, CategoryLookup>();
  const parentToChildren = new Map<string, string[]>();

  for (const item of items) {
    idMap.set(item.categoryId, item);
    if (item.parentCategoryId) {
      const existing = parentToChildren.get(item.parentCategoryId) || [];
      existing.push(item.categoryId);
      parentToChildren.set(item.parentCategoryId, existing);
    }
  }

  const taxonomyList: CategoryTaxonomyItem[] = [];
  const slugIndex = new Map<string, CategoryTaxonomyItem>();
  const pathIndex = new Map<string, CategoryTaxonomyItem>();
  const nameIndex = new Map<string, CategoryTaxonomyItem>();

  for (const item of items) {
    const isLeaf =
      !parentToChildren.has(item.categoryId) || parentToChildren.get(item.categoryId)!.length === 0;

    // Build breadcrumb path
    const pathParts: string[] = [];
    let curr: CategoryLookup | undefined = item;
    const visited = new Set<string>();

    while (curr && !visited.has(curr.categoryId)) {
      visited.add(curr.categoryId);
      pathParts.unshift(curr.name);
      curr = curr.parentCategoryId ? idMap.get(curr.parentCategoryId) : undefined;
    }

    const path = pathParts.join(' > ');
    const taxItem: CategoryTaxonomyItem = {
      categoryId: item.categoryId,
      name: item.name,
      slug: item.slug,
      parentCategoryId: item.parentCategoryId,
      path,
      isLeaf,
    };

    taxonomyList.push(taxItem);
    slugIndex.set(item.slug.toLowerCase(), taxItem);
    pathIndex.set(path.toLowerCase(), taxItem);
    nameIndex.set(item.name.toLowerCase(), taxItem);
  }

  // Sort by path
  taxonomyList.sort((a, b) => a.path.localeCompare(b.path));
  const leafList = taxonomyList.filter((item) => item.isLeaf);

  const lookup = (query: string): CategoryTaxonomyItem | undefined => {
    if (!query) return undefined;
    const normalized = query.trim().toLowerCase();
    return slugIndex.get(normalized) || pathIndex.get(normalized) || nameIndex.get(normalized);
  };

  localTaxonomyCache = {
    list: taxonomyList,
    leafList,
    lookup,
  };

  return localTaxonomyCache;
}

/**
 * Invalidates the Redis category map cache whenever an admin updates categories.
 */
export async function invalidateCategoryMap(): Promise<void> {
  localMemoryCache = null;
  localTaxonomyCache = null;
  localMemoryCachedAt = 0;
  try {
    await redis.del(CATEGORY_MAP_REDIS_KEY);
  } catch {
    // Non-fatal
  }
}
