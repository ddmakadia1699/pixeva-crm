import { 
  formatCurrencyDeterministic, 
  convertCurrency,
  CURRENCY_STORAGE_KEY, 
  LIVE_RATES_STORAGE_KEY,
  RATE_OVERRIDES_STORAGE_KEY,
  DEFAULT_EXCHANGE_RATES,
  todayKey,
} from '@/context/CurrencyContext';

/**
 * Parses a user-typed amount such as "2,00,000.50" or "AED 2000.5", keeping the decimal part.
 */
export function parseAmount(value: string | number | null | undefined): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  const cleaned = String(value ?? '').replace(/[^0-9.]/g, '');
  const [whole, ...fraction] = cleaned.split('.');
  const n = parseFloat(fraction.length ? `${whole || '0'}.${fraction.join('')}` : whole);
  return isNaN(n) ? 0 : n;
}

/** Rounds a monetary value to 2 decimal places (paise / fils / cents). */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

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
      // Same rates the CurrencyProvider uses: today's cached live rates plus today's manual edits.
      const live = JSON.parse(localStorage.getItem(LIVE_RATES_STORAGE_KEY) || 'null');
      const overrides = JSON.parse(localStorage.getItem(RATE_OVERRIDES_STORAGE_KEY) || 'null');
      customRates = {
        ...DEFAULT_EXCHANGE_RATES,
        ...(live?.rates || {}),
        ...(overrides?.date === todayKey() ? overrides.rates : {}),
      };
    } catch {
      activeCode = 'INR';
    }
  }
  return formatCurrencyDeterministic(amount, activeCode || 'INR', fromCode, customRates);
}

export { formatCurrencyDeterministic, convertCurrency } from '@/context/CurrencyContext';
