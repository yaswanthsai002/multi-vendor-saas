import type { CustomerOrder } from '../types/customer-order.types';

export function CustomerOrderFulfillments({
  fulfillments,
  items,
}: {
  items: CustomerOrder['items'];
  fulfillments: CustomerOrder['fulfillments'];
}) {
  return (
    <section aria-label="Seller fulfillment" className="border-t border-border-control pt-6">
      <h2 className="text-lg font-semibold">Seller updates</h2>
      <div className="mt-4 divide-y divide-border-control">
        {fulfillments.map((portion, index) => (
          <div key={portion.orderItemIds.join(',') || index} className="py-4 first:pt-0">
            <div className="flex flex-wrap justify-between gap-2">
              <h3 className="text-sm font-medium">{portion.vendorName}</h3>
              <span className="text-sm capitalize">{portion.status}</span>
            </div>
            <ul className="mt-2 space-y-1 text-sm text-text-secondary">
              {items
                .filter((item) => portion.orderItemIds.includes(item.orderItemId))
                .map((item) => (
                  <li key={item.orderItemId}>
                    {item.name} - Quantity: {item.quantity}
                  </li>
                ))}
            </ul>
            {portion.cancellation && (
              <p className="mt-2 text-sm text-text-secondary">
                {portion.cancellation.reason}
                {portion.cancellation.cancelledAt
                  ? ` · ${new Date(portion.cancellation.cancelledAt).toLocaleDateString()}`
                  : ''}
              </p>
            )}
            {portion.status === 'completed' && portion.completedAt && (
              <p className="mt-2 text-sm text-text-secondary">
                Marked complete by the seller · {new Date(portion.completedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
