# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start Vite dev server + Electron (hot reload)
npm run build        # production build for current platform
npm run build:win    # Windows (NSIS + MSI)
npm run build:mac    # macOS (DMG + PKG)
npm run build:linux  # Linux (AppImage + DEB + RPM)
```

### First-time setup (npm blocks install scripts by default)

```bash
npm install
npm approve-scripts electron esbuild fsevents
npm install
```

## Architecture

Electron shell (`electron/main.cjs`) wraps a React + Vite SPA (`src/`). In dev, Electron loads `http://localhost:5173`; in production it loads `dist/index.html`. DevTools open automatically in dev mode. Use `HashRouter` (not `BrowserRouter`) — Electron's `file://` protocol does not support history-based routing.

### Role-based routing

`App.jsx` manages a `role` state (`'spe' | 'holder' | 'user'`). When no role is selected, `RoleSelector` is shown full-screen. Once selected, `AppShell` wraps the active view and routing redirects to `/spe`, `/holder`, or `/user`. Role is reset (and route navigated to `/`) when the user switches roles via the shell header.

### Permit data flow

All permit operations go through `src/services/permitService.js`:

- **`lookupPermit(id)`** — simulates a registry fetch (600 ms delay); returns a permit object or `{ found: false }`
- **`verifySignature(permit)`** — real Ed25519 verification via `@noble/ed25519`. Fetches the HDAB JWKS endpoint, caches keys in `localStorage` for 1 hour, falls back to the bundled key (`BUNDLED_PUBLIC_KEY`) if offline
- **`deriveStatus(permit)`** — the canonical status source. Checks `REVOCATION_REGISTRY` first, then compares `expiresAt` to now. **Never read status from the permit JSON itself** — permits do not carry a `status` field
- **`getRevocationInfo(permitId)`** — returns `{ revokedAt, reason }` from `REVOCATION_REGISTRY` or `null`

### Canonical payload for signing

Only these fields are signed (must match the generator exactly): `permitId`, `issuedAt`, `expiresAt`, `issuerKid`, `dataUser`, `dataHolder`, `speOperator`, `purpose`, `legalBasis`, `dataCategories`, `datasets`, `conditions`. Fields outside this set (`status`, `revokedAt`, etc.) are intentionally excluded and must not be added to the permit schema.

### Source tracking

When a permit is loaded (from registry lookup or file upload), a `source` object `{ type: 'registry' | 'file', filename?: string }` is passed alongside it as the second argument to `onResult(permit, source)`. Views store both and pass `source` as a prop to `PermitCard`, which renders a `SourceBadge` internally.

### PermitCard

`PermitCard` is self-contained: it runs `verifySignature` internally via `SignatureBanner` and derives status via `deriveStatus`. If the signature is invalid, `effectiveStatus` is overridden to `'forged'` regardless of the derived status. The `speView` prop swaps the Conditions section for a Requested SPE Type section (used in `SpeOperatorView`).

### Styling

All styling is inline React styles using CSS custom properties defined in `src/styles/`. No CSS modules or Tailwind. Role accent colours: `--color-spe` (purple), `--color-holder` (blue), `--color-user` (teal).

## Permit schema

`schema/permit.schema.json` (JSON Schema draft 2020-12) is the source of truth for what a valid permit document looks like. `additionalProperties: false` is set throughout — keep the schema and the mock data in `permitService.js` in sync when adding fields.
