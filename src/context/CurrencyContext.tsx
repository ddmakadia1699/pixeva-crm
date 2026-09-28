'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  locale: string;
  example: string;
}

/**
 * Exchange rates relative to INR base currency.
 * 1 unit of foreign currency = X INR.
 * Live rates for today are fetched on load (see fetchTodaysRates); these values
 * are only the offline fallback when the rates API cannot be reached.
 */
export const DEFAULT_EXCHANGE_RATES: Record<string, number> = {
  INR: 1.0,
  USD: 95.9424,
  EUR: 109.2691,
  GBP: 127.0832,
  AED: 26.1245,
  CAD: 67.8078,
  AUD: 67.4286,
  SGD: 75.0839,
};

// Free, key-less daily rates (CORS enabled). Second URL is the project's official mirror.
const RATES_API_URLS = [
  'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/inr.json',
  'https://latest.currency-api.pages.dev/v1/currencies/inr.json',
];

export type RatesStatus = 'loading' | 'live' | 'stale' | 'fallback';

/** Today's date in the viewer's local timezone, as YYYY-MM-DD. */
export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function fetchTodaysRates(): Promise<{ date: string; rates: Record<string, number> }> {
  let lastErr: unknown = null;
  for (const url of RATES_API_URLS) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const perInr: Record<string, number> = json?.inr || {};
      const rates: Record<string, number> = { INR: 1.0 };
      for (const code of Object.keys(DEFAULT_EXCHANGE_RATES)) {
        if (code === 'INR') continue;
        const value = perInr[code.toLowerCase()];
        // API gives 1 INR = value X; we store 1 X = ? INR.
        if (typeof value === 'number' && value > 0) rates[code] = 1 / value;
      }
      return { date: json?.date || todayKey(), rates };
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

export const CURRENCIES: CurrencyOption[] = [
  {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee (INR)',
    flag: '🇮🇳',
    locale: 'en-IN',
    example: '₹9,80,000',
  },
  {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar (USD)',
    flag: '🇺🇸',
    locale: 'en-US',
    example: '$11,329',
  },
  {
    code: 'EUR',
    symbol: '€',
    name: 'Euro (EUR)',
    flag: '🇪🇺',
    locale: 'de-DE',
    example: '€10.746',
  },
  {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound (GBP)',
    flag: '🇬🇧',
    locale: 'en-GB',
    example: '£9,032',
  },
  {
    code: 'AED',
    symbol: 'AED ',
    name: 'UAE Dirham (AED)',
    flag: '🇦🇪',
    locale: 'en-AE',
    example: 'AED 41,614',
  },
  {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar (CAD)',
    flag: '🇨🇦',
    locale: 'en-CA',
    example: 'CA$16,118',
  },
  {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar (AUD)',
    flag: '🇦🇺',
    locale: 'en-AU',
    example: 'A$17,690',
  },
  {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar (SGD)',
    flag: '🇸🇬',
    locale: 'en-SG',
    example: 'S$15,265',
  },
];

/**
 * Converts a monetary amount from a base currency into the target currency using exchange rates.
 */
export function convertCurrency(
  amount: number,
  fromCode: string = 'INR',
  toCode: string = 'INR',
  customRates?: Record<string, number>
): number {
  if (isNaN(amount) || amount === null || amount === undefined) return 0;
  if (fromCode === toCode) return amount;

  const rates: Record<string, number> = { ...DEFAULT_EXCHANGE_RATES, ...(customRates || {}) };
  const fromRate = rates[fromCode] || 1.0;
  const toRate = rates[toCode] || 1.0;

  // Convert source currency to INR base, then to target currency
  const inrValue = amount * fromRate;
  const converted = inrValue / toRate;
  return converted;
}

/**
 * Formats a numeric currency value deterministically with exchange conversion from base INR.
 */
export function formatCurrencyDeterministic(
  amount: number,
  currencyCode: string = 'INR',
  fromCode: string = 'INR',
  customRates?: Record<string, number>,
  decimals: number = 0
): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    amount = 0;
  }
  
  // Calculate converted actual monetary value
  const converted = convertCurrency(amount, fromCode, currencyCode, customRates);
  const rounded = Number(converted.toFixed(decimals));
  const cur = CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0];

  let numFormatted = '';
  const [absStr, fraction] = Math.abs(rounded).toFixed(decimals).split('.');

  if (cur.code === 'INR') {
    // Deterministic Indian numbering: last 3 digits, then groups of 2 (e.g. 9,80,000)
    if (absStr.length <= 3) {
      numFormatted = absStr;
    } else {
      const last3 = absStr.slice(-3);
      const other = absStr.slice(0, -3);
      numFormatted = other.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
    }
  } else if (cur.code === 'EUR') {
    numFormatted = absStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  } else {
    numFormatted = absStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  if (fraction) numFormatted += (cur.code === 'EUR' ? ',' : '.') + fraction;

  const sign = rounded < 0 ? '-' : '';
  return `${sign}${cur.symbol}${numFormatted}`;
}

