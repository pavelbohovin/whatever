# Whatever — Workflow Engine Spec

## Overview

A small interpreter that:
1. Evaluates triggers (manual, schedule, data change, webhook)
2. Executes actions sequentially with a context object
3. Supports variable substitution in templates

---

## Context Object

```typescript
interface WorkflowContext {
  user: User;
  record?: Record;           // For data_change trigger
  recordId?: string;
  tableId?: string;
  params?: Record<string, string>;
  now: string;               // ISO 8601
  page?: { data: Record<string, unknown> };
}
```

---

## Variable Substitution

Pattern: `{{path.to.value}}`

| Variable | Example | Resolves to |
|----------|---------|-------------|
| `user.name` | `{{user.name}}` | User's display name |
| `record.amount` | `{{record.amount}}` | Record field |
| `record.id` | `{{record.id}}` | Record ID |
| `now` | `{{now}}` | Current ISO date |
| `params.x` | `{{params.recordId}}` | Route/query param |

Implementation: regex `/\{\{([^}]+)\}\}/g` → lookup in context → replace.

---

## Triggers

### Manual
- **Config**: `{ buttonId: string }`
- **When**: User clicks button with `run_workflow` action
- **Context**: `params` from button config

### Schedule
- **Config**: `{ cron?: string, interval?: 'hourly' | 'daily' }`
- **When**: Timer fires (browser: setInterval; future: background sync)
- **Context**: `now` only

### Data Change
- **Config**: `{ tableId: string, operation: 'create' | 'update' | 'delete' }`
- **When**: Record created/updated/deleted in table
- **Context**: `record`, `recordId`, `tableId`

### Webhook (Optional MVP)
- **Config**: `{ path: string }`
- **When**: HTTP POST to path
- **Context**: `params` from body

---

## Actions

### create_record
```json
{
  "type": "create_record",
  "config": {
    "tableId": "expenses",
    "dataTemplate": {
      "amount": "{{record.amount}}",
      "category": "{{llmResult.category}}",
      "date": "{{now}}"
    }
  }
}
```
Creates record; adds `createdRecord` to context for subsequent actions.

### update_record
```json
{
  "type": "update_record",
  "config": {
    "recordId": "{{record.id}}",
    "dataTemplate": {
      "category": "{{llmResult.category}}"
    }
  }
}
```

### call_api
```json
{
  "type": "call_api",
  "config": {
    "url": "https://api.example.com/...",
    "method": "POST",
    "headers": { "Authorization": "Bearer {{connection.token}}" },
    "body": { "amount": "{{record.amount}}" }
  }
}
```
Requires `allowExternalApi` and `http:connector` permission. Result in `apiResult`.

### call_llm (AI Action)
```json
{
  "type": "call_llm",
  "config": {
    "providerId": "default",
    "promptTemplate": "Categorize: {{record.amount}} {{record.note}}. JSON: {\"category\": \"...\"}",
    "schema": {
      "type": "object",
      "properties": { "category": { "type": "string" } },
      "required": ["category"]
    }
  }
}
```
- Substitutes variables in prompt
- Calls `structuredCompletion` if schema provided
- Result in `llmResult` for subsequent actions
- Validation: if output invalid, use fallback or skip

### send_notification
```json
{
  "type": "send_notification",
  "config": {
    "title": "Expense saved",
    "body": "{{record.amount}} added to {{record.category}}"
  }
}
```
Uses browser Notification API if permitted.

### navigate
```json
{
  "type": "navigate",
  "config": { "pageId": "list" }
}
```
For manual workflows; navigates after completion.

---

## Execution Flow

1. Trigger fires → build context
2. For each action in sequence:
   - Substitute variables in config
   - Execute action
   - Merge result into context (`createdRecord`, `llmResult`, `apiResult`)
   - On error: log, optionally continue or abort
3. Return final context (for debugging/audit)

---

## Example: Full Workflow

```json
{
  "id": "expense-ai-categorize",
  "name": "AI Categorize on Save",
  "trigger": {
    "type": "data_change",
    "config": { "tableId": "expenses", "operation": "create" }
  },
  "actions": [
    {
      "id": "ai",
      "type": "call_llm",
      "config": {
        "promptTemplate": "Category for expense: ${{record.amount}} - {{record.note}}. One word: Food, Transport, Shopping, Health, Other.",
        "schema": { "type": "object", "properties": { "category": { "type": "string" } }, "required": ["category"] }
      }
    },
    {
      "id": "update",
      "type": "update_record",
      "config": {
        "recordId": "{{record.id}}",
        "dataTemplate": { "category": "{{llmResult.category}}" }
      }
    }
  ],
  "enabled": true
}
```
