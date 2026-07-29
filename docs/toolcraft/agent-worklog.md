# Agent Worklog

## 2026-07-29 — Default standalone route

- Product goal: show `pages/standalone/main/page.tsx` at the browser root.
- Routing decision: register the standalone `main` page as the `/` index and retain its `/main` route.
- Layout decision: make `StandaloneLayout` own the root route; keep `AppLayout` pathless for any generated app pages.
- Controls, canvas output, persistence, settings transfer, timeline, layers, and export behavior are unaffected.
- Verification: run the project lint and production build commands.
