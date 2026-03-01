import { LOCALES, DEFAULT_LOCALE, LOCALE_STORAGE_KEY } from './config';
import type { Locale } from './config';

/**
 * Detect browser locale and map to a supported locale.
 * Falls back to DEFAULT_LOCALE if no match found.
 */
export function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE;

  const langs = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];

  for (const lang of langs) {
    const tag = lang.toLowerCase();
    if (tag.startsWith('uk') || tag.startsWith('ua')) return 'uk';
    if (tag.startsWith('ro')) return 'ro';
    if (tag.startsWith('en')) return 'en';
  }

  return DEFAULT_LOCALE;
}

/**
 * Read persisted locale from localStorage.
 * Returns null if not set or running server-side.
 */
export function getPersistedLocale(): Locale | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const val = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (val && (LOCALES as readonly string[]).includes(val)) {
      return val as Locale;
    }
  } catch {
    // localStorage not available
  }
  return null;
}

/**
 * Persist locale to localStorage.
 */
export function persistLocale(locale: Locale): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // ignore
  }
}

/**
 * Resolve the best locale on app startup:
 * 1. Persisted preference
 * 2. Browser language detection
 * 3. Default (en)
 */
export function resolveStartupLocale(): Locale {
  return getPersistedLocale() ?? detectBrowserLocale();
}

export type { Locale };
