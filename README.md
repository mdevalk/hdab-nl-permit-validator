# HDAB-NL Permit Validator

A cross-platform desktop application for verifying EHDS health data access permits issued by Health Data Access Bodies (HDABs). Built with Electron, React, and Vite.

## Overview

Under the European Health Data Space (EHDS) regulation, HDABs issue digitally signed permits that authorise access to health data for secondary use. This application allows the three parties involved in a data access workflow to independently verify the authenticity and validity of a permit:

| Role | Use |
|---|---|
| **SPE Operator** | Verify incoming permits before granting access to the Secure Processing Environment |
| **Data Holder** | Confirm a valid permit before preparing and delivering datasets |
| **Data User** | Check the status of their own permit and export or share it |

## Features

- **Ed25519 signature verification** — cryptographically verifies the HDAB signature against a JWKS, with a bundled fallback key for offline use
- **Permit lookup** — look up a permit by ID against the HDAB registry (mock)
- **File upload** — load a permit directly from a `.json` file; the UI indicates whether the permit came from the registry or was uploaded locally
- **Role-based views** — each role sees a tailored interface: SPE Operators get a permit dashboard, Data Holders get an access decision, Data Users see the full permit detail
- **Forged permit detection** — if signature verification fails, the card overrides the permit's status and shows it as forged, regardless of its embedded `status` field
- **Independent status derivation** — validity is always recomputed from `validUntil` and a locally-tracked revocation registry; the permit document's own `status`/`revocationAt` fields are informational only and never trusted
- **Multi-platform builds** — packages for Windows (NSIS/MSI), macOS (DMG/PKG), and Linux (AppImage/DEB/RPM)

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Run in development

```bash
npm run dev
```

This starts the Vite dev server on port 5173 and launches Electron pointing at it.

### Build a distributable

```bash
npm run build          # current platform
npm run build:win      # Windows
npm run build:mac      # macOS
npm run build:linux    # Linux
```

## Signature Verification

The application verifies signatures using `@noble/ed25519`, matching the permit definition used by [open-daams](https://github.com/mdevalk/open-daams). The canonical payload (the object that is signed) covers: `permitNumber`, `version`, `applicationId`, `issuedAt`, `validFrom`, `validUntil`, and `issuerKid`. The permit document also carries a `status`, `revocationReason`, and `revocationAt` — these are set by the issuing HDAB but are **not** part of the signed payload, so this validator never trusts them; it always re-derives validity at runtime from `validUntil` and its own revocation registry.

Public keys are fetched from a JWKS and cached in `localStorage` for one hour. If the fetch fails, a bundled copy of the open-daams public key is used as fallback.

## Project Structure

```
├── electron/
│   └── main.cjs              # Electron main process
├── schema/
│   └── permit.schema.json    # JSON Schema for EHDS permits
├── src/
│   ├── App.jsx               # Root component, routing, role selection
│   ├── components/
│   │   ├── PermitCard.jsx    # Permit detail card with signature banner and source badge
│   │   ├── PermitLookup.jsx  # ID lookup + file upload
│   │   └── RoleSelector.jsx  # Role picker screen
│   ├── services/
│   │   └── permitService.js  # Ed25519 verification, JWKS fetch, mock registry
│   └── views/
│       ├── DataHolderView.jsx
│       ├── DataUserView.jsx
│       └── SpeOperatorView.jsx
└── package.json
```

## License

MIT
