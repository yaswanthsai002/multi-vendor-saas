import type { Metadata } from 'next';

import { WishlistView } from '@/features/catalog/components/wishlist-view';

export const metadata: Metadata = {
  title: 'Wishlist | Perigee',
};

export default function WishlistPage() {
  return <WishlistView />;
}
