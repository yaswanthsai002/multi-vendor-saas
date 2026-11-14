import { AccountView } from '@/features/account/components/account-view';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Account | Perigee',
};

export default function AccountPage() {
  return <AccountView />;
}
