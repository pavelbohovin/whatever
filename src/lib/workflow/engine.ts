/**
 * Workflow engine — evaluates triggers, executes actions, variable substitution
 * @see docs/WORKFLOW_ENGINE.md
 */

import type { User, DataRecord, Workflow, Action, MiniApp } from '@/types';
import type { PersistenceLayer } from '@/lib/db/client';
import type { LLMProvider } from '@/lib/llm/types';

export interface WorkflowContext {
  user: User;
  record?: DataRecord;
  recordId?: string;
  tableId?: string;
  params?: Record<string, string>;
  now: string;
  page?: { data: Record<string, unknown> };
  createdRecord?: DataRecord;
  llmResult?: Record<string, unknown>;
  apiResult?: unknown;
}

export function substituteVariables(template: string, context: WorkflowContext): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
    const parts = path.trim().split('.');
    let val: unknown = context;
    for (const p of parts) {
      if (val == null) return '';
      val = (val as Record<string, unknown>)[p];
    }
    return val != null ? String(val) : '';
  });
}

export function substituteInObject(obj: unknown, context: WorkflowContext): unknown {
  if (typeof obj === 'string') return substituteVariables(obj, context);
  if (Array.isArray(obj)) return obj.map((x) => substituteInObject(x, context));
  if (obj && typeof obj === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = substituteInObject(v, context);
    }
    return out;
  }
  return obj;
}

export async function executeAction(
  action: Action,
  context: WorkflowContext,
  deps: {
    db: PersistenceLayer;
    llm?: LLMProvider;
    miniApp: MiniApp;
  }
): Promise<Partial<WorkflowContext>> {
  const config = substituteInObject(action.config, context) as Record<string, unknown>;
  const { db, llm, miniApp } = deps;

  switch (action.type) {
    case 'create_record': {
      const tableId = config.tableId as string;
      const dataTemplate = config.dataTemplate as Record<string, unknown>;
      const record = await db.createRecord(tableId, dataTemplate);
      return { createdRecord: record };
    }

    case 'update_record': {
      const recordId = substituteVariables((config.recordId as string) ?? '', context);
      const dataTemplate = config.dataTemplate as Record<string, unknown>;
      const subbed = substituteInObject(dataTemplate, context) as Record<string, unknown>;
      const updated = await db.updateRecord(recordId, subbed);
      return { record: updated };
    }

    case 'call_llm': {
      if (!llm) throw new Error('LLM provider not configured');
      const promptTemplate = config.promptTemplate as string;
      const prompt = substituteVariables(promptTemplate, context);
      const schema = config.schema as Record<string, unknown> | undefined;
      const result = schema
        ? await llm.structuredCompletion(prompt, schema)
        : await llm.chatCompletion([{ role: 'user', content: prompt }]);
      return { llmResult: result as Record<string, unknown> };
    }

    case 'send_notification': {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(config.title as string, { body: config.body as string });
      }
      return {};
    }

    case 'navigate': {
      // Caller handles navigation (e.g. router.push)
      return { params: { navigateTo: config.pageId as string } };
    }

    case 'call_api': {
      if (!miniApp.allowExternalApi) throw new Error('External API not allowed for this mini-app');
      // TODO: implement HTTP connector
      return {};
    }

    default:
      return {};
  }
}

export async function runWorkflow(
  workflow: Workflow,
  context: WorkflowContext,
  deps: { db: PersistenceLayer; llm?: LLMProvider; miniApp: MiniApp }
): Promise<WorkflowContext> {
  let ctx = { ...context };
  for (const action of workflow.actions) {
    const delta = await executeAction(action, ctx, deps);
    ctx = { ...ctx, ...delta };
  }
  return ctx;
}
