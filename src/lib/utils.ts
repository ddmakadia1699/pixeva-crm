import { formatCurrencyDeterministic, CURRENCY_STORAGE_KEY } from '@/context/CurrencyContext';

/**
 * Formats a numeric currency value dynamically using active studio currency.
 * Avoids locale-dependent React hydration mismatch errors by using deterministic formatting.
 */
export function formatCurrency(amount: number, overrideCode?: string): string {
  let activeCode = overrideCode;
  if (!activeCode && typeof window !== 'undefined') {
    try {
      activeCode = localStorage.getItem(CURRENCY_STORAGE_KEY) || 'INR';
    } catch {
      activeCode = 'INR';
    }
  }
  return formatCurrencyDeterministic(amount, activeCode || 'INR');
}

export { formatCurrencyDeterministic } from '@/context/CurrencyContext';
