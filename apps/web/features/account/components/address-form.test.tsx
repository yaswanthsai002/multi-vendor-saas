import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AddressForm } from './address-form';

const { lookupPostalCodeMock } = vi.hoisted(() => ({ lookupPostalCodeMock: vi.fn() }));

vi.mock('../services/account.service', () => ({ lookupPostalCode: lookupPostalCodeMock }));

describe('AddressForm', () => {
  afterEach(cleanup);

  beforeEach(() => {
    lookupPostalCodeMock.mockResolvedValue({
      items: [{ area: 'KPHB Colony', city: 'Hyderabad', state: 'Telangana' }],
    });
  });

  function renderForm(onSave = vi.fn()) {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <AddressForm isPending={false} onSave={onSave} onCancel={vi.fn()} />
      </QueryClientProvider>,
    );
    return onSave;
  }

  it('rejects malformed Indian PIN codes before saving', async () => {
    const user = userEvent.setup();
    const onSave = renderForm();

    await user.type(screen.getByLabelText('Recipient name'), 'Aarav Sharma');
    await user.type(screen.getByLabelText('Phone'), '+91 9876543210');
    await user.type(screen.getByLabelText('House, flat or building'), '12 Market Road');
    await user.type(screen.getByLabelText('Indian PIN code'), '123');
    await user.click(screen.getByRole('button', { name: 'Add address' }));

    expect(await screen.findByText('Enter a valid six-digit PIN code.')).toBeDefined();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('submits a valid address with India country and optional line normalized to null', async () => {
    const user = userEvent.setup();
    const onSave = renderForm();

    await user.type(screen.getByLabelText('Recipient name'), 'Aarav Sharma');
    await user.type(screen.getByLabelText('Phone'), '+91 9876543210');
    await user.type(screen.getByLabelText('House, flat or building'), '12 Market Road');
    await user.type(screen.getByLabelText('Indian PIN code'), '500001');
    await screen.findByDisplayValue('Hyderabad');
    await user.click(screen.getByRole('button', { name: 'Add address' }));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        recipientName: 'Aarav Sharma',
        phone: '+91 9876543210',
        addressLine1: '12 Market Road',
        addressLine2: 'KPHB Colony',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500001',
        country: 'IN',
        isDefault: false,
      }),
    );
  });

  it('does not accept a six-digit PIN missing from postal records', async () => {
    const user = userEvent.setup();
    const onSave = renderForm();
    lookupPostalCodeMock.mockResolvedValueOnce({ items: [] });

    await user.type(screen.getByLabelText('Recipient name'), 'Aarav Sharma');
    await user.type(screen.getByLabelText('Phone'), '+91 9876543210');
    await user.type(screen.getByLabelText('House, flat or building'), '12 Market Road');
    await user.type(screen.getByLabelText('City or town'), 'Unknown');
    await user.type(screen.getByLabelText('State or union territory'), 'Unknown');
    await user.type(screen.getByLabelText('Indian PIN code'), '999999');

    expect(await screen.findByText('PIN code not found. Check and try again.')).toBeDefined();
    await user.click(screen.getByRole('button', { name: 'Add address' }));
    expect(onSave).not.toHaveBeenCalled();
  });
});
