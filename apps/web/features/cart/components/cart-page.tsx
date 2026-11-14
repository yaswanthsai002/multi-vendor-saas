'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { broadcastCartChange } from '@/lib/cart-sync';
import { useCurrentUser } from '@/shared/hooks/use-current-user';

type AvailableCartItem = {
  productId: string;
  quantity: number;
  available: true;
  name: string;
  slug: string;
  price: string;
  mrp: string;
  stock: number;
  imageUrl: string | null;
  lineTotal: string;
};

type UnavailableCartItem = {
  productId: string;
  quantity: number;
  available: false;
};

type CartItem = AvailableCartItem | UnavailableCartItem;

type Cart = {
  items: CartItem[];
  subtotal: string;
  itemCount: number;
};

const cartKey = (userId?: string | number) => ['cart', userId] as const;

function formatPrice(value: string) {
  return `₹${Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function CartPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: current, isLoading: userLoading } = useCurrentUser();
  const userId = current?.user?.userId;
  const [mutationError, setMutationError] = React.useState('');
  const [pendingProductId, setPendingProductId] = React.useState<string | null>(null);
  const cart = useQuery({
    queryKey: cartKey(userId),
    queryFn: () => makeApiRequest<Cart>({ url: API_ENDPOINTS.cart.root, method: 'GET' }),
    enabled: Boolean(userId),
  });

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: cartKey(userId) });
  }

  async function change(productId: string, quantity: number) {
    setPendingProductId(productId);
    setMutationError('');
    try {
      await makeApiRequest({
        url: API_ENDPOINTS.cart.item(productId),
        method: 'PUT',
        data: { quantity },
      });
      if (!broadcastCartChange()) await refresh();
    } catch {
      setMutationError('Could not update the cart. Stock may have changed.');
      await cart.refetch();
    } finally {
      setPendingProductId(null);
    }
  }

  async function remove(productId: string) {
    setPendingProductId(productId);
    setMutationError('');
    try {
      await makeApiRequest({ url: API_ENDPOINTS.cart.item(productId), method: 'DELETE' });
      if (!broadcastCartChange()) await refresh();
    } catch {
      setMutationError('Could not remove this item. Try again.');
      await cart.refetch();
    } finally {
      setPendingProductId(null);
    }
  }

  if (userLoading) return <CartSkeleton />;
  if (!userId)
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-md rounded-xl border border-border-subtle bg-surface-raised p-8 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-text-tertiary" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-semibold">Your shopping bag</h1>
          <p className="mt-2 text-sm text-text-secondary">Sign in to view and manage your cart.</p>
          <Button
            className="mt-5 px-4 py-2"
            onClick={() => router.push('/signin?redirect=%2Fcart')}
          >
            Sign in
          </Button>
        </div>
      </main>
    );
  if (cart.isLoading) return <CartSkeleton />;
  if (cart.isError)
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-xl font-semibold">Could not load your cart</h1>
        <p className="mt-2 text-sm text-text-secondary">Your cart is safe. Try loading it again.</p>
        <Button className="mt-5" onClick={() => void cart.refetch()}>
          Try again
        </Button>
      </main>
    );

  const items = cart.data?.items ?? [];
  return (
    <main className="mx-auto w-full max-w-6xl space-y-7 px-4 py-6 sm:px-6 sm:py-8">
      <div className="space-y-2">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Continue shopping
        </Link>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
            Shopping bag
          </h1>
          <p className="text-sm text-text-secondary">
            {cart.data?.itemCount ?? 0} {cart.data?.itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>
        <ol
          aria-label="Checkout progress"
          className="flex items-center gap-3 pt-2 text-xs font-medium text-text-tertiary sm:gap-5"
        >
          <li aria-current="step" className="flex items-center gap-2 text-accent-active">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-active text-xs text-on-accent">
              1
            </span>
            Bag
          </li>
          <li className="h-px flex-1 bg-secondary-accent-subtle" aria-hidden="true" />
          <li className="flex items-center gap-2 text-text-secondary">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary-accent-subtle text-xs text-secondary-accent">
              2
            </span>
            Delivery
          </li>
          <li className="h-px flex-1 bg-secondary-accent-subtle" aria-hidden="true" />
          <li className="flex items-center gap-2 text-text-secondary">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary-accent-subtle text-xs text-secondary-accent">
              3
            </span>
            Payment
          </li>
        </ol>
      </div>

      {mutationError && (
        <p
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger-subtle px-4 py-3 text-sm text-danger"
        >
          {mutationError}
        </p>
      )}

      {items.length === 0 ? (
        <section className="rounded-xl border border-border-subtle bg-surface-raised px-6 py-14 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-text-tertiary" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-semibold">Your cart is empty</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Find something you love and it will show up here.
          </p>
          <Button className="mt-6 px-4 py-2" onClick={() => router.push('/products')}>
            Browse products
          </Button>
        </section>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="space-y-4 lg:col-span-2">
            <section
              aria-label="Cart items"
              className="overflow-hidden rounded-xl border border-border-subtle bg-surface-raised"
            >
              <div className="divide-y divide-border-subtle px-4 sm:px-5">
                {items.map((item) =>
                  item.available ? (
                    <article key={item.productId} className="flex gap-4 py-5 sm:gap-5">
                      <Link
                        href={`/products/${item.slug}`}
                        aria-label={`View ${item.name}`}
                        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-subtle sm:h-28 sm:w-28"
                      >
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt=""
                            fill
                            sizes="112px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="flex h-full items-center justify-center text-center text-xs text-text-tertiary">
                            Image unavailable
                          </span>
                        )}
                      </Link>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap justify-between gap-3">
                          <div className="min-w-0">
                            <Link
                              href={`/products/${item.slug}`}
                              className="line-clamp-2 text-sm font-semibold text-text-primary sm:text-base"
                            >
                              {item.name}
                            </Link>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold tabular-nums text-text-primary">
                              {formatPrice(item.price)}
                            </p>
                            {Number(item.mrp) > Number(item.price) && (
                              <p className="mt-1 text-xs text-text-tertiary">
                                MRP <del>{formatPrice(item.mrp)}</del>
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          <div className="inline-flex h-9 items-center rounded-md border border-accent">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-sm"
                              aria-label={`Decrease ${item.name} quantity`}
                              disabled={item.quantity <= 1 || pendingProductId !== null}
                              onClick={() => void change(item.productId, item.quantity - 1)}
                              className="h-8 w-8 border-0"
                            >
                              <Minus className="size-4 text-text-primary" />
                            </Button>
                            <span
                              aria-live="polite"
                              className="w-9 text-center text-sm tabular-nums"
                            >
                              {item.quantity}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-sm"
                              aria-label={`Increase ${item.name} quantity`}
                              disabled={
                                item.quantity >= Math.min(item.stock, 999) ||
                                pendingProductId !== null
                              }
                              onClick={() => void change(item.productId, item.quantity + 1)}
                              className="h-8 w-8 border-0"
                            >
                              <Plus className="size-4 text-text-primary" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-4">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              aria-label={`Remove ${item.name} from cart`}
                              disabled={pendingProductId !== null}
                              onClick={() => void remove(item.productId)}
                              className="border-danger/30 bg-danger-subtle/ px-2 text-danger hover:bg-danger-subtle hover:text-danger py-1"
                            >
                              <Trash2 className="h-4 w-4 mr-1" aria-hidden="true" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ) : (
                    <article
                      key={item.productId}
                      className="flex flex-wrap items-center justify-between gap-4 py-4"
                    >
                      <div>
                        <p className="text-sm font-medium text-text-secondary">
                          Unavailable product
                        </p>
                        <p className="mt-1 text-xs text-text-tertiary">
                          This item is no longer available. Remove it to clean up your cart.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        aria-label="Remove unavailable item from cart"
                        disabled={pendingProductId !== null}
                        onClick={() => void remove(item.productId)}
                        className="border-danger/30 bg-danger-subtle px-2 text-danger hover:bg-danger-subtle hover:text-danger"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        Remove
                      </Button>
                    </article>
                  ),
                )}
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-xl bg-surface-raised p-5 shadow-sm lg:sticky lg:top-24">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
              <ShoppingBag className="h-5 w-5 text-accent" aria-hidden="true" />
              Order summary
            </h2>
            <div className="mt-5 space-y-3 text-sm mb-5">
              <div className="flex justify-between gap-4 text-text-secondary">
                <span>Items ({cart.data?.itemCount ?? 0})</span>
                <span className="tabular-nums">{formatPrice(cart.data?.subtotal ?? '0')}</span>
              </div>
            </div>
            <div className="flex justify-between gap-4 text-base font-semibold text-text-primary">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatPrice(cart.data?.subtotal ?? '0')}</span>
            </div>
            <Button
              type="button"
              size="lg"
              disabled={
                !cart.data?.items.length ||
                cart.data.items.some((item) => !item.available) ||
                pendingProductId !== null
              }
              onClick={() => router.push('/checkout')}
              className="mt-5 w-full bg-accent-active px-4 py-2 text-on-accent hover:bg-accent-hover"
            >
              Proceed to checkout
            </Button>
            <p className="mt-3 text-center text-xs text-text-tertiary flex items-center gap-0.5">
              Review your items and delivery address before placing your order.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}

function CartSkeleton() {
  return (
    <main
      className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6"
      role="status"
      aria-label="Loading cart"
    >
      <div className="h-9 w-56 animate-pulse rounded bg-surface-subtle" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-80 animate-pulse rounded-xl bg-surface-subtle lg:col-span-2" />
        <div className="h-64 animate-pulse rounded-xl bg-surface-subtle" />
      </div>
    </main>
  );
}
