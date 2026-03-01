# Whatever — Security & Privacy

## Threat Model Summary

### Key Risks

| Risk | Mitigation |
|------|------------|
| **API key leakage** | Keys stored encrypted (Web Crypto + IndexedDB); never in logs, never sent to our servers |
| **Unauthorized API calls** | `allowExternalApi` + permission scopes; runtime checks before call_api |
| **Malicious mini-app** | No custom code; DSL only; sandboxed to defined actions |
| **Data exfiltration** | LLM prompts may contain record data; user controls which mini-apps use LLM |
| **XSS in user content** | Sanitize all user-generated text in DSL renderer; no `dangerouslySetInnerHTML` |

### Mitigations

1. **Key storage**: Use `crypto.subtle` to encrypt key with device-derived key before storing in IndexedDB
2. **Permission prompts**: Per mini-app; user must grant calendar, http, llm explicitly
3. **Safe mode**: Default `allowExternalApi: false`; user opts in per mini-app
4. **Audit log**: All workflow runs, API calls logged locally; secrets redacted (keys, tokens)
5. **Redaction**: Before logging, replace `{{.*key.*}}`, bearer tokens, etc. with `[REDACTED]`
