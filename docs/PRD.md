# Whatever — Personal Super App

## Product Requirements Document (MVP)

---

## 1. Personas

### Primary: "Busy Parent" (Maria, 42)
- Manages household expenses, kids' schedules, health tracking
- Not technical; uses WhatsApp, banking apps, Google Calendar daily
- Wants to "glue" her tools together without learning to code
- **Goal**: Track expenses + get AI reminders for bills in <10 min

### Secondary: "Solo Entrepreneur" (James, 35)
- Runs a small business; needs invoicing, client notes, travel planning
- Comfortable with spreadsheets; intimidated by APIs
- **Goal**: Build a custom "client inbox" mini-app with AI triage

### Tertiary: "Curious Hobbyist" (Yuki, 28)
- Loves learning; tracks books, habits, travel ideas
- Willing to experiment with AI; wants phrasebooks, summaries
- **Goal**: Create a book notes + AI summary mini-app

---

## 2. Key User Flows

### Flow 1: First-Time Onboarding (< 2 min)
1. Open app → "Welcome to Whatever"
2. Create local profile (name, optional avatar)
3. Optional: Sign up for cloud account (skip allowed)
4. Land on Home with 6 module placeholders + "Build" + "Marketplace"
5. Tooltip: "Start with a template or build from scratch"

### Flow 2: Create Mini-App from Template (< 10 min)
1. Home → Build → "Start from template"
2. Pick "Personal expense tracker"
3. Customize: name, icon, add/remove fields
4. Preview → "Looks good" → Install
5. Mini-app appears on Home; user adds first expense

### Flow 3: Run Mini-App (Daily Use)
1. Home → tap "Expense Buddy"
2. List page shows recent expenses
3. Tap "+" → Form page → fill amount, category, date
4. Save → workflow runs (optional: AI categorizes) → record saved
5. Back to list; data persists locally

### Flow 4: Add LLM Provider (One-Time)
1. Settings → "AI Providers"
2. Add OpenAI / Anthropic
3. Paste API key → stored in Keychain/Keystore
4. Test connection → "Ready"
5. Mini-apps with AI actions now work

### Flow 5: Build from Scratch (Power User)
1. Build → "Create new"
2. Wizard: Name → Tables → Pages → Workflows → AI (optional)
3. Each step has "Explain like I'm 5" tooltips
4. Preview at any step
5. Publish → appears on Home

---

## 3. MVP Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Time to first mini-app | < 10 min | Analytics: template pick → install |
| Mini-apps created per user | ≥ 2 | Local count |
| LLM key added | ≥ 30% of users | Settings event |
| Crash-free rate | > 99% | Error boundary + local log |
| Offline core usage | Works | Manual QA |

---

## 4. Non-Goals (MVP)

- Real WhatsApp/Telegram connectors (placeholder only)
- Real banking aggregators (placeholder)
- Multi-user collaboration
- Public marketplace / sharing
- Mobile native apps (web-first)
- Custom code execution in mini-apps

---

## 5. UX Principles for Non-Technical Users

1. **Templates first** — Never start with a blank canvas; always offer 6 ready-made templates
2. **Guided wizard** — Step-by-step with progress indicator; can go back
3. **Preview instantly** — Every change shows live preview; no "compile" step
4. **No jargon** — Use "Add a page" not "Create view"; "Connect your AI" not "Configure provider"
5. **Explain like I'm 5** — Tooltips on every builder field; short, friendly copy
6. **Safe by default** — Mini-apps can't call external APIs unless user explicitly allows
7. **Forgiving** — Undo, draft auto-save, clear error messages with "What to do" hints

---

## 6. Error States

| Error | User Message | Recovery |
|-------|--------------|----------|
| LLM key invalid | "Your AI key didn't work. Check it and try again." | Link to provider docs |
| Offline + sync needed | "You're offline. Changes will sync when you're back." | Retry when online |
| Workflow failed | "Something went wrong. Your data was saved." | Show in audit log |
| Storage full | "Storage is full. Remove old data or unused mini-apps." | Link to storage settings |
| Permission denied | "This mini-app needs permission to [X]. Allow?" | Allow / Deny |

---

## 7. Onboarding Steps

1. **Welcome screen** — Value prop: "Your personal app builder. No code."
2. **Profile** — Name + optional avatar (local only for MVP)
3. **Home tour** — Highlight: Build, Marketplace, modules
4. **First mini-app** — "Try Expense Tracker" CTA → template flow
5. **Optional: Add AI** — "Want AI to help? Add your key in Settings."

---

## 8. Wireframe Descriptions (Textual)

### Home
- Top: App logo "Whatever", user avatar, Settings
- Grid of module cards (2 columns on mobile, 3–4 on desktop):
  - Banking, Messenger, Videos, Food, Health, Accounting, Work, Books, Travel, Reminder, Investing, Games, Translator
  - Each card: icon + label; tap → placeholder "Coming soon" or installed mini-app
- "Build" card (prominent) → Builder
- "Marketplace" card → Local gallery of templates
- Installed mini-apps appear at top of grid with custom icon + name

### Build Section
- Left sidebar: Mini-app name, Tables, Pages, Workflows, AI Actions, Permissions
- Main: Canvas for selected item (e.g., table schema, page layout, workflow nodes)
- Right: Property panel (bindings, visibility, actions)
- Bottom: "Preview" button, "Publish" button
- Wizard mode: Full-screen steps with Back/Next

### Runtime (Mini-App View)
- Header: Mini-app name, back to Home
- Body: Rendered page (Form, List, Detail, Chat) per DSL
- Navigation: Tab bar or sidebar if multiple pages

### Settings
- Profile (name, avatar)
- AI Providers (add/edit/remove, test connection)
- Integrations (Calendar, HTTP Connector — placeholder)
- Storage & Sync (local usage, sync status)
- Audit Log (recent actions, redacted)
