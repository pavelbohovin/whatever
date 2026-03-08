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
- **Persistence**: SQLite via sql.js (browser), persisted to IndexedDB

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

- [x] sql.js for full SQLite in browser
- [ ] Encrypt API keys (Web Crypto)
- [ ] Calendar integration
- [ ] HTTP Connector
- [ ] Cloud sync

## License

MIT License

Copyright (c) 2026 Pavel Bohovin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