interface CurrencyContextType {
  currencies: CurrencyOption[];
  currencyCode: string;
  currency: CurrencyOption;
  symbol: string;
  baseCurrency: string;
  exchangeRates: Record<string, number>;
  ratesDate: string | null;
  ratesStatus: RatesStatus;
  refreshRates: () => Promise<void>;
  setCurrencyCode: (code: string) => void;
  updateExchangeRate: (code: string, rateInINR: number) => void;
  resetExchangeRates: () => void;
  convertAmount: (amount: number, fromCode?: string, toCode?: string) => number;
  formatCurrency: (amount: number, overrideCode?: string, fromCode?: string, decimals?: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currencies: CURRENCIES,
  currencyCode: 'INR',
  currency: CURRENCIES[0],
  symbol: '₹',
  baseCurrency: 'INR',
  exchangeRates: DEFAULT_EXCHANGE_RATES,
  ratesDate: null,
  ratesStatus: 'fallback',
  refreshRates: async () => {},
  setCurrencyCode: () => {},
  updateExchangeRate: () => {},
  resetExchangeRates: () => {},
  convertAmount: (amount: number) => amount,
  formatCurrency: (amount: number) => formatCurrencyDeterministic(amount, 'INR', 'INR'),
});

export const CURRENCY_STORAGE_KEY = 'pixeva_currency_code';
// Legacy key: held a full rates map that would permanently override live rates.
export const EXCHANGE_RATES_STORAGE_KEY = 'pixeva_exchange_rates';
// Cached live rates: { fetchedOn, date, rates }
export const LIVE_RATES_STORAGE_KEY = 'pixeva_live_rates';
// Manual rate edits, valid only for the day they were made: { date, rates }
export const RATE_OVERRIDES_STORAGE_KEY = 'pixeva_rate_overrides';

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currencyCode, setCurrencyCodeState] = useState<string>('INR');
  const [baseRates, setBaseRates] = useState<Record<string, number>>(DEFAULT_EXCHANGE_RATES);
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [ratesDate, setRatesDate] = useState<string | null>(null);
  const [ratesStatus, setRatesStatus] = useState<RatesStatus>('loading');

  const exchangeRates = { ...baseRates, ...overrides };

  const refreshRates = async () => {
    setRatesStatus('loading');
    try {
      const { date, rates } = await fetchTodaysRates();
      setBaseRates({ ...DEFAULT_EXCHANGE_RATES, ...rates });
      setRatesDate(date);
      setRatesStatus('live');
      try {
        localStorage.setItem(LIVE_RATES_STORAGE_KEY, JSON.stringify({ fetchedOn: todayKey(), date, rates }));
      } catch {}
    } catch (err) {
      console.warn('[CurrencyContext] Could not fetch today\'s exchange rates:', err);
      setRatesStatus((prev) => (prev === 'loading' ? (ratesDate ? 'stale' : 'fallback') : prev));
    }
  };

  useEffect(() => {
    let cachedFetchedOn: string | null = null;
    try {
      const savedCode = localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (savedCode && CURRENCIES.some((c) => c.code === savedCode)) {
        setCurrencyCodeState(savedCode);
      }

      localStorage.removeItem(EXCHANGE_RATES_STORAGE_KEY);

      const cached = JSON.parse(localStorage.getItem(LIVE_RATES_STORAGE_KEY) || 'null');
      if (cached?.rates) {
        setBaseRates({ ...DEFAULT_EXCHANGE_RATES, ...cached.rates });
        setRatesDate(cached.date || null);
        cachedFetchedOn = cached.fetchedOn || null;
      }

      const savedOverrides = JSON.parse(localStorage.getItem(RATE_OVERRIDES_STORAGE_KEY) || 'null');
      if (savedOverrides?.date === todayKey() && savedOverrides.rates) {
        setOverrides(savedOverrides.rates);
      } else {
        localStorage.removeItem(RATE_OVERRIDES_STORAGE_KEY);
      }
    } catch {}

    if (cachedFetchedOn === todayKey()) {
      setRatesStatus('live');
    } else {
      refreshRates();
    }

    const handleCurrencyEvent = (e: any) => {
      if (e.detail && CURRENCIES.some((c) => c.code === e.detail)) {
        setCurrencyCodeState(e.detail);
      }
    };

    window.addEventListener('pixeva_currency_changed', handleCurrencyEvent);
    return () => {
      window.removeEventListener('pixeva_currency_changed', handleCurrencyEvent);
    };
  }, []);

  const setCurrencyCode = (code: string) => {
    if (!CURRENCIES.some((c) => c.code === code)) return;
    setCurrencyCodeState(code);
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, code);
      window.dispatchEvent(new CustomEvent('pixeva_currency_changed', { detail: code }));
    } catch {}
  };

  const updateExchangeRate = (code: string, rateInINR: number) => {
    if (code === 'INR' || isNaN(rateInINR) || rateInINR <= 0) return;
    setOverrides((prev) => {
      const next = { ...prev, [code]: rateInINR };
      try {
        localStorage.setItem(RATE_OVERRIDES_STORAGE_KEY, JSON.stringify({ date: todayKey(), rates: next }));
      } catch {}
      return next;
    });
  };

  // Drops manual edits and goes back to today's live rates.
  const resetExchangeRates = () => {
    setOverrides({});
    try {
      localStorage.removeItem(RATE_OVERRIDES_STORAGE_KEY);
    } catch {}
    refreshRates();
  };

  const currency = CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0];

  const convertAmount = (amount: number, fromCode: string = 'INR', toCode: string = currencyCode) => {
    return convertCurrency(amount, fromCode, toCode, exchangeRates);
  };

  const formatCurrency = (amount: number, overrideCode?: string, fromCode: string = 'INR', decimals: number = 0) => {
    return formatCurrencyDeterministic(amount, overrideCode || currencyCode, fromCode, exchangeRates, decimals);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currencies: CURRENCIES,
        currencyCode,
        currency,
        symbol: currency.symbol,
        baseCurrency: 'INR',
        exchangeRates,
        ratesDate,
        ratesStatus,
        refreshRates,
        setCurrencyCode,
        updateExchangeRate,
        resetExchangeRates,
        convertAmount,
        formatCurrency,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
