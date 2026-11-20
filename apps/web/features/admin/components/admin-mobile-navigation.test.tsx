import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';

import { AdminMobileNavigation } from './admin-mobile-navigation';

vi.mock('./admin-sidebar', () => ({ AdminSidebar: () => <a href="#orders">Orders</a> }));
afterEach(cleanup);

it('closes mobile navigation after choosing a destination or pressing Escape', async () => {
  render(<AdminMobileNavigation />);
  const trigger = screen.getByRole('button', { name: 'Open admin navigation' });
  await userEvent.click(trigger);
  expect(screen.getByRole('dialog')).toBeDefined();
  await userEvent.click(screen.getByRole('link', { name: 'Orders' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  await userEvent.click(trigger);
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(document.activeElement).toBe(trigger);
});
