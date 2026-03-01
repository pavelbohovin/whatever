# Whatever — UI DSL Spec

## Component Types

Each component supports:
- **bindings**: Map prop names to table fields or expressions
- **visibility**: Show/hide based on conditions
- **actions**: On click/submit — navigate, run workflow, save record

---

## Components

### Text
Display static or dynamic text.
```json
{
  "id": "title",
  "type": "Text",
  "props": {
    "content": "Welcome, {{user.name}}!",
    "variant": "h1"
  }
}
```

### Button
```json
{
  "id": "submit-btn",
  "type": "Button",
  "props": {
    "label": "Save",
    "variant": "primary"
  },
  "actions": [
    { "type": "save_record", "tableId": "expenses" },
    { "type": "navigate", "pageId": "list" }
  ]
}
```

### Input
```json
{
  "id": "amount",
  "type": "Input",
  "props": {
    "field": "amount",
    "label": "Amount",
    "inputType": "number",
    "placeholder": "0.00"
  },
  "bindings": {
    "value": { "source": "record", "field": "amount" }
  }
}
```

### Select
```json
{
  "id": "category",
  "type": "Select",
  "props": {
    "field": "category",
    "label": "Category",
    "options": ["Food", "Transport", "Shopping", "Other"]
  }
}
```

### Checkbox
```json
{
  "id": "done",
  "type": "Checkbox",
  "props": {
    "field": "done",
    "label": "Completed"
  }
}
```

### List
Display records from a table.
```json
{
  "id": "expense-list",
  "type": "List",
  "props": {
    "tableId": "expenses",
    "columns": ["amount", "category", "date"],
    "sortBy": "date",
    "sortOrder": "desc",
    "limit": 50
  },
  "actions": [
    { "type": "navigate", "pageId": "detail", "recordId": "{{record.id}}" }
  ]
}
```

### Card
Container with optional header.
```json
{
  "id": "summary-card",
  "type": "Card",
  "props": {
    "title": "This Month",
    "subtitle": "{{stats.total}} expenses"
  },
  "children": [
    {
      "id": "chart",
      "type": "Chart",
      "props": { "type": "bar", "dataBinding": "expenses.byCategory" }
    }
  ]
}
```

### Chart
Simple chart (bar, line, pie).
```json
{
  "id": "chart",
  "type": "Chart",
  "props": {
    "type": "bar",
    "dataBinding": "expenses.byCategory",
    "xField": "category",
    "yField": "total"
  }
}
```

### Chat
LLM conversation UI.
```json
{
  "id": "chat",
  "type": "Chat",
  "props": {
    "providerId": "default",
    "systemPrompt": "You are a helpful expense advisor.",
    "placeholder": "Ask about your spending..."
  }
}
```

### RecordDetail
Show full record; editable if form context.
```json
{
  "id": "detail",
  "type": "RecordDetail",
  "props": {
    "tableId": "expenses",
    "recordId": "{{params.recordId}}",
    "layout": "vertical"
  },
  "actions": [
    { "type": "navigate", "pageId": "edit", "recordId": "{{record.id}}" }
  ]
}
```

---

## Visibility Rules

```json
{
  "visibility": {
    "condition": "record.amount > 100",
    "operator": "eq" | "gt" | "lt" | "contains" | "empty"
  }
}
```

Simplified: `{ "when": "record.amount", "operator": "gt", "value": 100 }`

---

## Action Types

| Type | Config | Description |
|------|--------|-------------|
| `navigate` | `pageId`, `recordId?` | Go to page |
| `run_workflow` | `workflowId` | Execute workflow |
| `save_record` | `tableId` | Save form data to table |
| `delete_record` | `recordId` | Delete record |
| `back` | - | Go back |

---

## Variable Substitution

Available in any string prop:
- `{{user.name}}` — current user
- `{{record.fieldName}}` — current record
- `{{params.recordId}}` — URL/route params
- `{{now}}` — current ISO date
- `{{page.data.x}}` — page-level state
