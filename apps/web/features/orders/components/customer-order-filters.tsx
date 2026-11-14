'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';

import {
  CUSTOMER_ORDER_STATUSES,
  customerOrderFiltersSchema,
} from '../schemas/customer-order-filters.schema';
import { customerOrdersHref } from '../utils/customer-orders-href';

import type {
  CustomerOrderFilterValues,
  CustomerOrderQuery,
} from '../schemas/customer-order-filters.schema';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

export function CustomerOrderFilters({ query }: { query: CustomerOrderQuery }) {
  const router = useRouter();
  const form = useForm<CustomerOrderFilterValues>({
    resolver: zodResolver(customerOrderFiltersSchema),
    values: {
      status: query.status ?? '',
      orderedFrom: query.orderedFrom ?? '',
      orderedTo: query.orderedTo ?? '',
    },
  });
  return (
    <aside
      aria-labelledby="order-filters-heading"
      className="border-b border-border-control pb-6 lg:w-56 lg:shrink-0 lg:border-r lg:border-b-0 lg:pr-6"
    >
      <h2 id="order-filters-heading" className="mb-6 text-lg font-medium">
        Filter orders
      </h2>
      <form
        className="space-y-6"
        onSubmit={form.handleSubmit((values) => {
          router.push(
            customerOrdersHref({
              page: 1,
              status: values.status || undefined,
              orderedFrom: values.orderedFrom || undefined,
              orderedTo: values.orderedTo || undefined,
            }),
          );
        })}
      >
        <div className="space-y-3">
          <p className="text-sm font-medium">Order status</p>
          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                aria-label="Order status"
                triggerClassName="h-10 w-full text-sm"
                options={[
                  { value: '', label: 'All statuses' },
                  ...CUSTOMER_ORDER_STATUSES.map((value) => ({
                    value,
                    label: value === 'Order placed' ? 'Placed' : value,
                  })),
                ]}
              />
            )}
          />
        </div>
        <fieldset className="space-y-3">
          <legend className="mb-3 text-sm font-medium">Ordered date</legend>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            <div className="min-w-0 space-y-1">
              <label htmlFor="ordered-from" className="cursor-pointer text-sm text-text-secondary">
                From
              </label>
              <Input
                id="ordered-from"
                type="date"
                className="min-w-0 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                {...form.register('orderedFrom')}
                isInvalid={!!form.formState.errors.orderedFrom}
                aria-describedby={
                  form.formState.errors.orderedFrom ? 'ordered-from-error' : undefined
                }
              />
              {form.formState.errors.orderedFrom && (
                <p id="ordered-from-error" role="alert" className="text-xs text-danger">
                  {form.formState.errors.orderedFrom.message}
                </p>
              )}
            </div>
            <div className="min-w-0 space-y-1">
              <label htmlFor="ordered-to" className="cursor-pointer text-sm text-text-secondary">
                To
              </label>
              <Input
                id="ordered-to"
                type="date"
                className="min-w-0 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                {...form.register('orderedTo')}
                isInvalid={!!form.formState.errors.orderedTo}
                aria-describedby={form.formState.errors.orderedTo ? 'ordered-to-error' : undefined}
              />
              {form.formState.errors.orderedTo && (
                <p id="ordered-to-error" role="alert" className="text-xs text-danger">
                  {form.formState.errors.orderedTo.message}
                </p>
              )}
            </div>
          </div>
        </fieldset>
        <div className="flex flex-wrap gap-3">
          <Button type="submit">Apply filters</Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              form.reset({ status: '', orderedFrom: '', orderedTo: '' });
              router.push('/orders');
            }}
          >
            Clear
          </Button>
        </div>
      </form>
    </aside>
  );
}
