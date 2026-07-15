# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 1. Think Before Coding
**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First
**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes
**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

---

## Regulatory Context

This project is an open-source, community-driven desktop application for verifying digital data access permits issued by Health Data Access Bodies (HDABs) under the EHDS regulation. Always use the final Regulation numbering, not the draft-proposal numbering.

The digital permit is a machine-readable, cryptographically signed JSON document (Ed25519) that authorises a health data user to process specific datasets in a Secure Processing Environment (SPE). This validator allows the three parties in a data access workflow — SPE Operators, Data Holders, and Data Users — to independently verify the authenticity and current validity of a permit.

### EHDS Legal Text

Regulation (EU) 2025/327 establishing the European Health Data Space (EHDS) — https://eur-lex.europa.eu/eli/reg/2025/327/oj/eng

Relevant part: Chapter IV — Secondary use of electronic health data (Articles 51–80).\
Key articles relevant to this codebase: Art. 53 (purposes for secondary use), Art. 54 (legal basis values for `legalBasis` field), Art. 68 (data permit), Art. 73 (secure processing environment).

### TEHDAS2 Documentation

- **D6.3** — Guideline for HDABs on the procedures and formats for data access (contains Annex 9 — data permit template; primary reference for the permit schema validated here) — https://tehdas.eu/wp-content/uploads/2025/09/draft-guideline-for-health-data-access-bodies-on-the-procedures-and-formats-for-data-access.pdf
- **D7.1** — Guideline on how to use data in a secure processing environment — https://tehdas.eu/wp-content/uploads/2025/07/d7.1-guideline-on-how-to-use-data-in-a-secure-processing-environment.pdf

---

## Cryptographic Verification

- Algorithm: Ed25519 via `@noble/ed25519` (pure JS, no Web Crypto API dependency)
- Key format: JWK (OKP, crv: Ed25519), fetched from the issuing HDAB's `.well-known/jwks.json`
- JWKS keys are cached in `localStorage` for 1 hour; a bundled fallback key (`BUNDLED_PUBLIC_KEY` in `permitService.js`) is used when offline
- Signature verification covers the canonical payload only — a deterministic subset of permit fields (`permitId`, `issuedAt`, `expiresAt`, `issuerKid`, `dataUser`, `dataHolder`, `speOperator`, `purpose`, `legalBasis`, `dataCategories`, `datasets`, `conditions`)
- Fields outside the canonical payload (`status`, `revokedAt`, etc.) are intentionally excluded from both the permit schema and the signed document

### Status derivation

Permit documents carry **no `status` field**. Status is always derived at runtime by `deriveStatus(permit)` in `permitService.js`:
1. If the permit ID is in `REVOCATION_REGISTRY` → `'revoked'`
2. If `expiresAt` is in the past → `'expired'`
3. Otherwise → `'valid'`

Never read status from the permit JSON. Never add a `status` field to the permit schema.

---

## Dev Commands

```bash
npm run dev          # Vite dev server + Electron with hot reload
npm run build        # production build for current platform
npm run build:win    # Windows (NSIS + MSI)
npm run build:mac    # macOS (DMG + PKG)
npm run build:linux  # Linux (AppImage + DEB + RPM)
```

### First-time setup

Recent npm versions block install scripts by default. Run this once per machine:

```bash
npm install
npm approve-scripts electron esbuild fsevents
npm install
```

---

## Architecture

Electron shell (`electron/main.cjs`) wraps a React + Vite SPA. In dev, Electron loads `http://localhost:5173`; in production it loads `dist/index.html`. Uses `HashRouter` — Electron's `file://` protocol does not support history-based routing.

`App.jsx` manages a `role` state (`'spe' | 'holder' | 'user'`). When no role is selected, `RoleSelector` is shown full-screen. Once a role is chosen, `AppShell` wraps the active view and routing redirects to `/spe`, `/holder`, or `/user`.

All permit operations go through `src/services/permitService.js`. All styling is inline React styles using CSS custom properties from `src/styles/` — no CSS modules or Tailwind.
