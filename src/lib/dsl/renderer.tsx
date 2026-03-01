/**
 * DSL Renderer — renders UI from JSON component tree
 * @see docs/UI_DSL.md
 */

'use client';

import React from 'react';
import type { Component, DataRecord, User } from '@/types';
import { localizeString } from '@/types';
import type { Locale } from '@/i18n/config';
import { DEFAULT_LOCALE } from '@/i18n/config';
import { substituteVariables } from '@/lib/workflow/engine';

export interface RenderContext {
  user: User;
  record?: DataRecord;
  records?: DataRecord[];
  params?: Record<string, string>;
  pageData?: Record<string, unknown>;
  locale?: Locale;
  onNavigate?: (pageId: string, recordId?: string) => void;
  onSaveRecord?: (tableId: string, data: Record<string, unknown>) => void;
  onRunWorkflow?: (workflowId: string) => void;
}

function getContextForSubstitution(ctx: RenderContext): Record<string, unknown> {
  return {
    user: ctx.user,
    record: ctx.record,
    params: ctx.params,
    now: new Date().toISOString(),
    page: ctx.pageData ? { data: ctx.pageData } : undefined,
  };
}

function resolveProp(
  value: unknown,
  ctx: RenderContext
): string {
  const locale = ctx.locale ?? DEFAULT_LOCALE;
  if (typeof value === 'object' && value !== null && 'en' in value) {
    return localizeString(value as Parameters<typeof localizeString>[0], locale);
  }
  if (typeof value === 'string') {
    return substituteVariables(value, getContextForSubstitution(ctx) as never);
  }
  return String(value ?? '');
}

export function DSLRenderer({
  component,
  context,
}: {
  component: Component;
  context: RenderContext;
}) {
  const ctx = getContextForSubstitution(context);
  const resolve = (t: unknown) => resolveProp(t, context);

  // Visibility check
  if (component.visibility) {
    const { when, operator, value } = component.visibility;
    if (when && operator) {
      const val = (context.record?.data ?? {})[when];
      const match =
        operator === 'eq' ? val === value :
        operator === 'gt' ? (val as number) > (value as number) :
        operator === 'lt' ? (val as number) < (value as number) :
        operator === 'empty' ? (val == null || val === '') : true;
      if (!match) return null;
    }
  }

  const handleAction = (action: { type: string; pageId?: string; recordId?: string; workflowId?: string; tableId?: string }) => {
    if (action.type === 'navigate' && action.pageId) {
      context.onNavigate?.(action.pageId, action.recordId);
    } else if (action.type === 'run_workflow' && action.workflowId) {
      context.onRunWorkflow?.(action.workflowId);
    } else if (action.type === 'save_record' && action.tableId) {
      context.onSaveRecord?.(action.tableId, {});
    }
  };

  switch (component.type) {
    case 'Text':
      return (
        <p className="text-gray-800">
          {resolve(component.props.content ?? '')}
        </p>
      );

    case 'Button': {
      const action = component.actions?.[0];
      const isSubmit = action?.type === 'save_record';
      return (
        <button
          type={isSubmit ? 'submit' : 'button'}
          className="px-4 py-2 bg-whatever-primary text-white rounded-lg hover:opacity-90"
          onClick={!isSubmit ? () => action && handleAction(action) : undefined}
        >
          {resolve(component.props.label ?? 'Button')}
        </button>
      );
    }

    case 'Input':
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {resolve(component.props.label ?? component.props.field)}
          </label>
          <input
            type={(component.props.inputType as string) ?? 'text'}
            placeholder={resolve(component.props.placeholder ?? '')}
            defaultValue={context.record?.data?.[component.props.field as string] as string}
            className="w-full border rounded-lg px-3 py-2"
            data-field={component.props.field}
          />
        </div>
      );

    case 'Select': {
      const locale = context.locale ?? DEFAULT_LOCALE;
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {resolve(component.props.label ?? component.props.field)}
          </label>
          <select
            defaultValue={context.record?.data?.[component.props.field as string] as string}
            className="w-full border rounded-lg px-3 py-2"
            data-field={component.props.field}
          >
            <option value="">
              {locale === 'uk' ? 'Оберіть...' : locale === 'ro' ? 'Selectează...' : 'Select...'}
            </option>
            {((component.props.options as string[]) ?? []).map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      );
    }

    case 'Checkbox':
      return (
        <div className="mb-4 flex items-center gap-2">
          <input
            type="checkbox"
            defaultChecked={context.record?.data?.[component.props.field as string] as boolean}
            data-field={component.props.field}
            className="rounded"
          />
          <label className="text-sm text-gray-700">{resolve(component.props.label ?? '')}</label>
        </div>
      );

    case 'List': {
      const columns = (component.props.columns as string[]) ?? [];
      const records = context.records ?? [];
      return (
        <div className="space-y-2">
          {records.map((rec) => (
            <div
              key={rec.id}
              className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
              onClick={() => {
                const navAction = component.actions?.find((a) => a.type === 'navigate');
                if (navAction?.pageId) {
                  context.onNavigate?.(navAction.pageId, rec.id);
                }
              }}
            >
              {columns.map((col) => (
                <span key={col} className="mr-4">
                  {String(rec.data[col] ?? '-')}
                </span>
              ))}
            </div>
          ))}
        </div>
      );
    }

    case 'Card':
      return (
        <div className="border rounded-lg p-4 shadow-sm">
          {component.props.title ? (
            <h3 className="font-semibold text-lg mb-2">{resolve(component.props.title)}</h3>
          ) : null}
          {component.props.subtitle ? (
            <p className="text-sm text-gray-500 mb-3">{resolve(component.props.subtitle)}</p>
          ) : null}
          {component.children?.map((c) => (
            <DSLRenderer key={c.id} component={c} context={context} />
          ))}
        </div>
      );

    case 'RecordDetail': {
      const rec = context.record;
      const locale = context.locale ?? DEFAULT_LOCALE;
      if (!rec) return <p className="text-gray-500">{locale === 'uk' ? 'Запис відсутній' : locale === 'ro' ? 'Nicio înregistrare' : 'No record'}</p>;
      return (
        <div className="space-y-2">
          {Object.entries(rec.data).map(([k, v]) => (
            <div key={k}>
              <span className="font-medium text-gray-600">{k}:</span>{' '}
              {String(v ?? '-')}
            </div>
          ))}
        </div>
      );
    }

    case 'Chat': {
      const locale = context.locale ?? DEFAULT_LOCALE;
      return (
        <div className="border rounded-lg p-4 min-h-[200px]">
          <p className="text-gray-500 text-sm">
            {locale === 'uk'
              ? 'Чат із ШІ (додайте ключ LLM у Налаштуваннях)'
              : locale === 'ro'
              ? 'Chat cu AI (adaugă cheia LLM în Setări)'
              : 'Chat with AI (connect your LLM key in Settings)'}
          </p>
        </div>
      );
    }

    case 'Chart':
      return (
        <div className="h-32 flex items-center justify-center border rounded bg-gray-50 text-gray-500">
          Chart: {(component.props.type as string) ?? 'bar'}
        </div>
      );

    default:
      return null;
  }
}
