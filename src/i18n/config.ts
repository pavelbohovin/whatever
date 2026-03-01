export const LOCALES = ['en', 'uk', 'ro', 'pl', 'de', 'fr'] as const;
export type Locale = typeof LOCALES[number];
export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  uk: 'Українська',
  ro: 'Română',
  pl: 'Polski',
  de: 'Deutsch',
  fr: 'Français',
};

export const LOCALE_STORAGE_KEY = 'whatever_locale';
