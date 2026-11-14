const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

export function formatCheckoutPrice(value: string) {
  return currency.format(Number(value));
}
