import type { Metadata } from 'next';

import { AccountView } from '@/features/account/components/account-view';

export const metadata: Metadata = {
  title: 'Your Account | Perigee',
};

export default function AccountPage() {
  return <AccountView />;
}
