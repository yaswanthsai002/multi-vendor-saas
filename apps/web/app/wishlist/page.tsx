import { WishlistView } from '@/features/catalog/components/wishlist-view';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wishlist | Perigee',
};

export default function WishlistPage() {
  return <WishlistView />;
}
