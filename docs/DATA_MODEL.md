# Whatever — Data Model

## JSON Schemas / TypeScript Types

---

## Core Types

### User
```typescript
interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  createdAt: string; // ISO 8601
  // Optional cloud account (MVP: local only)
  cloudId?: string;
}
```

### ProviderKey (encrypted reference only — key never stored in plaintext)
```typescript
interface ProviderKey {
  id: string;
  provider: 'openai' | 'anthropic' | 'openai-compatible';
  displayName: string;
  // Encrypted blob or Keychain reference; never the raw key
  encryptedRef: string;
  createdAt: string;
  lastUsedAt?: string;
}
```

### MiniApp
```typescript
interface MiniApp {
  id: string;
  name: string;
  icon: string;        // emoji or icon name
  description: string;
  version: number;
  tables: DataTable[];
  pages: Page[];
  workflows: Workflow[];
  permissions: PermissionScope[];
  allowExternalApi: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### DataTable
```typescript
interface DataTable {
  id: string;
  name: string;
  fields: TableField[];
}

interface TableField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'json';
  required?: boolean;
  defaultValue?: unknown;
}
```

### Page
```typescript
interface Page {
  id: string;
  name: string;
  type: 'form' | 'list' | 'detail' | 'chat';
  tableId?: string;  // for form, list, detail
  components: Component[];
  layout?: PageLayout;
}

interface PageLayout {
  type: 'single' | 'tabs' | 'split';
  // For tabs: array of page IDs
  children?: string[];
}
```

### Component (UI DSL — see DSL spec for full shape)
```typescript
interface Component {
  id: string;
  type: 'Text' | 'Button' | 'Input' | 'Select' | 'Checkbox' | 'List' | 'Card' | 'Chart' | 'Chat' | 'RecordDetail';
  props: Record<string, unknown>;
  bindings?: Record<string, Binding>;
  visibility?: VisibilityRule;
  actions?: ActionConfig[];
  children?: Component[];
}
```

### DataRecord
```typescript
interface DataRecord {
  id: string;
  tableId: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
```

### Workflow
```typescript
interface Workflow {
  id: string;
  name: string;
  trigger: Trigger;
  actions: Action[];
  enabled: boolean;
}

interface Trigger {
  type: 'manual' | 'schedule' | 'data_change' | 'webhook';
  config: Record<string, unknown>;
  // manual: { buttonId: string }
  // schedule: { cron: string } or { interval: 'daily' | 'hourly' }
  // data_change: { tableId, operation: 'create' | 'update' | 'delete' }
  // webhook: { path: string }
}

interface Action {
  id: string;
  type: 'create_record' | 'update_record' | 'call_api' | 'call_llm' | 'send_notification' | 'navigate';
  config: Record<string, unknown>;
  // create_record: { tableId, dataTemplate }
  // update_record: { recordId, dataTemplate }
  // call_api: { url, method, headers }
  // call_llm: { promptTemplate, schema?, providerId }
  // send_notification: { title, body }
  // navigate: { pageId }
}
```

### PermissionScope
```typescript
interface PermissionScope {
  id: string;
  name: string;
  description: string;
  granted: boolean;
  // e.g. 'calendar:read', 'http:connector', 'llm:use'
}
```

### IntegrationConnection
```typescript
interface IntegrationConnection {
  id: string;
  type: 'calendar' | 'http_connector' | 'messenger';
  name: string;
  config: Record<string, unknown>;
  // calendar: { provider: 'google' | 'apple', tokenRef }
  // http_connector: { baseUrl, defaultHeaders }
  // messenger: { provider: 'whatsapp' | 'telegram', tokenRef } — MVP: mock
  createdAt: string;
}
```

---

## App Definition Format

```json
{
  "miniAppId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Expense Buddy",
  "icon": "💰",
  "description": "Track your daily expenses with optional AI categorization",
  "version": 1,
  "tables": [
    {
      "id": "expenses",
      "name": "Expenses",
      "fields": [
        { "id": "amount", "name": "Amount", "type": "number", "required": true },
        { "id": "category", "name": "Category", "type": "text" },
        { "id": "date", "name": "Date", "type": "date" },
        { "id": "note", "name": "Note", "type": "text" }
      ]
    }
  ],
  "pages": [
    {
      "id": "list",
      "name": "Expenses",
      "type": "list",
      "tableId": "expenses",
      "components": [
        {
          "id": "expense-list",
          "type": "List",
          "props": { "tableId": "expenses", "columns": ["amount", "category", "date"] }
        }
      ]
    },
    {
      "id": "add",
      "name": "Add Expense",
      "type": "form",
      "tableId": "expenses",
      "components": [
        {
          "id": "amount-input",
          "type": "Input",
          "props": { "field": "amount", "label": "Amount", "inputType": "number" }
        }
      ]
    }
  ],
  "workflows": [
    {
      "id": "on-save",
      "name": "On Save Expense",
      "trigger": { "type": "data_change", "config": { "tableId": "expenses", "operation": "create" } },
      "actions": [
        {
          "id": "ai-categorize",
          "type": "call_llm",
          "config": {
            "promptTemplate": "Categorize this expense: {{record.amount}} {{record.note}}. Reply with JSON: {\"category\": \"...\"}",
            "schema": { "category": "string" }
          }
        }
      ],
      "enabled": true
    }
  ],
  "permissions": [
    { "id": "llm", "name": "Use AI", "description": "Let AI help categorize expenses", "granted": true }
  ],
  "allowExternalApi": false
}
```
