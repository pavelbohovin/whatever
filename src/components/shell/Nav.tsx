'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function Nav() {
  const t = useTranslations('nav');

  return (
    <nav className="flex items-center gap-6 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <Link href="/" className="font-bold text-xl text-whatever-primary">
        {t('brand')}
      </Link>
      <Link href="/build" className="text-gray-600 dark:text-gray-400 hover:text-whatever-primary">
        {t('build')}
      </Link>
      <Link href="/marketplace" className="text-gray-600 dark:text-gray-400 hover:text-whatever-primary">
        {t('marketplace')}
      </Link>
      <Link href="/settings" className="text-gray-600 dark:text-gray-400 hover:text-whatever-primary ml-auto">
        {t('settings')}
      </Link>
    </nav>
  );
}
