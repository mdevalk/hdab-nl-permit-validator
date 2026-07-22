// Real Ed25519 verification against the open-daams public signing key.
// open-daams has no public deployment yet, so the primary source is a static
// JWKS file committed to its repo (fetched via raw.githubusercontent.com);
// the bundled key below is the offline fallback.
// TODO: once open-daams is deployed somewhere reachable, point JWKS_URL at
// its live `/.well-known/jwks.json` route instead.

import * as ed from '@noble/ed25519'
import { sha512 } from '@noble/hashes/sha512'

// Required by @noble/ed25519 v2 when crypto.subtle is unavailable or restricted.
ed.etc.sha512Sync = (...m) => sha512(...m)

const JWKS_URL       = 'https://raw.githubusercontent.com/mdevalk/open-daams/main/public/jwks/jwks.json'
const JWKS_CACHE_KEY = 'hdab_jwks_cache'
const JWKS_CACHE_TTL = 60 * 60 * 1000 // 1 hour

const BUNDLED_PUBLIC_KEY = {
  kty: 'OKP', crv: 'Ed25519', kid: 'open-daams-nl-signing-key-2026-v1',
  use: 'sig', alg: 'EdDSA',
  x: 'JOu9hHNvuFFi0kwtgrPCXQ1OzqUMF8KwQPHO93uvVXs',
}

// open-daams is a single-tenant reference implementation for a fictional
// "HDAB-NL" — issuer identity is looked up locally by kid, not trusted from
// the permit document itself.
const HDAB_ISSUERS = {
  'open-daams-nl-signing-key-2026-v1': {
    name: 'Health Data Access Body Nederland (HDAB-NL)',
    country: 'NL',
  },
}

// Revocation is tracked server-side; the permit document's own status/
// revocationAt fields are informational only and are never trusted here —
// status is always re-derived below.
const REVOCATION_REGISTRY = {
  'DP-NL-2025-0201': {
    revokedAt: '2026-05-10T14:22:00Z',
    reason: 'Data user failed to comply with output checking procedures',
  },
}

// The full, human-readable permit id combines the stable base number with
// the version, e.g. "DP-NL-2025-0142-v2". Version 1 shows the bare number.
function formatPermitId(permitNumber, version) {
  return version > 1 ? `${permitNumber}-v${version}` : permitNumber
}

function buildMockPermit({ permitNumber, version, applicationId, issuedAt, validFrom, validUntil, grantedDatasets, status, revocationReason, revocationAt, signature }) {
  return {
    permitNumber, version, applicationId,
    issuedAt, validFrom, validUntil, grantedDatasets,
    issuerKid: 'open-daams-nl-signing-key-2026-v1',
    permitId: formatPermitId(permitNumber, version),
    status, revocationReason, revocationAt,
    signature,
    signingKeyId: 'open-daams-nl-signing-key-2026-v1',
    algorithm: 'Ed25519',
  }
}

const MOCK_PERMITS = [
  buildMockPermit({
    permitNumber: 'DP-NL-2025-0142',
    version: 2,
    applicationId: 'clx1a9f3k0007le08qr2mzp1',
    issuedAt: '2025-09-01T09:00:00.000Z',
    validFrom: '2025-09-01T09:00:00.000Z',
    validUntil: '2027-09-01T09:00:00.000Z',
    grantedDatasets: [
      { dataHolderName: 'RIVM', datasets: [{ name: 'Landelijke Basisregistratie Ziekenhuiszorg (LBZ) — ontslagdiagnoses', url: null }] },
      { dataHolderName: 'GP Information Network (LINH)', datasets: [{ name: 'Medicatievoorschriften huisartsenpraktijken (ATC A10)', url: null }] },
    ],
    status: 'AMENDED',
    revocationReason: null,
    revocationAt: null,
    signature: 't7jGje4fsvQs9_HDjj7CgYGbhvks60tHO5vaLUXu7f-OtfY4RRO6S9GD7XyReYmU7sd0odi_B2ZlqKEeX-vjCg',
  }),
  buildMockPermit({
    permitNumber: 'DP-NL-2024-0089',
    version: 1,
    applicationId: 'clx1a9f3k0007le08qr2abcd',
    issuedAt: '2024-01-15T10:30:00.000Z',
    validFrom: '2024-01-15T10:30:00.000Z',
    validUntil: '2025-01-15T10:30:00.000Z',
    grantedDatasets: [
      { dataHolderName: 'RIVM', datasets: [{ name: 'Praeventis — landelijke vaccinatieregistratie', url: null }] },
    ],
    status: 'EXPIRED',
    revocationReason: null,
    revocationAt: null,
    signature: 'lNpplb6KyRGkTefVME5toPMf5vql5_Hth2lkUNoY-5wE99cZUPilXY2WclDoJuGWagOmUU3_HPzB2SADfYnUBA',
  }),
  buildMockPermit({
    permitNumber: 'DP-NL-2025-0201',
    version: 1,
    applicationId: 'clx1a9f3k0007le08qr2efgh',
    issuedAt: '2025-06-01T08:00:00.000Z',
    validFrom: '2025-06-01T08:00:00.000Z',
    validUntil: '2027-06-01T08:00:00.000Z',
    grantedDatasets: [
      { dataHolderName: 'Vektis', datasets: [{ name: 'Declaraties geestelijke gezondheidszorg (GGZ)', url: null }] },
    ],
    status: 'REVOKED',
    revocationReason: 'Data user failed to comply with output checking procedures',
    revocationAt: '2026-05-10T14:22:00Z',
    signature: 'Kqag3foGX6XgMgK0eGXudPouXUEezHPlrfdxipgBucJRiJ4ad797pDSTySAosXRzYsBqHz-vf1RzaUkr5onYDw',
  }),
]

