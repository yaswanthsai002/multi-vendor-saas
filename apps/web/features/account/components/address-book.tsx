'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import {
  createCustomerAddress,
  deleteCustomerAddress,
  fetchCustomerAddresses,
  updateCustomerAddress,
} from '../services/account.service';

import { AddressForm } from './address-form';

import type { CustomerAddress, CustomerAddressInput } from '../types/account.types';

import { Button } from '@/components/ui/button';
import { queryKeys } from '@/lib/query-keys';

export function AddressBook({ userId }: { userId: string | number }) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.account.addresses(userId);
  const [adding, setAdding] = React.useState(false);
  const [editing, setEditing] = React.useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = React.useState<string | null>(null);
  const addresses = useQuery({
    queryKey,
    queryFn: ({ signal }) => fetchCustomerAddresses(signal),
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey });
  const createMutation = useMutation({
    mutationFn: createCustomerAddress,
    onSuccess: async () => {
      setAdding(false);
      await refresh();
      toast.success('Address added.');
    },
    onError: () => toast.error('Could not add address. Try again.'),
  });
  const updateMutation = useMutation({
    mutationFn: ({
      addressId,
      input,
    }: {
      addressId: string;
      input: Partial<CustomerAddressInput>;
    }) => updateCustomerAddress(addressId, input),
    onSuccess: async () => {
      setEditing(null);
      await refresh();
      toast.success('Address updated.');
    },
    onError: () => toast.error('Could not update address. Try again.'),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteCustomerAddress,
    onSuccess: async () => {
      setConfirmingDelete(null);
      await refresh();
      toast.success('Address removed.');
    },
    onError: () => toast.error('Could not remove address. Try again.'),
  });

  function saveEdit(addressId: string, input: CustomerAddressInput) {
    updateMutation.mutate({ addressId, input });
  }

  return (
    <section
      id="addresses"
      className="scroll-mt-24 rounded-xl border border-border-subtle bg-surface-raised p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Delivery addresses</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Save addresses for faster checkout. You’ll confirm one when placing an order.
          </p>
        </div>
        {!adding && (
          <Button
            type="button"
            size="md"
            className="rounded-lg px-5"
            onClick={() => {
              setEditing(null);
              setAdding(true);
            }}
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Add address
          </Button>
        )}
      </div>

      {adding && (
        <div className="mt-5 border-t border-border-subtle pt-5">
          <AddressForm
            isPending={createMutation.isPending}
            onSave={(input) => createMutation.mutate(input)}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      {addresses.isLoading ? (
        <div className="mt-5 space-y-3" role="status" aria-label="Loading addresses">
          <div className="h-24 animate-pulse rounded-lg bg-surface-subtle" />
          <div className="h-24 animate-pulse rounded-lg bg-surface-subtle" />
        </div>
      ) : addresses.isError ? (
        <div className="mt-5 rounded-lg bg-surface-subtle p-4">
          <p className="text-sm text-text-secondary">Could not load addresses. Try again.</p>
          <Button
            className="mt-3"
            size="sm"
            variant="outline"
            onClick={() => void addresses.refetch()}
          >
            Try again
          </Button>
        </div>
      ) : (addresses.data?.items.length ?? 0) === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-border-default px-5 py-8 text-center">
          <MapPin className="mx-auto h-8 w-8 text-text-tertiary" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-text-primary">No saved addresses yet</p>
          <p className="mt-1 text-sm text-text-secondary">
            Add a delivery address to make checkout easier.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {addresses.data?.items.map((address) => (
            <AddressCard
              key={address.addressId}
              address={address}
              editing={editing === address.addressId}
              confirmingDelete={confirmingDelete === address.addressId}
              isPending={updateMutation.isPending || deleteMutation.isPending}
              onEdit={() => {
                setAdding(false);
                setEditing(address.addressId);
              }}
              onCancelEdit={() => setEditing(null)}
              onSave={(input) => saveEdit(address.addressId, input)}
              onSetDefault={() =>
                updateMutation.mutate({ addressId: address.addressId, input: { isDefault: true } })
              }
              onDelete={() => {
                if (confirmingDelete === address.addressId)
                  deleteMutation.mutate(address.addressId);
                else setConfirmingDelete(address.addressId);
              }}
              onCancelDelete={() => setConfirmingDelete(null)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function AddressCard({
  address,
  editing,
  confirmingDelete,
  isPending,
  onEdit,
  onCancelEdit,
  onSave,
  onSetDefault,
  onDelete,
  onCancelDelete,
}: {
  address: CustomerAddress;
  editing: boolean;
  confirmingDelete: boolean;
  isPending: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (input: CustomerAddressInput) => void;
  onSetDefault: () => void;
  onDelete: () => void;
  onCancelDelete: () => void;
}) {
  if (editing) {
    return (
      <div className="rounded-lg border border-border-default p-4 lg:col-span-2">
        <AddressForm
          address={address}
          isPending={isPending}
          onSave={onSave}
          onCancel={onCancelEdit}
        />
      </div>
    );
  }

  return (
    <article className="rounded-lg border border-border-default p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-text-primary">{address.recipientName}</h3>
            {address.isDefault && (
              <span className="rounded-full bg-accent-subtle px-2 py-0.5 text-xs font-semibold text-accent">
                Default
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-text-secondary">{address.phone}</p>
          <p className="mt-1 text-sm text-text-secondary">
            {[
              address.addressLine1,
              address.addressLine2,
              address.city,
              address.state,
              address.postalCode,
            ]
              .filter(Boolean)
              .join(', ')}
          </p>
          <p className="mt-1 text-xs text-text-tertiary">India</p>
        </div>
      </div>
      {confirmingDelete && (
        <div
          className="mt-3 rounded-md bg-danger-subtle p-3"
          role="group"
          aria-label="Confirm address removal"
        >
          <p className="text-sm text-danger">Remove this saved address?</p>
          <div className="mt-2 flex gap-2">
            <Button
              type="button"
              variant="danger"
              size="sm"
              isLoading={isPending}
              onClick={onDelete}
            >
              Remove
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancelDelete}
              disabled={isPending}
            >
              Keep address
            </Button>
          </div>
        </div>
      )}
      {!confirmingDelete && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border-subtle pt-3">
          <Button
            type="button"
            variant="secondary"
            size="md"
            className="rounded-lg px-4"
            onClick={onEdit}
          >
            Edit address
          </Button>
          {!address.isDefault && (
            <Button
              type="button"
              variant="outline"
              size="md"
              className="rounded-lg px-4"
              disabled={isPending}
              onClick={onSetDefault}
            >
              Set as default
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="md"
            className="ml-auto rounded-lg px-4 text-danger"
            disabled={isPending}
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove
          </Button>
        </div>
      )}
    </article>
  );
}
