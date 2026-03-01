# Whatever — Implementation Plan

## Day 1–3 Milestones

### Day 1: Foundation
- [ ] Next.js project setup (App Router, TypeScript)
- [ ] Folder structure + design system (Tailwind)
- [ ] Types: User, MiniApp, Page, Component, Workflow, etc.
- [ ] Persistence: SQLite via sql.js (browser) or better-sqlite3 (Node)
- [ ] Shell: Home layout, nav, placeholder modules
- [ ] Auth: Local user (name only), no cloud yet

### Day 2: Builder + Runtime
- [ ] Builder: Wizard flow (name → tables → pages → workflows)
- [ ] Table schema editor (add/remove fields)
- [ ] Page editor: Form, List, Detail, Chat page types
- [ ] DSL renderer: Text, Button, Input, Select, List, RecordDetail
- [ ] Runtime: Render page from JSON, handle navigate/save
- [ ] Marketplace: List 6 templates, install from template

### Day 3: Workflows + LLM
- [ ] Workflow engine: variable substitution, trigger eval, action exec
- [ ] Triggers: manual, data_change
- [ ] Actions: create_record, update_record, call_llm, navigate
- [ ] LLM provider: OpenAI-compatible interface, key storage (encrypted)
- [ ] AI Action node in workflows
- [ ] Two templates end-to-end: Expense Tracker, Habit Tracker

---

## MVP Checklist

- [ ] User can create local profile
- [ ] Home shows installed mini-apps + Build + Marketplace
- [ ] Builder: create mini-app with 1 table, 2 pages, 1 workflow, 1 AI action
- [ ] Runtime: render Form + List, save records locally
- [ ] Workflow: data_change trigger → call_llm → update_record
- [ ] LLM: user adds key, structured completion works
- [ ] Permissions: mini-app without allowExternalApi cannot call APIs
- [ ] Two templates work: Expense Tracker, Habit Tracker
- [ ] Audit log: actions logged, secrets redacted

---

## Next Steps (Post-MVP)

- Cloud sync (user accounts, mini-app backup)
- Real Calendar integration
- Real Messenger connectors (WhatsApp, Telegram)
- Schedule triggers (background sync)
- Webhook triggers
- Public marketplace
- Mobile PWA optimizations
