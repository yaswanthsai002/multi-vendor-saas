export function OrderCustomerCard({
  name,
  email,
  phone,
}: {
  name: string;
  email: string;
  phone: string | null;
}) {
  return (
    <section>
      <h2 className="text-base font-semibold">Customer</h2>
      <p className="mt-4 text-sm font-medium">{name || 'Customer'}</p>
      <p className="mt-2 break-all text-sm text-text-secondary">{email || 'No email provided'}</p>
      {phone && <p className="mt-2 text-sm text-text-secondary">{phone}</p>}
    </section>
  );
}
