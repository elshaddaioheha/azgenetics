# UI/UX + Functionality Audit

## Scope
- Reviewed primary public experience (`app/page.tsx`, `components/Navbar.tsx`, auth screens) and role dashboard structure.
- Performed basic project checks using existing scripts.

## UI Suggestions
1. **Improve mobile navigation discoverability**
   - The top nav links are hidden under `lg` and there is no visible mobile menu/flyout fallback.
   - Recommendation: add a compact mobile menu button + drawer containing Documentation/How it works/About/Contact links.

2. **Reduce decorative text density for readability**
   - Many labels use tiny uppercase text (`text-[10px]`/`text-[11px]` + wide tracking), which can hurt readability for clinical users.
   - Recommendation: use semantic heading hierarchy + minimum body size of 14–16px for key content.

3. **Add meaningful alt text for visual cards**
   - Landing page cards use decorative `<img>` with empty `alt` values while carrying informational meaning.
   - Recommendation: replace with concise alt text or mark as purely decorative only when duplicate context exists.

4. **Standardize metadata strategy for App Router**
   - `app/page.tsx` uses `next/head` while app-level metadata already exists in `app/layout.tsx`.
   - Recommendation: migrate page-specific SEO metadata to the App Router metadata API to avoid drift/inconsistency.

5. **Improve auth form affordances**
   - “Forgot key?” currently links to `#`, which creates a dead-end.
   - Recommendation: provide a working reset-password flow or hide the link until implemented.

## UX Suggestions
1. **Strengthen role routing feedback**
   - Dashboard redirects users to role-specific pages after profile load; interim state can feel abrupt.
   - Recommendation: show explicit “Routing to your dashboard…” state and preserve perceived continuity.

2. **Improve error guidance and recovery**
   - Several API errors are generic (“Upload failed”, “Authentication error”).
   - Recommendation: map common errors to actionable guidance (e.g., expired session, unverified email, file type unsupported).

3. **Support keyboard and accessibility audits**
   - Current styling is high-polish but likely needs explicit focus-visible tuning for keyboard users.
   - Recommendation: run axe/Lighthouse + manual tab-flow checks on nav, auth, dashboard tabs, and modal workflows.

## Functionality Checks (Code-level)
1. **Rate limiting is in-memory only**
   - Sign-in and sign-up use module-level Maps for rate-limit tracking.
   - Risk: state resets on deploy/restart and won’t be shared across instances.
   - Recommendation: move rate-limit counters to Redis/Supabase-backed storage.

2. **Sensitive key persistence risk**
   - Signup stores generated Hedera private key fields directly in DB profile tables.
   - Recommendation: encrypt at rest with KMS/secret manager or avoid storing raw private keys server-side.

3. **OTP exposure in development response**
   - Signup response includes `_dev_otp` when `NODE_ENV=development`.
   - Recommendation: gate this behind explicit local-only feature flag and ensure disabled in all shared/staging environments.

4. **Password policy is minimal**
   - Current validation checks only minimum length 6.
   - Recommendation: enforce stronger password policy and add client-side guidance.

## Runtime Checks Performed
- `npm test` fails without required env (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `HEDERA_CONTRACT_ID`).
- `npx vitest run` also fails for same missing env prerequisites.
- `npm run build` fails in this environment due inability to fetch Google Fonts (`Inter`, `Outfit`) during Next/Turbopack build.

## Suggested Next Validation Steps
1. Add a `.env.test` with safe test credentials/mocks for CI to execute baseline tests.
2. Add a mocked/offline font fallback (or self-hosted fonts) to make builds deterministic in restricted environments.
3. Add end-to-end checks for:
   - signup → OTP verify → signin
   - role redirect correctness
   - file upload + access grant/revoke lifecycle
