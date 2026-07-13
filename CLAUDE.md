# CLAUDE.md — HDAB-NL Permit Validator

This file provides context for AI-assisted development on this repository.

## Project Purpose

This is the official permit verification tool for the European Health Data Space (EHDS). It allows the three parties in a health data access workflow to independently verify the authenticity and validity of a digital data access permit issued by a Health Data Access Body (HDAB):

| Role | Use |
|---|---|
| **SPE Operator** | Verify a permit before granting access to the Secure Processing Environment |
| **Data Holder** | Confirm a valid permit before preparing and delivering datasets |
| **Data User** | Check permit status, conditions, and legal basis for their own access request |

## Regulatory Framework

### EHDS Regulation

**Regulation (EU) 2025/327** of the European Parliament and of the Council on the European Health Data Space.

Key articles for this project:

| Article | Subject |
|---|---|
| Art. 53(1) | Permitted purposes for secondary use of health data |
| Art. 67 | Health data access applications |
| Art. 68 | Granting of data permits; requirements and conditions |
| Art. 69 | Access to data in anonymised statistical format |
| Art. 70 | Implementing acts (application form, permit template) |
| Art. 71 | Right to opt out |
| Art. 72 | Trusted data holders |
| Art. 73 | Cross-border data access |

Full text: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202500327

### TEHDAS2 Guidelines

TEHDAS2 (Towards the European Health Data Space, Joint Action 2) provides operational guidance for HDABs implementing the EHDS regulation.

| Document | Description | URL |
|---|---|---|
| **D6.3** | Guideline for HDABs on procedures and formats for data access. Contains **Annex 9** (data permit template) and **Annex 10** (data request approval template). Primary reference for the digital permit schema. | https://tehdas.eu/wp-content/uploads/2025/09/draft-guideline-for-health-data-access-bodies-on-the-procedures-and-formats-for-data-access.pdf |
| **M6.1** | Guideline for health data holders on making personal and non-personal electronic health data available for reuse | https://tehdas.eu/wp-content/uploads/2025/09/draft-guideline-for-health-data-holders-on-making-personal-and-non-personal-electronic-health-data-available-for-reuse.pdf |
| **M6.2** | Draft guideline for data users on good application and access practice | https://tehdas.eu/wp-content/uploads/2025/01/2025-01-20-tehdas2-milestone-6.2.pdf |
| **D7.1** | Guideline on how to use data in a secure processing environment | https://tehdas.eu/wp-content/uploads/2025/07/d7.1-guideline-on-how-to-use-data-in-a-secure-processing-environment.pdf |

## Digital Permit Schema

The permit schema is maintained in the generator repository: `mdevalk/hdab-nl-permit-generator` — `schema/permit.schema.json` (JSON Schema draft 2020-12).

### Permit Status

Permit validity status is **derived at runtime** — it is not embedded in the signed document:

| Status | Condition |
|---|---|
| `valid` | Signature valid, not expired, not revoked |
| `expired` | `expiresAt` is in the past |
| `revoked` | Present in the revocation registry |
| `forged` | Ed25519 signature verification fails |

## Cryptographic Verification

- Algorithm: **Ed25519** via `@noble/ed25519` (pure JS, no Web Crypto API dependency)
- Public keys fetched from issuer JWKS endpoint, cached in `localStorage` for 1 hour
- JWKS URL: `https://raw.githubusercontent.com/mdevalk/hdab-nl-permit-generator/main/.well-known/jwks.json`
- Bundled fallback key used if JWKS fetch fails (offline use)
- Canonical payload verified: `permitId`, `issuedAt`, `expiresAt`, `issuerKid`, `dataUser`, `dataHolder`, `speOperator`, `purpose`, `legalBasis`, `dataCategories`, `datasets`, `conditions`

## Tech Stack

| Layer | Technology |
|---|---|
| Shell | Electron 33 |
| UI | React 18 + Vite 6 |
| Crypto | @noble/ed25519 + @noble/hashes |
| Packaging | electron-builder |
| Dev port | 5173 (generator uses 5174) |
