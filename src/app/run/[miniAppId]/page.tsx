'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { createPersistence } from '@/lib/db/client';
import { DSLRenderer } from '@/lib/dsl/renderer';
import { runWorkflow } from '@/lib/workflow/engine';
import type { MiniApp, Page, DataRecord } from '@/types';
import { localizeString } from '@/types';
import type { RenderContext } from '@/lib/dsl/renderer';

export default function RunPage() {
  const params = useParams();
  const { miniApps, user } = useApp();
  const { locale } = useLanguage();
  const t = useTranslations('run');
  const [app, setApp] = useState<MiniApp | null>(null);
  const [page, setPage] = useState<Page | null>(null);
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [currentRecord, setCurrentRecord] = useState<DataRecord | null>(null);
  const [pageId, setPageId] = useState<string>('list');
  const db = createPersistence();

  const miniAppId = params.miniAppId as string;

  useEffect(() => {
    const found = miniApps.find((a) => a.id === miniAppId);
    setApp(found ?? null);
    if (found) {
      const p = found.pages.find((x) => x.id === pageId) ?? found.pages[0];
      setPage(p ?? null);
      setPageId(p?.id ?? 'list');
    }
  }, [miniAppId, miniApps, pageId]);

  useEffect(() => {
    if (!app || !page?.tableId) return;
    db.getRecords(page.tableId).then(setRecords);
  }, [app, page?.tableId]);

  const handleNavigate = useCallback(
    (toPageId: string, recordId?: string) => {
      if (!app) return;
      const p = app.pages.find((x) => x.id === toPageId);
      setPage(p ?? null);
      setPageId(toPageId);
      if (recordId) {
        db.getRecord(recordId).then(setCurrentRecord);
      } else {
        setCurrentRecord(null);
      }
    },
    [app]
  );

  const handleSaveRecord = useCallback(
    async (tableId: string, data: Record<string, unknown>) => {
      if (!app) return;
      const form = document.querySelector('form');
      const inputs = form?.querySelectorAll('[data-field]');
      const collected: Record<string, unknown> = { ...data };
      inputs?.forEach((el) => {
        const field = (el as HTMLElement).dataset.field;
        if (!field) return;
        const input = el as HTMLInputElement | HTMLSelectElement;
        if (input.type === 'checkbox') {
          collected[field] = (input as HTMLInputElement).checked;
        } else if (input.type === 'number') {
          collected[field] = parseFloat(input.value) || 0;
        } else {
          collected[field] = input.value;
        }
      });
      const record = await db.createRecord(tableId, collected);
      setRecords((prev) => [record, ...prev]);
      const workflows = app.workflows.filter(
        (w) =>
          w.enabled &&
          w.trigger.type === 'data_change' &&
          (w.trigger.config as { tableId?: string; operation?: string }).tableId === tableId &&
          (w.trigger.config as { operation?: string }).operation === 'create'
      );
      const ctx = {
        user: user ?? { id: 'anon', name: 'User', createdAt: new Date().toISOString() },
        record,
        tableId,
        now: new Date().toISOString(),
      };
      for (const wf of workflows) {
        await runWorkflow(wf, ctx, { db, miniApp: app });
      }
      handleNavigate('list');
    },
    [app, user, handleNavigate]
  );

  if (!app) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('notFound')}</p>
        <Link href="/" className="text-whatever-primary mt-4 inline-block">
          {t('backHome')}
        </Link>
      </div>
    );
  }

  const renderContext: RenderContext = {
    user: user ?? { id: 'anon', name: 'User', createdAt: new Date().toISOString() },
    record: currentRecord ?? undefined,
    records,
    params: currentRecord?.id ? { recordId: currentRecord.id } : undefined,
    locale,
    onNavigate: handleNavigate,
    onSaveRecord: handleSaveRecord,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="text-gray-600 hover:text-whatever-primary">
          {t('home')}
        </Link>
        <h1 className="text-xl font-bold">
          {app.icon} {localizeString(app.name, locale)}
        </h1>
        <div className="w-16" />
      </div>

      <div className="flex gap-2 mb-6">
        {app.pages.map((p) => (
          <button
            key={p.id}
            onClick={() => handleNavigate(p.id)}
            className={`px-4 py-2 rounded-lg ${
              pageId === p.id ? 'bg-whatever-primary text-white' : 'bg-gray-200'
            }`}
          >
            {localizeString(p.name, locale)}
          </button>
        ))}
      </div>

      {page && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (page.type === 'form' && page.tableId) {
              handleSaveRecord(page.tableId, {});
            }
          }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          {page.components.map((c) => (
            <DSLRenderer key={c.id} component={c} context={renderContext} />
          ))}
        </form>
      )}
    </div>
  );
}
