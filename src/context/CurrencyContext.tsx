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
 * Example: 1 AED = 23.55 INR. 980,000 INR / 23.55 = 41,614 AED.
 */
export const DEFAULT_EXCHANGE_RATES: Record<string, number> = {
  INR: 1.0,
  USD: 86.5,      // 1 USD = 86.50 INR
  EUR: 91.2,      // 1 EUR = 91.20 INR
  GBP: 108.5,     // 1 GBP = 108.50 INR
  AED: 23.55,     // 1 AED = 23.55 INR (e.g. ₹980,000 -> AED 41,614)
  CAD: 60.8,      // 1 CAD = 60.80 INR
  AUD: 55.4,      // 1 AUD = 55.40 INR
  SGD: 64.2,      // 1 SGD = 64.20 INR
};

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
  customRates?: Record<string, number>
): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    amount = 0;
  }
  
  // Calculate converted actual monetary value
  const converted = convertCurrency(amount, fromCode, currencyCode, customRates);
  const rounded = Math.round(converted);
  const cur = CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0];

  let numFormatted = '';
  const absStr = Math.abs(rounded).toString();

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
  setCurrencyCode: (code: string) => void;
  updateExchangeRate: (code: string, rateInINR: number) => void;
  resetExchangeRates: () => void;
  convertAmount: (amount: number, fromCode?: string, toCode?: string) => number;
  formatCurrency: (amount: number, overrideCode?: string, fromCode?: string) => string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currencies: CURRENCIES,
  currencyCode: 'INR',
  currency: CURRENCIES[0],
  symbol: '₹',
  baseCurrency: 'INR',
  exchangeRates: DEFAULT_EXCHANGE_RATES,
  setCurrencyCode: () => {},
  updateExchangeRate: () => {},
  resetExchangeRates: () => {},
  convertAmount: (amount: number) => amount,
  formatCurrency: (amount: number) => formatCurrencyDeterministic(amount, 'INR', 'INR'),
});

/**
 * Automatically detects the default currency based on the system timezone and browser locale.
 * If the location is not matched, falls back to USD as requested.
 */
export function detectSystemCurrency(): string {
  if (typeof window === 'undefined') return 'USD';
  try {
    // 1. Check system timezone
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz) {
      if (tz.includes('Kolkata') || tz.includes('Calcutta') || tz.includes('India')) return 'INR';
      if (
        tz.includes('London') ||
        tz.includes('Belfast') ||
        tz.includes('Europe/Jersey') ||
        tz.includes('Europe/Guernsey') ||
        tz.includes('Europe/Isle_of_Man')
      ) return 'GBP';
      if (tz.includes('Dubai') || tz.includes('Abu_Dhabi') || tz.includes('Muscat')) return 'AED';
      if (tz.startsWith('Australia/')) return 'AUD';
      if (tz === 'Asia/Singapore') return 'SGD';
      if (
        tz.includes('Toronto') ||
        tz.includes('Vancouver') ||
        tz.includes('Montreal') ||
        tz.includes('Edmonton') ||
        tz.includes('Winnipeg') ||
        tz.includes('Halifax') ||
        tz.includes('St_Johns') ||
        tz.includes('Regina')
      ) return 'CAD';
      if (
        tz.startsWith('Europe/') &&
        !tz.includes('London') &&
        !tz.includes('Kyiv') &&
        !tz.includes('Moscow') &&
        !tz.includes('Istanbul')
      ) return 'EUR';
      if (tz.startsWith('America/') || tz.startsWith('US/') || tz.startsWith('Pacific/Honolulu')) return 'USD';
    }

    // 2. Check system browser languages
    const langs = [navigator.language, ...(navigator.languages || [])].filter(Boolean);
    for (const lang of langs) {
      const l = lang.toLowerCase();
      if (
        l.endsWith('-in') ||
        l.startsWith('hi') ||
        l.startsWith('gu') ||
        l.startsWith('ta') ||
        l.startsWith('te') ||
        l.startsWith('mr') ||
        l.startsWith('kn') ||
        l.startsWith('ml') ||
        l.startsWith('pa') ||
        l.startsWith('bn')
      ) {
        return 'INR';
      }
      if (l.endsWith('-gb') || l.endsWith('-uk')) return 'GBP';
      if (l.endsWith('-ae')) return 'AED';
      if (l.endsWith('-ca')) return 'CAD';
      if (l.endsWith('-au')) return 'AUD';
      if (l.endsWith('-sg')) return 'SGD';
      if (
        l.endsWith('-de') ||
        l.endsWith('-fr') ||
        l.endsWith('-es') ||
        l.endsWith('-it') ||
        l.endsWith('-nl') ||
        l.endsWith('-pt') ||
        l.endsWith('-at') ||
        l.endsWith('-be') ||
        l.endsWith('-ie') ||
        l.endsWith('-fi') ||
        l.endsWith('-gr')
      ) {
        return 'EUR';
      }
      if (l.endsWith('-us')) return 'USD';
    }
  } catch {}

  // Fallback if not found: USD
  return 'USD';
}

export const CURRENCY_STORAGE_KEY = 'pixeva_currency_code';
export const EXCHANGE_RATES_STORAGE_KEY = 'pixeva_exchange_rates';

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currencyCode, setCurrencyCodeState] = useState<string>('USD');
  const [exchangeRates, setExchangeRatesState] = useState<Record<string, number>>(DEFAULT_EXCHANGE_RATES);

  useEffect(() => {
    try {
      const savedCode = localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (savedCode && CURRENCIES.some((c) => c.code === savedCode)) {
        setCurrencyCodeState(savedCode);
      } else {
        const detected = detectSystemCurrency();
        const initialCode = CURRENCIES.some((c) => c.code === detected) ? detected : 'USD';
        setCurrencyCodeState(initialCode);
      }

      const savedRates = localStorage.getItem(EXCHANGE_RATES_STORAGE_KEY);
      if (savedRates) {
        const parsed = JSON.parse(savedRates);
        setExchangeRatesState((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}

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
    setExchangeRatesState((prev) => {
      const next = { ...prev, [code]: rateInINR };
      try {
        localStorage.setItem(EXCHANGE_RATES_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const resetExchangeRates = () => {
    setExchangeRatesState(DEFAULT_EXCHANGE_RATES);
    try {
      localStorage.removeItem(EXCHANGE_RATES_STORAGE_KEY);
    } catch {}
  };

  const currency = CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0];

  const convertAmount = (amount: number, fromCode: string = 'INR', toCode: string = currencyCode) => {
    return convertCurrency(amount, fromCode, toCode, exchangeRates);
  };

  const formatCurrency = (amount: number, overrideCode?: string, fromCode: string = 'INR') => {
    return formatCurrencyDeterministic(amount, overrideCode || currencyCode, fromCode, exchangeRates);
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
