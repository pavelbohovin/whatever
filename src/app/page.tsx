'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { localizeString } from '@/types';

const MODULE_IDS = [
  { id: 'banking', icon: '🏦' },
  { id: 'messenger', icon: '💬' },
  { id: 'videos', icon: '🎬' },
  { id: 'food', icon: '🍽️' },
  { id: 'health', icon: '❤️' },
  { id: 'accounting', icon: '📊' },
  { id: 'work', icon: '💼' },
  { id: 'books', icon: '📚' },
  { id: 'travel', icon: '✈️' },
  { id: 'reminder', icon: '⏰' },
  { id: 'investing', icon: '📈' },
  { id: 'games', icon: '🎮' },
  { id: 'translator', icon: '🌐' },
] as const;

export default function HomePage() {
  const { user, miniApps } = useApp();
  const { locale } = useLanguage();
  const t = useTranslations('home');

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">
        {user?.name ? t('welcomeUser', { name: user.name }) : t('welcome')}
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">{t('subtitle')}</p>

      {miniApps.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4">{t('myApps')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {miniApps.map((app) => (
              <Link
                key={app.id}
                href={`/run/${app.id}`}
                className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition"
              >
                <span className="text-3xl mb-2">{app.icon}</span>
                <span className="font-medium text-center">
                  {localizeString(app.name, locale)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">{t('getStarted')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/build"
            className="flex items-center gap-4 p-6 bg-whatever-primary text-white rounded-xl shadow-md hover:opacity-90 transition"
          >
            <span className="text-4xl">🛠️</span>
            <div>
              <h3 className="font-bold text-lg">{t('buildTitle')}</h3>
              <p className="text-white/90 text-sm">{t('buildDesc')}</p>
            </div>
          </Link>
          <Link
            href="/marketplace"
            className="flex items-center gap-4 p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition"
          >
            <span className="text-4xl">📦</span>
            <div>
              <h3 className="font-bold text-lg">{t('marketplaceTitle')}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t('marketplaceDesc')}</p>
            </div>
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">{t('modules')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {MODULE_IDS.map((m) => (
            <div
              key={m.id}
              className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg opacity-75"
            >
              <span className="text-2xl mb-1">{m.icon}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{t(`moduleNames.${m.id}`)}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">{t('comingSoon')}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
