// Real Ed25519 verification against the HDAB-NL JWKS endpoint.
// Falls back to the bundled public key when offline.

const JWKS_URL      = 'https://raw.githubusercontent.com/mdevalk/hdab-nl-permit-generator/claude/amazing-dijkstra-fysn0n/.well-known/jwks.json'
const JWKS_CACHE_KEY = 'hdab_jwks_cache'
const JWKS_CACHE_TTL = 60 * 60 * 1000 // 1 hour
const ED25519        = { name: 'Ed25519' }

const BUNDLED_PUBLIC_KEY = {
  kty: 'OKP', crv: 'Ed25519', alg: 'Ed25519',
  kid: 'hdab-nl-signing-key-2025-v1', use: 'sig',
  ext: true, key_ops: ['verify'],
  x: 'Oob343RfMvsZmcqTtSd3KOom-KrpLp6yRm86K2sh_aQ',
}

const HDAB_ISSUERS = {
  'HDAB-NL': {
    name: 'Health Data Access Body — Netherlands',
    country: 'NL',
    organizationId: 'NL-OIN-00000000008765432000',
    publicKeyId: 'hdab-nl-signing-key-2025-v1',
  },
  'HDAB-DE': {
    name: 'Gesundheitsdatenzugangsorganisation — Deutschland',
    country: 'DE',
    organizationId: 'DE-HRB-00000000-HDAB',
    publicKeyId: 'hdab-de-signing-key-2025-v1',
  },
}

const MOCK_PERMITS = [
  {
    permitId: 'EHDS-2024-NL-00142',
    status: 'valid',
    issuedAt: '2024-03-01T09:00:00Z',
    expiresAt: '2026-03-01T09:00:00Z',
    issuer: {
      authorityId: 'HDAB-NL',
      keyId: 'hdab-nl-signing-key-2025-v1',
      algorithm: 'Ed25519',
      signature: '7QZ6Hhs0lKFy3ocnJhSpOFdpVnabR3Ls5zFtRzgcDCV_EGIiQuONdTOLIX0-q9nmF4LvUqtcZm7btA-_FNfhDA',
    },
    dataUser:    { name: 'Amsterdam UMC Research Institute', organizationId: 'NL-KVK-34375365', country: 'NL' },
    dataHolder:  { name: 'RIVM National Institute for Public Health', organizationId: 'NL-OIN-00000000003214345000', country: 'NL' },
    speOperator: { name: 'CBS Secure Processing Environment', organizationId: 'NL-OIN-00000000001234567000', speType: 'Remote Access SPE' },
    purpose: 'Scientific research — cardiovascular disease epidemiology',
    legalBasis: 'EHDS Article 54(1)(a)',
    dataCategories: ['Electronic health records', 'Medical imaging data', 'Genomic data (aggregated)'],
    datasets: [{ id: 'RIVM-DS-2019-CVD', name: 'Cardiovascular Disease Registry 2010–2023' }],
    conditions: [
      'Data must be processed within the designated SPE only',
      'No re-identification of natural persons permitted',
      'Results must be reviewed by HDAB before publication',
    ],
    permitDocument: 'HDAB-NL-PERMIT-2024-00142.pdf',
  },
  {
    permitId: 'EHDS-2023-NL-00089',
    status: 'expired',
    issuedAt: '2023-01-15T10:30:00Z',
    expiresAt: '2025-01-15T10:30:00Z',
    issuer: {
      authorityId: 'HDAB-NL',
      keyId: 'hdab-nl-signing-key-2025-v1',
      algorithm: 'Ed25519',
      signature: 'omwz2EoZHRgtFBPRuV9qUnlcK3977smKtrL5TfhvV2cXgjABe090VMzm-K4nsXW6UlicYXUqeQ__nbanAj5MDg',
    },
    dataUser:    { name: 'Erasmus MC Epidemiology Dept.', organizationId: 'NL-KVK-24312402', country: 'NL' },
    dataHolder:  { name: 'Dutch Hospital Data (DHD)', organizationId: 'NL-OIN-00000000005678901000', country: 'NL' },
    speOperator: { name: 'CBS Secure Processing Environment', organizationId: 'NL-OIN-00000000001234567000', speType: 'On-site SPE' },
    purpose: 'Scientific research — oncology outcomes after surgical intervention',
    legalBasis: 'EHDS Article 54(1)(a)',
    dataCategories: ['Hospital discharge data', 'Surgical procedure records'],
    datasets: [{ id: 'DHD-DS-ONCO-2021', name: 'National Oncology Surgery Registry' }],
    conditions: [
      'Data must be processed within the designated SPE only',
      'Minimum cell size of 10 for all output tables',
    ],
    permitDocument: 'HDAB-NL-PERMIT-2023-00089.pdf',
  },
  {
    permitId: 'EHDS-2024-NL-00201',
    status: 'revoked',
    issuedAt: '2024-06-01T08:00:00Z',
    expiresAt: '2026-06-01T08:00:00Z',
    revokedAt: '2024-11-10T14:22:00Z',
    revocationReason: 'Data user failed to comply with output checking procedures',
    issuer: {
      authorityId: 'HDAB-NL',
      keyId: 'hdab-nl-signing-key-2025-v1',
      algorithm: 'Ed25519',
      signature: 'HB_BjrsIE5fkT4lXebmd2zEVRNgORzn_gGPEzD_S7DKXL2zfUw6RVowj6t9BdgW2nbiT-ZTessMEyMu4iwqIDQ',
    },
    dataUser:    { name: 'Pharma Research BV', organizationId: 'NL-KVK-87654321', country: 'NL' },
    dataHolder:  { name: 'GP Information Network (LINH)', organizationId: 'NL-OIN-00000000009988776000', country: 'NL' },
    speOperator: { name: 'CBS Secure Processing Environment', organizationId: 'NL-OIN-00000000001234567000', speType: 'Remote Access SPE' },
    purpose: 'Commercial research — drug utilization patterns',
    legalBasis: 'EHDS Article 54(1)(b)',
    dataCategories: ['GP prescription records', 'Diagnosis codes'],
    datasets: [{ id: 'LINH-DS-RX-2022', name: 'GP Prescription Network Dataset 2018–2023' }],
    conditions: ['Data must be processed within the designated SPE only'],
    permitDocument: 'HDAB-NL-PERMIT-2024-00201.pdf',
  },
]

