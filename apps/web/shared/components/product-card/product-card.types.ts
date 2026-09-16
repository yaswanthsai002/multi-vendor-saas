import type { StaticImageData } from 'next/image';

export interface ProductBadge {
  text: string;
  variant?: 'accent' | 'neutral' | 'success' | 'warning' | 'info';
}

export interface Product {
  id?: string | number;
  slug?: string;
  name: string;
  brand: string;
  price: string | number;
  oldPrice?: string | number;
  originalPrice?: string | number;
  discount?: string;
  rating?: number | string;
  reviews?: number;
  reviewsCount?: number;
  image: string | StaticImageData;
  badge?: ProductBadge;
  isWishlisted?: boolean;
}

export interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'rail';
  className?: string;
  onWishlistToggle?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}
