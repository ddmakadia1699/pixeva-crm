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
    example: '$980,000',
  },
  {
    code: 'EUR',
    symbol: '€',
    name: 'Euro (EUR)',
    flag: '🇪🇺',
    locale: 'de-DE',
    example: '€980.000',
  },
  {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound (GBP)',
    flag: '🇬🇧',
    locale: 'en-GB',
    example: '£980,000',
  },
  {
    code: 'AED',
    symbol: 'AED ',
    name: 'UAE Dirham (AED)',
    flag: '🇦🇪',
    locale: 'en-AE',
    example: 'AED 980,000',
  },
  {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar (CAD)',
    flag: '🇨🇦',
    locale: 'en-CA',
    example: 'CA$980,000',
  },
  {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar (AUD)',
    flag: '🇦🇺',
    locale: 'en-AU',
    example: 'A$980,000',
  },
  {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar (SGD)',
    flag: '🇸🇬',
    locale: 'en-SG',
    example: 'S$980,000',
  },
];

export function formatCurrencyDeterministic(amount: number, currencyCode: string = 'INR'): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    amount = 0;
  }
  const rounded = Math.round(amount);
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
  setCurrencyCode: (code: string) => void;
  formatCurrency: (amount: number, overrideCode?: string) => string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currencies: CURRENCIES,
  currencyCode: 'INR',
  currency: CURRENCIES[0],
  symbol: '₹',
  setCurrencyCode: () => {},
  formatCurrency: (amount: number) => formatCurrencyDeterministic(amount, 'INR'),
});

export const CURRENCY_STORAGE_KEY = 'pixeva_currency_code';

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currencyCode, setCurrencyCodeState] = useState<string>('INR');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (saved && CURRENCIES.some((c) => c.code === saved)) {
        setCurrencyCodeState(saved);
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

  const currency = CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0];

  const formatCurrency = (amount: number, overrideCode?: string) => {
    return formatCurrencyDeterministic(amount, overrideCode || currencyCode);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currencies: CURRENCIES,
        currencyCode,
        currency,
        symbol: currency.symbol,
        setCurrencyCode,
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
