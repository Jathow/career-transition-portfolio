# Product Enhancement Task List

Owner: Core UI/UX • Scope: Client + Server • Theme: Dark, compact, professional

Conventions
- One task per PR; keep diffs focused. Add tests when reasonable.
- Definition of done: code merged, deployed to production, smoke-checked.

Phase 1 — High-impact, no external services
- [x] Compact UI baseline across app
  - Enable compact mode by default; reduce paddings/margins in layout, cards, dialogs, and pages (Resumes, Dashboard)
  - Acceptance: Visual density improved; no layout regressions; lints/tests pass

- [x] Account protection: email verification & anti‑abuse
  - Email verification flow on registration (signed token, 24h expiry, resend), restrict app access until verified
  - Add optional CAPTCHA (Cloudflare Turnstile/hCaptcha) behind `CAPTCHA_ENABLED` flag on register; fallback to simple challenge in dev
  - Strengthen auth rate limits and add temporary lockout after repeated failures; log and surface friendly messages
  - Block disposable email domains via configurable allow/deny lists
  - Acceptance: Unverified users cannot access protected routes; verification works locally (dev console mail) and is provider-ready; CAPTCHA toggle works; rate limit/lockout enforced

- [x] Command Palette discoverability (announce + hints)
  - First-run snackbar/toast announcing “New: Command Palette (Ctrl+K)” with “Try it” CTA
  - Add subtle hint near top bar search (placeholder: “Search • Press Ctrl+K for commands”)
  - Add a small keyboard icon button with tooltip “Command Palette (Ctrl+K)”
  - Include in empty states and Keyboard Shortcuts modal
  - Acceptance: Hints visible, dismissible, and only shown once; tooltip present; copy consistent

- [x] Global Quick Add + Command Palette
  - Floating “+” button (mobile/desktop) and Cmd/Ctrl+K command palette with actions: Create Project, Application, Interview, Goal
  - Acceptance: Available on all authenticated routes; keyboard accessible; ESC closes; actions create items successfully

- [x] Applications: Compact table + inline edit
  - Table view with sticky header, column toggles; inline edit for status, follow-up date, notes; toggle between table and cards
  - Acceptance: Edits persist; keyboard navigation works; empty state shows CTA

- [x] Applications: Smart paste (job URL autofill)
  - Paste a job posting URL to prefill company, title, source; degrade gracefully if blocked
  - Acceptance: Works with common boards; no crashes on unknown pages; manual override possible

- [x] Follow-up automation suggestions
  - Suggest follow-up dates based on status/last touch; 1‑click schedule + snooze
  - Acceptance: Suggestions appear for items lacking follow-up; actions persist changes

- [x] Consistent page headers
  - Convert page titles to `h6`, right-aligned secondary actions, optional breadcrumbs where helpful
  - Acceptance: Applied to Dashboard, Applications, Interviews, Portfolio, Motivation, Resumes

- [x] Rich empty states + sample data (phase 1: empty states)
  - Friendly copy, visuals, and one‑click sample data injection to demonstrate value
  - Acceptance: Empty state present on key pages; sample data cleans up correctly

- [x] Success toasts + optimistic updates
  - Non-blocking confirmations for CRUD; optimistic UI for snappy feel with rollback on error
  - Acceptance: Implemented across Projects, Applications, Resumes flows

- [x] Accessibility pass (A11y)
  - Focus outlines, ARIA labels on actions, color contrast checks
  - Acceptance: No serious violations via axe; keyboard-only flows usable

- [ ] Performance pass
  - Prefetch next routes, ensure code splitting on heavy pages, reduce layout shifts
  - Acceptance: Lighthouse Performance ≥ 90 on local prod build; LCP < 2.5s

Phase 2 — Nice-to-have / optional
- [ ] Interview prep packs (checklist, question bank, reminders relative to event)
- [ ] Onboarding checklist widget (first-run tasks leading to “aha”)
- [ ] In‑app feedback widget (“What’s missing?”)
- [ ] Privacy-friendly analytics (config-gated; docs on data collected)
- [ ] Feature flag scaffold for safe rollouts
- [ ] Team workspace (roles) & audit trail (spec first)

Phase 3 — Monetization readiness (paywall-ready, no payments yet)
- [ ] Entitlements & plan gating (FREE vs PRO)
  - Add `plan` to user model (default FREE), include in auth payload, expose in client store
  - Central entitlements map and guards (client + server) for PRO-only routes/features
  - Acceptance: PRO-only components show lock/CTA on FREE; tests cover guard behavior

- [ ] Quotas & friendly limit errors
  - Per-plan limits (e.g., max applications/day, interviews/day)
  - Server returns structured 402-style error; client shows upgrade CTA
  - Acceptance: Limits enforced; UX copy clear; metrics logged

- [ ] Pricing page (stub) and upgrade CTAs
  - Static route with plan comparison; CTAs disabled until payments enabled
  - Reusable “Upgrade to PRO” component with copy and deep-link
  - Acceptance: Linked from locks, headers, and empty states

- [ ] Config flags
  - `PAYMENTS_ENABLED=false` (feature toggle), `PRO_TRIAL_DAYS=0`, environment-driven
  - Acceptance: App switches behavior solely by flags (no code changes)

- [ ] Documentation
  - README: commercial licensing note and upgrade path
  - Internal doc: steps to enable Stripe/LemonSqueezy later (webhooks -> set `plan=PRO`)

Deployment & QA checklist (for each task)
- [ ] Unit/integration tests updated or added as needed
- [ ] Build green; lints clean; e2e (if applicable) pass locally
- [ ] Railway deploy successful; run `scripts/verify-deployment.sh`
- [ ] Basic accessibility and Lighthouse checks updated

Working procedure (per task)
1. Create branch: `feat/<task-slug>`
2. Implement; update tests and docs; keep commits atomic
3. Open PR referencing this checklist item; include screenshots/GIFs
4. Merge after review; deploy; check acceptance criteria in prod
5. Mark checkbox here with PR number

Suggested order of execution
1) Global Quick Add + Command Palette
2) Applications: Compact table + inline edit
3) Applications: Smart paste (job URL)
4) Follow-up automation suggestions
5) Consistent page headers
6) Rich empty states + sample data
7) Success toasts + optimistic updates
8) Accessibility & performance passes


