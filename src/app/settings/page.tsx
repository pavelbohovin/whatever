'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { LOCALES, LOCALE_LABELS } from '@/i18n/config';
import type { Locale } from '@/i18n/config';

export default function SettingsPage() {
  const { user, setUser } = useApp();
  const { locale, setLocale } = useLanguage();
  const t = useTranslations('settings');
  const [name, setName] = useState(user?.name ?? '');
  const [apiKey, setApiKey] = useState('');
  const [keySaved, setKeySaved] = useState(false);

  const saveProfile = () => {
    const id = user?.id ?? `user_${Date.now()}`;
    setUser({
      id,
      name: name || 'User',
      createdAt: user?.createdAt ?? new Date().toISOString(),
      language: locale,
    });
  };

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('whatever_llm_key', apiKey.trim());
      setKeySaved(true);
      setApiKey('');
    }
  };

  const handleLocaleChange = (next: Locale) => {
    setLocale(next);
    if (user) {
      setUser({ ...user, language: next });
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-8">{t('title')}</h1>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">{t('profile')}</h2>
        <div>
          <label className="block text-sm font-medium mb-1">{t('name')}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        <button
          onClick={saveProfile}
          className="mt-3 px-4 py-2 bg-whatever-primary text-white rounded-lg"
        >
          {t('save')}
        </button>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">{t('language')}</h2>
        <p className="text-sm text-gray-600 mb-3">{t('languageDesc')}</p>
        <div className="flex flex-col gap-2">
          {LOCALES.map((loc) => (
            <label
              key={loc}
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
                locale === loc
                  ? 'border-whatever-primary bg-whatever-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="language"
                value={loc}
                checked={locale === loc}
                onChange={() => handleLocaleChange(loc)}
                className="accent-whatever-primary"
              />
              <span className="font-medium">{LOCALE_LABELS[loc]}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">{t('aiProviders')}</h2>
        <p className="text-sm text-gray-600 mb-3">{t('aiProvidersDesc')}</p>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={t('apiKeyPlaceholder')}
          className="w-full border rounded-lg px-3 py-2 mb-2"
        />
        <button
          onClick={saveApiKey}
          disabled={!apiKey.trim()}
          className="px-4 py-2 bg-whatever-primary text-white rounded-lg disabled:opacity-50"
        >
          {t('saveKey')}
        </button>
        {keySaved && <p className="text-green-600 text-sm mt-2">{t('keySaved')}</p>}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">{t('integrations')}</h2>
        <p className="text-gray-500 text-sm">{t('integrationsDesc')}</p>
      </section>
    </div>
  );
}
