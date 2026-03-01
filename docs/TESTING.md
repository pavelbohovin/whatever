# Whatever — Testing Notes

## Key Test Cases

### Unit: Workflow Engine
- `substituteVariables`: `{{user.name}}` → user name; `{{record.amount}}` → record field; `{{now}}` → ISO date
- `executeAction create_record`: creates record in DB, returns in context
- `executeAction update_record`: updates record by ID
- `executeAction call_llm`: mocks LLM, returns structured result
- `runWorkflow`: executes actions in sequence, merges results into context

### Unit: DSL Renderer
- Renders Text, Button, Input, Select, Checkbox, List, RecordDetail
- Variable substitution in Text content
- List shows records from context
- Button with save_record triggers form submit
- Button with navigate calls onNavigate

### Unit: Persistence
- createRecord, getRecords, updateRecord, deleteRecord
- Audit log redacts secrets (Bearer, api_key, token)

### Integration
- Builder: create mini-app → save → appears on Home
- Marketplace: install template → redirect to run
- Runtime: list page shows records; form saves; detail shows record
- Workflow: data_change trigger fires on create_record

### E2E
1. Create user (Settings)
2. Install Expense Tracker from Marketplace
3. Add expense (form)
4. See expense in list
5. Click expense → detail page
6. Build new mini-app with 1 table, 2 pages
7. Run it, add record, verify persistence

## Running Tests

```bash
# Add vitest or jest
npm install -D vitest @testing-library/react
# npm test
```

## Manual QA Checklist

- [ ] Home loads, shows Build + Marketplace
- [ ] Build wizard: name → table + fields → publish
- [ ] Mini-app appears on Home
- [ ] Run: List, Form, Detail pages work
- [ ] Data persists after refresh
- [ ] Settings: save name, save API key
- [ ] Marketplace: install Expense Tracker, Habit Tracker
