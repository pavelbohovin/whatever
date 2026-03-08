# Whatever — Implementation Plan

## Day 1–3 Milestones

### Day 1: Foundation
- [x] Next.js project setup (App Router, TypeScript)
- [x] Folder structure + design system (Tailwind)
- [x] Types: User, MiniApp, Page, Component, Workflow, etc.
- [x] Persistence: SQLite via sql.js (browser) or better-sqlite3 (Node)
- [x] Shell: Home layout, nav, placeholder modules
- [x] Auth: Local user (name only), no cloud yet

### Day 2: Builder + Runtime
- [ ] Builder: Wizard flow (name → tables → pages → workflows)
- [ ] Table schema editor (add/remove fields)
- [ ] Page editor: Form, List, Detail, Chat page types
- [x] DSL renderer: Text, Button, Input, Select, List, RecordDetail
- [x] Runtime: Render page from JSON, handle navigate/save
- [x] Marketplace: List 6 templates, install from template

### Day 3: Workflows + LLM
- [x] Workflow engine: variable substitution, trigger eval, action exec
- [x] Triggers: manual, data_change
- [x] Actions: create_record, update_record, call_llm, navigate
- [x] LLM provider: OpenAI-compatible interface, key storage (encrypted)
- [ ] AI Action node in workflows (LLM not wired to runtime yet)
- [x] Two templates end-to-end: Expense Tracker, Habit Tracker

---

## MVP Checklist

- [x] User can create local profile
- [x] Home shows installed mini-apps + Build + Marketplace
- [ ] Builder: create mini-app with 1 table, 2 pages, 1 workflow, 1 AI action
- [x] Runtime: render Form + List, save records locally
- [ ] Workflow: data_change trigger → call_llm → update_record (LLM not wired)
- [ ] LLM: user adds key, structured completion works (key stored, not used in workflows)
- [x] Permissions: mini-app without allowExternalApi cannot call APIs
- [x] Two templates work: Expense Tracker, Habit Tracker
- [ ] Audit log: actions logged, secrets redacted (audit() exists, not called)

---

## Next Steps (Post-MVP)

- Cloud sync (user accounts, mini-app backup)
- Real Calendar integration
- Real Messenger connectors (WhatsApp, Telegram)
- Schedule triggers (background sync)
- Webhook triggers
- Public marketplace
- Mobile PWA optimizations
