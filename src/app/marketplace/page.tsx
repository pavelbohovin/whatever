'use client';

import { useTranslations } from 'next-intl';
import { useApp } from '@/context/AppContext';
import { expenseTrackerTemplate } from '@/templates/expense-tracker';
import { habitTrackerTemplate } from '@/templates/habit-tracker';
import type { MiniApp } from '@/types';

const TEMPLATE_IDS = ['expense', 'habit', 'books', 'travel', 'translator', 'inbox'] as const;
type TemplateId = (typeof TEMPLATE_IDS)[number];

const TEMPLATE_META: Record<TemplateId, { icon: string; template: Omit<MiniApp, 'id' | 'createdAt' | 'updatedAt'> | null }> = {
  expense: { icon: '💰', template: expenseTrackerTemplate },
  habit: { icon: '✅', template: habitTrackerTemplate },
  books: { icon: '📚', template: null },
  travel: { icon: '✈️', template: null },
  translator: { icon: '🌐', template: null },
  inbox: { icon: '📥', template: null },
};

export default function MarketplacePage() {
  const { addMiniApp } = useApp();
  const t = useTranslations('marketplace');

  const install = (id: TemplateId) => {
    const meta = TEMPLATE_META[id];
    if (!meta.template) {
      alert(t('comingSoonAlert'));
      return;
    }
    const app: MiniApp = {
      ...meta.template,
      id: crypto.randomUUID?.() ?? `id_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addMiniApp(app);
    window.location.href = `/run/${app.id}`;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{t('title')}</h1>
      <p className="text-gray-600 mb-8">{t('subtitle')}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEMPLATE_IDS.map((id) => {
          const meta = TEMPLATE_META[id];
          return (
            <div
              key={id}
              className="border rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition"
            >
              <span className="text-4xl block mb-3">{meta.icon}</span>
              <h3 className="font-bold text-lg mb-1">{t(`templates.${id}.name`)}</h3>
              <p className="text-gray-600 text-sm mb-4">{t(`templates.${id}.desc`)}</p>
              <button
                onClick={() => install(id)}
                className={`w-full py-2 rounded-lg font-medium ${
                  meta.template
                    ? 'bg-whatever-primary text-white hover:opacity-90'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {meta.template ? t('install') : t('comingSoon')}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
