import { 
  formatCurrencyDeterministic, 
  convertCurrency,
  CURRENCY_STORAGE_KEY, 
  EXCHANGE_RATES_STORAGE_KEY,
  DEFAULT_EXCHANGE_RATES 
} from '@/context/CurrencyContext';

/**
 * Formats a numeric currency value dynamically using active studio currency with accurate exchange conversion.
 * Avoids locale-dependent React hydration mismatch errors by using deterministic formatting.
 */
export function formatCurrency(amount: number, overrideCode?: string, fromCode: string = 'INR'): string {
  let activeCode = overrideCode;
  let customRates: Record<string, number> | undefined;

  if (typeof window !== 'undefined') {
    try {
      if (!activeCode) {
        activeCode = localStorage.getItem(CURRENCY_STORAGE_KEY) || 'INR';
      }
      const savedRates = localStorage.getItem(EXCHANGE_RATES_STORAGE_KEY);
      if (savedRates) {
        customRates = JSON.parse(savedRates);
      }
    } catch {
      activeCode = 'INR';
    }
  }
  return formatCurrencyDeterministic(amount, activeCode || 'INR', fromCode, customRates);
}

export { formatCurrencyDeterministic, convertCurrency } from '@/context/CurrencyContext';
