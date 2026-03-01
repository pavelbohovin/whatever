# Whatever — Architecture

## Stack Choice: Option 1 (Web + Local-First SQLite)

**Justification:**
- **Speed to MVP**: Next.js has excellent DX, SSR for fast loads, API routes for future sync
- **Local-first**: SQLite via `sql.js` (WASM) or `better-sqlite3` in Node; IndexedDB as fallback for browser-only
- **Cross-platform**: Single codebase runs on desktop browsers, mobile browsers, future PWA
- **No lock-in**: Can add Tauri/Electron wrapper later for desktop; React Native for mobile
- **Free**: No paid services except user's own LLM keys

---

## Runtime Requirements

| Requirement | Version |
|---|---|
| **Node.js** | 22 LTS (minimum 20.9.0) |
| **npm** | 10+ |
| **Next.js** | 16.x |
| **React** | 19.x |

Node 22 LTS is the recommended runtime for both local development and production deployment. It receives active long-term support until April 2027.

### Production deployment (self-hosted)
- Use **PM2** to keep `next start` alive and restart on crash
- Use **Caddy** (or Nginx) as a reverse proxy for HTTPS
- Example Caddy config:
  ```
  whatever.example.com {
      reverse_proxy localhost:3000
  }
  ```
- Install Node via `nvm`: `nvm install 22 && nvm alias default 22`

---

## Architecture Diagram (Textual)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Whatever App (Next.js)                          │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │   Home      │  │   Build     │  │ Marketplace │  │   Settings      │ │
│  │   (Shell)   │  │   (Builder) │  │  (Templates)│  │  (Providers)    │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘ │
│         │                │                │                  │          │
│         └────────────────┴────────────────┴──────────────────┘          │
│                                    │                                     │
│  ┌─────────────────────────────────┼─────────────────────────────────┐  │
│  │                    Core Services Layer                             │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐ │  │
│  │  │   Runtime    │ │  Workflow    │ │   LLM        │ │  Persist   │ │  │
│  │  │   Renderer   │ │  Engine      │ │  Provider    │ │  (SQLite)  │ │  │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └────────────┘ │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                    │                                     │
│  ┌─────────────────────────────────┼─────────────────────────────────┐  │
│  │                    Integrations Layer                              │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐               │  │
│  │  │   Calendar   │ │ HTTP Connector│ │  Messenger  │               │  │
│  │  │   (read)     │ │  (REST API)   │ │  (mock)     │               │  │
│  │  └──────────────┘ └──────────────┘ └──────────────┘               │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
            │   SQLite     │ │  Keychain/   │ │  External    │
            │   (local DB) │ │  Keystore    │ │  APIs       │
            └──────────────┘ └──────────────┘ └──────────────┘
```

---

## Folder Structure

```
whatever3/
├── docs/                    # PRD, architecture, specs
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (shell)/         # Layout with nav
│   │   │   ├── page.tsx     # Home
│   │   │   ├── build/
│   │   │   ├── marketplace/
│   │   │   └── settings/
│   │   ├── run/[miniAppId]/ # Runtime for mini-apps
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/              # Design system primitives
│   │   ├── builder/         # Builder-specific
│   │   ├── runtime/         # DSL renderer components
│   │   └── shell/           # Shell (nav, header)
│   ├── lib/
│   │   ├── db/              # SQLite / persistence
│   │   ├── workflow/        # Workflow engine
│   │   ├── llm/             # Provider abstraction
│   │   ├── integrations/   # Calendar, HTTP, Messenger
│   │   └── dsl/             # DSL parser + renderer
│   ├── types/               # Shared types
│   └── templates/           # Mini-app template JSONs
├── public/
└── package.json
```

---

## Module Boundaries

| Module | Responsibility | Depends On |
|--------|----------------|------------|
| **Shell** | Layout, nav, auth state | - |
| **Builder** | Create/edit mini-app definitions | types, db |
| **Runtime** | Render pages from DSL, handle user actions | dsl, db, workflow |
| **Workflow Engine** | Evaluate triggers, execute actions | db, llm, integrations |
| **LLM Provider** | chatCompletion, structuredCompletion | - (external APIs) |
| **Persistence** | CRUD for User, MiniApp, Record, etc. | SQLite |
| **Integrations** | Calendar, HTTP, Messenger (mock) | - |

---

## State Management Approach

- **React Context** for: current user, installed mini-apps, builder state
- **URL state** for: active page, selected builder section
- **Local DB** as source of truth for all persisted data
- **No Redux/Zustand** for MVP; add if complexity grows

---

## API Interfaces (Internal)

```typescript
// Persistence
interface PersistenceLayer {
  getUser(): Promise<User | null>;
  getMiniApps(): Promise<MiniApp[]>;
  getRecords(tableId: string): Promise<Record[]>;
  createRecord(tableId: string, data: Record<string, unknown>): Promise<Record>;
  updateRecord(recordId: string, data: Record<string, unknown>): Promise<Record>;
  // ...
}

// LLM Provider
interface LLMProvider {
  chatCompletion(messages: Message[], tools?: Tool[]): Promise<ChatResponse>;
  structuredCompletion<T>(prompt: string, schema: JSONSchema): Promise<T>;
}

// Workflow Engine
interface WorkflowEngine {
  evaluateTrigger(trigger: Trigger, context: Context): boolean;
  executeActions(actions: Action[], context: Context): Promise<void>;
}
```

---

## Testing Strategy

- **Unit**: Workflow engine (trigger eval, action exec, variable substitution)
- **Unit**: DSL renderer (component mapping, bindings)
- **Unit**: Persistence layer (mock SQLite)
- **Integration**: Builder → save → Runtime → render
- **E2E**: Create mini-app from template → add record → verify persistence

---

## Security Model

- **Keys**: Stored via Web Crypto API + IndexedDB (encrypted) or server-side Keychain; never in logs
- **Permissions**: Each mini-app has `permissions: PermissionScope[]`; runtime checks before API calls
- **Safe mode**: Default `allowExternalApi: false`; user must opt-in per mini-app
- **Audit**: Local log of actions (workflow runs, API calls) with secrets redacted
- **Threat model**: See docs/SECURITY.md
