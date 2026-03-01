'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import type { Locale } from '@/i18n/config';
import { resolveStartupLocale, persistLocale } from '@/i18n/getLocale';

import enMessages from '@/i18n/messages/en.json';
import ukMessages from '@/i18n/messages/uk.json';
import roMessages from '@/i18n/messages/ro.json';

const MESSAGES: Record<Locale, Record<string, unknown>> = {
  en: enMessages,
  uk: ukMessages,
  ro: roMessages,
};

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Run only on client to avoid SSR/hydration mismatch
    const resolved = resolveStartupLocale();
    setLocaleState(resolved);
    setMounted(true);
  }, []);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    persistLocale(next);
  };

  const contextValue = useMemo<LanguageContextValue>(
    () => ({ locale, setLocale }),
    [locale]
  );

  const messages = MESSAGES[locale];

  if (!mounted) {
    // Render with English during SSR / before hydration to avoid mismatch
    return (
      <LanguageContext.Provider value={{ locale: 'en', setLocale }}>
        <NextIntlClientProvider locale="en" messages={MESSAGES.en}>
          {children}
        </NextIntlClientProvider>
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={contextValue}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
