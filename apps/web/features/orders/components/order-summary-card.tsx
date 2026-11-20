import { formatCheckoutPrice } from '../utils/checkout-price';

export function OrderSummaryCard({ itemCount, total }: { itemCount: number; total: string }) {
  return (
    <section className="border-t border-border-control pt-5">
      <h2 className="text-base font-semibold">Order summary</h2>
      <dl className="mt-4 space-y-4 text-sm">
        <div className="flex justify-between gap-4 text-text-secondary">
          <dt>
            Items subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </dt>
          <dd className="tabular-nums">{formatCheckoutPrice(total)}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-border-default pt-4 font-semibold">
          <dt>Vendor order total</dt>
          <dd className="text-lg tabular-nums">{formatCheckoutPrice(total)}</dd>
        </div>
      </dl>
    </section>
  );
}
