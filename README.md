# Whatever — Personal Super App

Create and run **mini-apps** without writing code. Connect your LLM provider, use templates, and build custom apps in minutes.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features (MVP)

- **Home**: Installed mini-apps + Build + Marketplace
- **Build**: Wizard to create mini-apps (tables, pages, workflows)
- **Marketplace**: 6 templates (Expense Tracker, Habit Tracker ready)
- **Runtime**: Render Form, List, Detail pages from JSON DSL
- **Workflow engine**: Triggers (manual, data_change), Actions (create/update record, LLM)
- **LLM**: Add OpenAI key in Settings; use in workflows
- **Persistence**: Local storage (IndexedDB/SQLite later)

## Docs

- [PRD](docs/PRD.md) — Personas, flows, metrics
- [Architecture](docs/ARCHITECTURE.md) — Stack, modules, security
- [Data Model](docs/DATA_MODEL.md) — Types and schemas
- [UI DSL](docs/UI_DSL.md) — Component spec
- [Workflow Engine](docs/WORKFLOW_ENGINE.md) — Triggers and actions
- [Implementation Plan](docs/IMPLEMENTATION_PLAN.md) — Day 1–3 milestones
- [Testing](docs/TESTING.md) — Test cases

## Project Structure

```
src/
├── app/           # Next.js pages
├── components/    # UI components
├── context/      # App state
├── lib/          # db, workflow, llm, dsl
├── templates/    # Mini-app templates
└── types/        # Shared types
```

## Next Steps

- [ ] sql.js for full SQLite in browser
- [ ] Encrypt API keys (Web Crypto)
- [ ] Calendar integration
- [ ] HTTP Connector
- [ ] Cloud sync
