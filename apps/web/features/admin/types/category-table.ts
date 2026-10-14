export interface CategoryTableRow {
  categoryId: string;
  name: string;
  slug: string;
  parentCategoryId: string | null;
  parentName?: string | null;
  hasChildren: boolean;
  childCount: number;
  level: number;
  imageUrl?: string | null;
  subRows?: CategoryTableRow[];
}
