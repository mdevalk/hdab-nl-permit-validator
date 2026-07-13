# HDAB-NL Permit Validator

A cross-platform desktop application for verifying EHDS health data access permits issued by Health Data Access Bodies (HDABs). Built with Electron, React, and Vite.

## Overview

Under the European Health Data Space (EHDS) regulation, HDABs issue digitally signed permits that authorise access to health data for secondary use. This application allows the three parties involved in a data access workflow to independently verify the authenticity and validity of a permit:

| Role | Use |
|---|---|
| **SPE Operator** | Verify incoming permits before granting access to the Secure Processing Environment |
| **Data Holder** | Confirm a valid permit before preparing and delivering datasets |
| **Data User** | Check permit status, conditions, and legal basis for their own access request |

## Features

- **Ed25519 signature verification** — cryptographically verifies the HDAB signature against a live JWKS endpoint, with a bundled fallback key for offline use
- **Permit lookup** — look up a permit by ID against the HDAB registry (mock)
- **File upload** — load a permit directly from a `.json` file; the UI indicates whether the permit came from the registry or was uploaded locally
- **Role-based views** — each role sees a tailored interface: SPE Operators see the requested SPE type, Data Holders see delivery instructions, Data Users see the full permit detail
- **Forged permit detection** — if signature verification fails, the card overrides the permit's stated status and shows it as forged regardless of its embedded `status` field
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

The application verifies signatures using `@noble/ed25519`. The canonical payload (the object that is signed) covers: `permitId`, `issuedAt`, `expiresAt`, `issuerKid`, `dataUser`, `dataHolder`, `speOperator`, `purpose`, `legalBasis`, `dataCategories`, `datasets`, and `conditions`. The permit's validity status is derived at runtime from `expiresAt` and revocation state — it is not embedded in the signed document.

Public keys are fetched from the issuer's JWKS endpoint and cached in `localStorage` for one hour. If the fetch fails, a bundled copy of the HDAB-NL public key is used as fallback.

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
