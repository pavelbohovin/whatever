/**
 * Whatever — Shared types for data model
 * @see docs/DATA_MODEL.md
 */

import type { Locale } from '@/i18n/config';

/**
 * A string that can be translated into supported locales.
 * English is required; other locales are optional (fall back to en).
 */
export interface LocalizedString {
  en: string;
  uk?: string;
  ro?: string;
}

/**
 * Resolve a LocalizedString (or plain string) to a display string for the given locale.
 * Always falls back to English if the locale-specific value is missing.
 */
export function localizeString(value: string | LocalizedString, locale: Locale): string {
  if (typeof value === 'string') return value;
  return value[locale] ?? value.en;
}

export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
  cloudId?: string;
  language?: Locale;
}

export interface ProviderKey {
  id: string;
  provider: 'openai' | 'anthropic' | 'openai-compatible';
  displayName: string;
  encryptedRef: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface TableField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'json';
  required?: boolean;
  defaultValue?: unknown;
}

export interface DataTable {
  id: string;
  name: string;
  fields: TableField[];
}

export interface Binding {
  source: 'record' | 'user' | 'params' | 'page';
  field: string;
}

export interface VisibilityRule {
  when?: string;
  operator?: 'eq' | 'gt' | 'lt' | 'contains' | 'empty';
  value?: unknown;
}

export interface ActionConfig {
  type: 'navigate' | 'run_workflow' | 'save_record' | 'delete_record' | 'back';
  pageId?: string;
  recordId?: string;
  workflowId?: string;
  tableId?: string;
}

export interface Component {
  id: string;
  type:
    | 'Text'
    | 'Button'
    | 'Input'
    | 'Select'
    | 'Checkbox'
    | 'List'
    | 'Card'
    | 'Chart'
    | 'Chat'
    | 'RecordDetail';
  props: Record<string, unknown>;
  bindings?: Record<string, Binding>;
  visibility?: VisibilityRule;
  actions?: ActionConfig[];
  children?: Component[];
}

export interface Page {
  id: string;
  name: string | LocalizedString;
  type: 'form' | 'list' | 'detail' | 'chat';
  tableId?: string;
  components: Component[];
  layout?: { type: 'single' | 'tabs' | 'split'; children?: string[] };
}

export interface DataRecord {
  id: string;
  tableId: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Trigger {
  type: 'manual' | 'schedule' | 'data_change' | 'webhook';
  config: Record<string, unknown>;
}

export interface Action {
  id: string;
  type:
    | 'create_record'
    | 'update_record'
    | 'call_api'
    | 'call_llm'
    | 'send_notification'
    | 'navigate';
  config: Record<string, unknown>;
}

export interface Workflow {
  id: string;
  name: string;
  trigger: Trigger;
  actions: Action[];
  enabled: boolean;
}

export interface PermissionScope {
  id: string;
  name: string;
  description: string;
  granted: boolean;
}

export interface MiniApp {
  id: string;
  name: string | LocalizedString;
  icon: string;
  description: string | LocalizedString;
  version: number;
  tables: DataTable[];
  pages: Page[];
  workflows: Workflow[];
  permissions: PermissionScope[];
  allowExternalApi: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationConnection {
  id: string;
  type: 'calendar' | 'http_connector' | 'messenger';
  name: string;
  config: Record<string, unknown>;
  createdAt: string;
}

/** App definition format for templates and export */
export interface AppDefinition {
  miniAppId: string;
  name: string | LocalizedString;
  icon: string;
  description: string | LocalizedString;
  version: number;
  tables: DataTable[];
  pages: Page[];
  workflows: Workflow[];
  permissions: PermissionScope[];
  allowExternalApi: boolean;
}
