'use client';

import { Dialog } from '@base-ui-components/react/dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ChevronDown, MapPin, Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { queryKeys } from '@/lib/query-keys';
import { useCurrentUser } from '@/shared/hooks/use-current-user';

import { usePostalCode } from '../hooks/use-postal-code';
import { deliveryPinSchema, type DeliveryPinFormValues } from '../schemas/account.schema';
import { fetchCustomerAddresses, updateCustomerAddress } from '../services/account.service';

import type { CustomerAddress } from '../types/account.types';

const DELIVERY_PIN_KEY = 'perigee.delivery-pin';
const DELIVERY_LOCATION_KEY = 'perigee.delivery-location';
const DELIVERY_PIN_EVENT = 'perigee:delivery-pin-change';

export function DeliveryAddressPicker({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentUser = useCurrentUser();
  const user = currentUser.data?.user;
  const addressKey = queryKeys.account.addresses(user?.userId);
  const [open, setOpen] = React.useState(false);
  const [deliveryPin, setDeliveryPin] = React.useState('');
  const [deliveryCity, setDeliveryCity] = React.useState('');
  const pinForm = useForm<DeliveryPinFormValues>({
    resolver: zodResolver(deliveryPinSchema),
    defaultValues: { postalCode: '' },
  });
  const enteredPin = useWatch({ control: pinForm.control, name: 'postalCode' });
  const postalLookup = usePostalCode(open ? enteredPin : '');
  const addresses = useQuery({
    queryKey: addressKey,
    queryFn: ({ signal }) => fetchCustomerAddresses(signal),
    enabled: Boolean(user?.userId),
  });
  const selected = addresses.data?.items.find((address) => address.isDefault);
  const selectedForBrowsing =
    selected && (!deliveryPin || deliveryPin === selected.postalCode) ? selected : undefined;
  const displayedPin = deliveryPin || selected?.postalCode;

  React.useEffect(() => {
    const syncPin = () => {
      const saved = window.localStorage.getItem(DELIVERY_PIN_KEY) ?? '';
      const location = window.localStorage.getItem(DELIVERY_LOCATION_KEY);
      let city = '';
      try {
        const parsed = location
          ? (JSON.parse(location) as { postalCode?: string; city?: string })
          : null;
        if (parsed?.postalCode === saved && typeof parsed.city === 'string') city = parsed.city;
      } catch {
        city = '';
      }
      setDeliveryPin(/^[1-9]\d{5}$/.test(saved) ? saved : '');
      setDeliveryCity(city);
    };
    syncPin();
    window.addEventListener('storage', syncPin);
    window.addEventListener(DELIVERY_PIN_EVENT, syncPin);
    return () => {
      window.removeEventListener('storage', syncPin);
      window.removeEventListener(DELIVERY_PIN_EVENT, syncPin);
    };
  }, []);

  React.useEffect(() => {
    pinForm.setValue('postalCode', deliveryPin);
  }, [deliveryPin, pinForm]);

  const selectAddress = useMutation({
    mutationFn: (addressId: string) => updateCustomerAddress(addressId, { isDefault: true }),
    onSuccess: ({ address }) => {
      queryClient.setQueryData<{ items: CustomerAddress[] }>(
        addressKey,
        (current) =>
          current && {
            items: current.items.map((item) => ({
              ...item,
              isDefault: item.addressId === address.addressId,
            })),
          },
      );
      saveDeliveryPin(address.postalCode, address.city);
      setOpen(false);
    },
    onError: () => toast.error('Could not change delivery address. Try again.'),
  });

  function saveDeliveryPin(pin: string, city: string) {
    window.localStorage.setItem(DELIVERY_PIN_KEY, pin);
    window.localStorage.setItem(DELIVERY_LOCATION_KEY, JSON.stringify({ postalCode: pin, city }));
    setDeliveryPin(pin);
    setDeliveryCity(city);
    window.dispatchEvent(new Event(DELIVERY_PIN_EVENT));
  }

  const currentLocationLabel = selectedForBrowsing
    ? `${selectedForBrowsing.recipientName}, ${selectedForBrowsing.addressLine1}, ${selectedForBrowsing.city} ${selectedForBrowsing.postalCode}`
    : displayedPin
      ? `${deliveryCity || 'PIN'} ${displayedPin}`
      : 'No location selected';
  const triggerClass = variant === 'desktop' ? 'px-2.5 py-1.5' : 'py-1 text-xs text-text-secondary';

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label={`Choose delivery location. Current: ${currentLocationLabel}`}
        render={
          <Button
            type="button"
            variant="ghost"
            size="md"
            className={`flex max-w-64 cursor-pointer items-center gap-2 rounded-lg text-left ${triggerClass}`}
          >
            <MapPin className="h-5 w-5 shrink-0 text-text-primary" aria-hidden="true" />
            <span className="flex min-w-0 flex-col text-xs leading-tight">
              <span className="truncate text-text-tertiary">
                {selectedForBrowsing
                  ? `Deliver to ${selectedForBrowsing.recipientName}`
                  : deliveryCity
                    ? 'Deliver to'
                    : 'Delivering to'}
              </span>
              <span className="truncate font-semibold text-text-primary">
                {selectedForBrowsing
                  ? `${selectedForBrowsing.city} ${selectedForBrowsing.postalCode}`
                  : displayedPin
                    ? `${deliveryCity || 'PIN'} ${displayedPin}`
                    : 'Update location'}
              </span>
            </span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-text-secondary" aria-hidden="true" />
          </Button>
        }
      />
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Popup className="fixed inset-x-4 top-1/2 z-50 mx-auto max-h-screen w-auto max-w-md -translate-y-1/2 overflow-y-auto rounded-xl border border-border-default bg-surface-raised p-5 text-text-primary shadow-xl sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-accent">
              <MapPin className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-lg font-semibold">Choose your location</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-text-secondary">
                Enter an Indian PIN code to find your delivery area.
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Close location dialog"
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  className="h-10 w-10 shrink-0 rounded-full p-0"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </Button>
              }
            />
          </div>

          {user ? (
            <section className="mt-5">
              <h2 className="text-sm font-semibold text-text-primary">Saved addresses</h2>
              {addresses.isLoading ? (
                <p className="py-4 text-sm text-text-secondary" role="status">
                  Loading your addresses…
                </p>
              ) : addresses.isError ? (
                <div className="mt-2 rounded-lg bg-surface-subtle p-3">
                  <p className="text-sm text-text-secondary">Could not load addresses.</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => void addresses.refetch()}
                  >
                    Try again
                  </Button>
                </div>
              ) : addresses.data?.items.length ? (
                <div className="mt-2 max-h-52 space-y-2 overflow-y-auto">
                  {addresses.data.items.map((address) => (
                    <AddressOption
                      key={address.addressId}
                      address={address}
                      selected={address.isDefault}
                      disabled={selectAddress.isPending}
                      onSelect={() => {
                        if (!address.isDefault) selectAddress.mutate(address.addressId);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-2 rounded-lg bg-surface-subtle p-3">
                  <p className="text-sm text-text-secondary">No saved addresses yet.</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => router.push('/account#addresses')}
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" /> Add address
                  </Button>
                </div>
              )}
            </section>
          ) : (
            <Button
              type="button"
              size="lg"
              className="mt-5 w-full rounded-full"
              onClick={() => router.push('/signin?redirect=%2Faccount%23addresses')}
            >
              Sign in to see your addresses
            </Button>
          )}

          <div className="my-5 flex items-center gap-3 text-xs text-text-secondary">
            <span className="h-px flex-1 bg-border-subtle" />
            or enter an Indian PIN code
            <span className="h-px flex-1 bg-border-subtle" />
          </div>

          <form
            className="flex items-start gap-2"
            onSubmit={pinForm.handleSubmit(({ postalCode }) => {
              const location = postalLookup.data?.items[0];
              if (!location) {
                pinForm.setError('postalCode', {
                  type: 'validate',
                  message: postalLookup.isError
                    ? 'Could not verify this PIN code. Try again.'
                    : 'PIN code not found. Check and try again.',
                });
                return;
              }
              saveDeliveryPin(postalCode, location.city);
              setOpen(false);
            })}
          >
            <div className="min-w-0 flex-1">
              <label htmlFor="delivery-location-pin" className="sr-only">
                Indian PIN code
              </label>
              <Input
                id="delivery-location-pin"
                autoComplete="postal-code"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit PIN code"
                isInvalid={Boolean(pinForm.formState.errors.postalCode)}
                aria-describedby={
                  pinForm.formState.errors.postalCode ? 'delivery-location-pin-error' : undefined
                }
                {...pinForm.register('postalCode')}
              />
              {postalLookup.isFetching && (
                <p className="mt-1 text-xs text-text-secondary" role="status">
                  Checking PIN code…
                </p>
              )}
              {postalLookup.data?.items[0] && (
                <p className="mt-1 text-xs text-success" role="status">
                  Delivery area: {postalLookup.data.items[0].city},{' '}
                  {postalLookup.data.items[0].state}
                </p>
              )}
              {postalLookup.isError && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-1"
                  onClick={() => void postalLookup.refetch()}
                >
                  Retry PIN lookup
                </Button>
              )}
              {pinForm.formState.errors.postalCode && (
                <p id="delivery-location-pin-error" className="mt-1 text-xs text-danger">
                  {pinForm.formState.errors.postalCode.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              variant="outline"
              size="md"
              className="rounded-full px-6"
              disabled={postalLookup.isFetching}
            >
              Apply
            </Button>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function AddressOption({
  address,
  selected,
  disabled,
  onSelect,
}: {
  address: CustomerAddress;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  const addressText = [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.postalCode,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Button
      type="button"
      variant={selected ? 'secondary' : 'outline'}
      size="md"
      disabled={disabled}
      onClick={onSelect}
      className="h-auto w-full justify-start whitespace-normal rounded-lg px-3 py-3 text-left"
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-accent bg-accent text-on-accent' : 'border-border-control text-transparent'}`}
      >
        {selected && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-text-primary">
          {address.recipientName}
          {selected && (
            <span className="rounded-full bg-accent-subtle px-2 py-0.5 text-xs font-semibold text-accent">
              Default
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-xs font-normal leading-relaxed text-text-secondary">
          {addressText}
        </span>
        <span className="mt-0.5 block text-xs font-normal text-text-tertiary">{address.phone}</span>
      </span>
    </Button>
  );
}