// The fields that are covered by the signature — must match the generator exactly.
function canonicalPayload(permit) {
  return {
    permitId:       permit.permitId,
    issuedAt:       permit.issuedAt,
    expiresAt:      permit.expiresAt,
    issuerKeyId:    permit.issuer.keyId,
    dataUser:       permit.dataUser,
    dataHolder:     permit.dataHolder,
    speOperator:    permit.speOperator,
    purpose:        permit.purpose,
    legalBasis:     permit.legalBasis,
    dataCategories: permit.dataCategories,
    datasets:       permit.datasets,
    conditions:     permit.conditions,
  }
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

  const issuerInfo = HDAB_ISSUERS[permit.issuer?.authorityId]

  if (!permit.issuer?.signature) {
    return { valid: false, issuer: issuerInfo || null, keyId: permit.issuer?.keyId || null, algorithm: 'Ed25519' }
  }

  try {
    const keys     = await fetchJwks()
    const keyJwk   = keys.find(k => k.kid === permit.issuer.keyId)
    if (!keyJwk) return { valid: false, issuer: issuerInfo || null, keyId: permit.issuer.keyId, algorithm: 'Ed25519' }

    const publicKey = await crypto.subtle.importKey('jwk', keyJwk, ED25519, false, ['verify'])
    const encoded   = new TextEncoder().encode(JSON.stringify(canonicalPayload(permit)))
    const b64       = permit.issuer.signature.replace(/-/g, '+').replace(/_/g, '/')
    const sigBytes  = Uint8Array.from(atob(b64), c => c.charCodeAt(0))
    const valid     = await crypto.subtle.verify(ED25519, publicKey, sigBytes, encoded)

    return { valid, issuer: issuerInfo || null, keyId: keyJwk.kid, algorithm: 'Ed25519' }
  } catch {
    return { valid: false, issuer: issuerInfo || null, keyId: permit.issuer?.keyId, algorithm: 'Ed25519' }
  }
}

export async function checkRevocation(permit) {
  await new Promise(r => setTimeout(r, 300))
  if (permit.status === 'revoked') {
    return { revoked: true, revokedAt: permit.revokedAt, reason: permit.revocationReason }
  }
  return { revoked: false }
}

export function getIssuerInfo(authorityId) {
  return HDAB_ISSUERS[authorityId] || null
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
  return MOCK_PERMITS.map(p => ({ id: p.permitId, status: p.status }))
}