// Derive the effective status from validity dates and the local revocation
// registry. The permit document's own `status` field is never read here.
export function deriveStatus(permit) {
  if (REVOCATION_REGISTRY[permit.permitId]) return 'revoked'
  if (new Date(permit.validUntil) < new Date()) return 'expired'
  return 'valid'
}

export function getRevocationInfo(permitId) {
  return REVOCATION_REGISTRY[permitId] || null
}

// The fixed subset of fields covered by the signature — must match
// open-daams's `canonicalPermitPayload` (src/lib/permit-signing.ts) exactly.
// Gotcha: open-daams derives issuedAt/validFrom/validUntil via
// `date.toISOString()`, which always includes millisecond precision
// (".000Z", not "Z") — a permit object with second-precision timestamps
// will fail verification even though the signature itself is correct.
function canonicalPayload(permit) {
  return {
    permitNumber:     permit.permitNumber,
    version:          permit.version,
    applicationId:    permit.applicationId,
    issuedAt:         permit.issuedAt,
    validFrom:        permit.validFrom,
    validUntil:       permit.validUntil,
    grantedDatasets:  permit.grantedDatasets,
    issuerKid:        permit.issuerKid,
  }
}

// Deterministic JSON: recursively sort object keys before stringifying, so
// the signed bytes never depend on property order. Must match open-daams's
// own stableStringify exactly — that's what actually produced the signature,
// not the field order this object literal happens to be written in.
function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`
  }
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(',')}}`
  }
  return JSON.stringify(value)
}

function fromBase64Url(b64) {
  const b64std = b64.replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(b64std), c => c.charCodeAt(0))
}

async function fetchJwks() {
  try {
    const cached = JSON.parse(localStorage.getItem(JWKS_CACHE_KEY) || 'null')
    if (cached && Date.now() - cached.fetchedAt < JWKS_CACHE_TTL) return cached.keys
  } catch {}

  try {
    const res = await fetch(JWKS_URL, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) throw new Error('fetch failed')
    const { keys } = await res.json()
    localStorage.setItem(JWKS_CACHE_KEY, JSON.stringify({ keys, fetchedAt: Date.now() }))
    return keys
  } catch {
    return [BUNDLED_PUBLIC_KEY]
  }
}

export async function verifySignature(permit) {
  await new Promise(r => setTimeout(r, 200))

  const issuerInfo = HDAB_ISSUERS[permit.signingKeyId]

  if (!permit.signature || !permit.signingKeyId) {
    return { valid: false, issuer: issuerInfo || null, kid: permit.signingKeyId || null, algorithm: 'Ed25519' }
  }

  try {
    const keys   = await fetchJwks()
    const keyJwk = keys.find(k => k.kid === permit.signingKeyId)
    if (!keyJwk) return { valid: false, issuer: issuerInfo || null, kid: permit.signingKeyId, algorithm: 'Ed25519' }

    const publicKeyBytes = fromBase64Url(keyJwk.x)
    const encoded         = new TextEncoder().encode(stableStringify(canonicalPayload(permit)))
    const sigBytes         = fromBase64Url(permit.signature)
    const valid            = await ed.verify(sigBytes, encoded, publicKeyBytes)

    return { valid, issuer: issuerInfo || null, kid: keyJwk.kid, algorithm: 'Ed25519' }
  } catch {
    return { valid: false, issuer: issuerInfo || null, kid: permit.signingKeyId, algorithm: 'Ed25519' }
  }
}

export async function checkRevocation(permit) {
  await new Promise(r => setTimeout(r, 300))
  const info = REVOCATION_REGISTRY[permit.permitId]
  if (info) return { revoked: true, revokedAt: info.revokedAt, reason: info.reason }
  return { revoked: false }
}

export function getIssuerInfo(kid) {
  return HDAB_ISSUERS[kid] || null
}

export async function lookupPermit(permitId) {
  await new Promise(r => setTimeout(r, 600))
  const id = permitId.trim().toUpperCase()
  const permit = MOCK_PERMITS.find(p => p.permitId.toUpperCase() === id)
  if (!permit) return { found: false, permit: null }
  return { found: true, permit }
}

export function getStatusLabel(status) {
  switch (status) {
    case 'valid':   return 'Valid'
    case 'expired': return 'Expired'
    case 'revoked': return 'Revoked'
    default:        return 'Unknown'
  }
}

export function getMockPermitIds() {
  return MOCK_PERMITS.map(p => ({ id: p.permitId, status: deriveStatus(p) }))
}
