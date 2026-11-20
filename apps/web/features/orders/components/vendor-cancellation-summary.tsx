import type { VendorOrderDetail } from '../types/order.types';

export function VendorCancellationSummary({ order }: { order: VendorOrderDetail }) {
  const cancellation = order.fulfillment.cancellation;
  if (!cancellation) return null;
  return (
    <section aria-label="Cancellation summary" className="border-t border-border-control pt-6">
      <h2 className="text-lg font-semibold">Cancellation summary</h2>
      <p className="mt-2 text-sm">{cancellation.reason}</p>
      {cancellation.cancelledAt && (
        <p className="mt-1 text-sm text-text-secondary">
          {new Date(cancellation.cancelledAt).toLocaleString()}
        </p>
      )}
      <p className="mt-3 text-xs text-text-secondary">
        These quantities record this cancellation. They are not a current damaged-stock balance.
      </p>
      <dl className="mt-4 divide-y divide-border-control">
        {order.items.map((item) => (
          <div key={item.orderItemId} className="py-3">
            <dt className="text-sm font-medium">{item.productName}</dt>
            <dd className="mt-1 text-sm text-text-secondary">
              Ordered: {item.quantity} · Returned:{' '}
              {item.cancellationQuantities?.returnedQuantity ?? 0} · Damaged:{' '}
              {item.cancellationQuantities?.damagedQuantity ?? 0} · Missing:{' '}
              {item.cancellationQuantities?.missingQuantity ?? 0}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
