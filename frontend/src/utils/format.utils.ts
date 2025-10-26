// frontend/utils/format.utils.ts
export function formatCurrency(cents: number, currency = 'USD', locale?: string) {
  try {
    return new Intl.NumberFormat(locale || undefined, { style: 'currency', currency }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
}

export function formatDate(iso: string, locale?: string, opts?: Intl.DateTimeFormatOptions) {
  try {
    return new Intl.DateTimeFormat(locale || undefined, opts || { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
  } catch {
    return new Date(iso).toLocaleString();
  }
}

export function truncate(text: string, max = 120) {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + '…';
}
