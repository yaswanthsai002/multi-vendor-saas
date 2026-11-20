const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
export const formatOrderMoney = (value: string) => currency.format(Number(value));
export const formatOrderDate = (value: string) =>
  new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
export const formatOrderDateTime = (value: string) =>
  new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
export const shortOrderReference = (value: string) =>
  `#${value.replace(/^PG-/, '').slice(0, 8).toUpperCase()}`;
