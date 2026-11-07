'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Camera, Trash2 } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { profileSchema, type ProfileFormValues } from '../schemas/account.schema';
import {
  fetchCustomerAddresses,
  removeProfileAvatar,
  updateProfile,
  uploadProfileAvatar,
} from '../services/account.service';

import type { CurrentUserData } from '@/lib/auth/current-user';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { queryKeys } from '@/lib/query-keys';

export function ProfileForm({ user }: { user: CurrentUserData }) {
  const queryClient = useQueryClient();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: user.fullName ?? '' },
  });
  const addresses = useQuery({
    queryKey: queryKeys.account.addresses(user.userId),
    queryFn: ({ signal }) => fetchCustomerAddresses(signal),
  });
  const defaultAddress = addresses.data?.items.find((address) => address.isDefault);

  React.useEffect(() => {
    form.reset({ fullName: user.fullName ?? '' });
  }, [form, user.fullName]);

  const updateMutation = useMutation({
    mutationFn: ({ fullName }: ProfileFormValues) => updateProfile(fullName),
    onSuccess: (result) => {
      queryClient.setQueryData(queryKeys.auth.me(), { user: result.user });
      toast.success('Profile updated.');
    },
    onError: () => toast.error('Could not update profile. Try again.'),
  });
  const avatarMutation = useMutation({
    mutationFn: uploadProfileAvatar,
    onSuccess: (result) => {
      queryClient.setQueryData(queryKeys.auth.me(), { user: result.user });
      toast.success('Profile photo updated.');
    },
    onError: () => toast.error('Could not upload profile photo. Try again.'),
  });
  const removeAvatarMutation = useMutation({
    mutationFn: removeProfileAvatar,
    onSuccess: (result) => {
      queryClient.setQueryData(queryKeys.auth.me(), { user: result.user });
      toast.success('Profile photo removed.');
    },
    onError: () => toast.error('Could not remove profile photo. Try again.'),
  });

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      toast.error('Choose a JPEG, PNG, or WebP image under 5 MB.');
      return;
    }
    avatarMutation.mutate(file);
  }

  return (
    <section
      id="profile"
      className="rounded-xl border border-border-subtle bg-surface-raised p-5 sm:p-6"
    >
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Profile</h2>
        <p className="mt-1 text-sm text-text-secondary">Manage your name and profile photo.</p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-5">
        <Button
          type="button"
          variant="ghost"
          size="md"
          aria-label={avatarMutation.isPending ? 'Uploading profile photo' : 'Change profile photo'}
          disabled={avatarMutation.isPending || removeAvatarMutation.isPending}
          onClick={() => fileRef.current?.click()}
          className="group relative h-28 w-28 shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-border-default bg-surface-subtle p-0 text-3xl font-semibold text-text-secondary transition-colors hover:border-border-control focus-visible:ring-2 focus-visible:ring-border-focus"
        >
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt=""
              width={112}
              height={112}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : (
            user.fullName?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()
          )}
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-text-primary/75 text-xs font-semibold text-text-inverse opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            <Camera className="h-5 w-5" aria-hidden="true" />
            {avatarMutation.isPending ? 'Uploading' : user.avatarUrl ? 'Update photo' : 'Add photo'}
          </span>
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-label="Choose profile photo"
          className="sr-only"
          onChange={handleAvatarChange}
        />
        <Button
          type="button"
          variant="secondary"
          size="md"
          className="rounded-lg px-5"
          disabled={avatarMutation.isPending || removeAvatarMutation.isPending}
          onClick={() => fileRef.current?.click()}
        >
          <Camera className="h-4 w-4" aria-hidden="true" />
          {avatarMutation.isPending ? 'Uploading…' : 'Change photo'}
        </Button>
        {user.avatarUrl && (
          <Button
            type="button"
            variant="outline"
            size="md"
            className="rounded-lg px-5 text-danger"
            disabled={removeAvatarMutation.isPending || avatarMutation.isPending}
            onClick={() => removeAvatarMutation.mutate()}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Remove photo
          </Button>
        )}
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border-subtle bg-surface-subtle p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Email status
          </dt>
          <dd className="mt-2 font-semibold text-text-primary">
            {user.emailVerifiedAt ? 'Verified' : 'Verification needed'}
          </dd>
          <dd className="mt-1 break-all text-sm text-text-secondary">{user.email}</dd>
        </div>
        <div className="rounded-lg border border-border-subtle bg-surface-subtle p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Default delivery contact
          </dt>
          <dd className="mt-2 font-semibold text-text-primary">
            {defaultAddress?.recipientName ?? 'No default address'}
          </dd>
          <dd className="mt-1 text-sm text-text-secondary">
            {defaultAddress
              ? `${defaultAddress.phone} · ${defaultAddress.city} ${defaultAddress.postalCode}`
              : 'Choose one from your saved addresses.'}
          </dd>
        </div>
        <div className="rounded-lg border border-border-subtle bg-surface-subtle p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Saved addresses
          </dt>
          <dd className="mt-2 font-semibold text-text-primary">
            {addresses.isLoading
              ? 'Loading…'
              : `${addresses.data?.items.length ?? 0} ${addresses.data?.items.length === 1 ? 'address' : 'addresses'}`}
          </dd>
          <dd className="mt-1 text-sm text-text-secondary">Used to speed up checkout.</dd>
        </div>
      </dl>

      <form
        className="mt-6 max-w-xl space-y-4"
        onSubmit={form.handleSubmit((values) => updateMutation.mutate(values))}
      >
        <div>
          <label htmlFor="account-full-name" className="text-sm font-medium text-text-primary">
            Full name
          </label>
          <Input
            id="account-full-name"
            autoComplete="name"
            isInvalid={Boolean(form.formState.errors.fullName)}
            aria-describedby={
              form.formState.errors.fullName ? 'account-full-name-error' : undefined
            }
            {...form.register('fullName')}
          />
          {form.formState.errors.fullName && (
            <p id="account-full-name-error" className="text-sm text-danger">
              {form.formState.errors.fullName.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="account-email" className="text-sm font-medium text-text-primary">
            Email
          </label>
          <Input id="account-email" type="email" value={user.email} disabled readOnly />
          <p className="mt-1 text-xs text-text-tertiary">
            {user.emailVerifiedAt
              ? 'Verified email address'
              : 'Email changes require a separate verification flow.'}
          </p>
        </div>
        <Button
          type="submit"
          className="min-w-40 rounded-lg px-6"
          isLoading={updateMutation.isPending}
          disabled={!form.formState.isDirty}
        >
          Save profile
        </Button>
      </form>
    </section>
  );
}
