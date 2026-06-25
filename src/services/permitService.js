// Mock EHDB permits — replace lookupPermit() with a real HDAB API call or JWT verification.
// Replace verifySignature() with real RS256/EdDSA verification against the HDAB public key registry.

const HDAB_ISSUERS = {
  'HDAB-NL': {
    name: 'Health Data Access Body — Netherlands',
    country: 'NL',
    organizationId: 'NL-OIN-00000000008765432000',
    publicKeyId: 'hdab-nl-signing-key-2024-v1',
  },
  'HDAB-DE': {
    name: 'Gesundheitsdatenzugangsorganisation — Deutschland',
    country: 'DE',
    organizationId: 'DE-HRB-00000000-HDAB',
    publicKeyId: 'hdab-de-signing-key-2024-v1',
  },
}

const MOCK_PERMITS = [
  {
    permitId: 'EHDB-2024-NL-00142',
    status: 'valid',
    issuedAt: '2024-03-01T09:00:00Z',
    expiresAt: '2026-03-01T09:00:00Z',
    issuer: {
      authorityId: 'HDAB-NL',
      keyId: 'hdab-nl-signing-key-2024-v1',
      algorithm: 'RS256',
      signature: 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImhkYWItbmwtc2lnbmluZy1rZXktMjAyNC12MSJ9.VALID.c2lnbmF0dXJl',
      signatureValid: true,
    },
    dataUser: { name: 'Amsterdam UMC Research Institute', organizationId: 'NL-KVK-34375365', country: 'NL' },
    dataHolder: { name: 'RIVM National Institute for Public Health', organizationId: 'NL-OIN-00000000003214345000', country: 'NL' },
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
    permitId: 'EHDB-2023-NL-00089',
    status: 'expired',
    issuedAt: '2023-01-15T10:30:00Z',
    expiresAt: '2025-01-15T10:30:00Z',
    issuer: {
      authorityId: 'HDAB-NL',
      keyId: 'hdab-nl-signing-key-2024-v1',
      algorithm: 'RS256',
      signature: 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImhkYWItbmwtc2lnbmluZy1rZXktMjAyNC12MSJ9.VALID.c2lnbmF0dXJl',
      signatureValid: true,
    },
    dataUser: { name: 'Erasmus MC Epidemiology Dept.', organizationId: 'NL-KVK-24312402', country: 'NL' },
    dataHolder: { name: 'Dutch Hospital Data (DHD)', organizationId: 'NL-OIN-00000000005678901000', country: 'NL' },
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
    permitId: 'EHDB-2024-NL-00201',
    status: 'revoked',
    issuedAt: '2024-06-01T08:00:00Z',
    expiresAt: '2026-06-01T08:00:00Z',
    revokedAt: '2024-11-10T14:22:00Z',
    revocationReason: 'Data user failed to comply with output checking procedures',
    issuer: {
      authorityId: 'HDAB-NL',
      keyId: 'hdab-nl-signing-key-2024-v1',
      algorithm: 'RS256',
      signature: 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImhkYWItbmwtc2lnbmluZy1rZXktMjAyNC12MSJ9.VALID.c2lnbmF0dXJl',
      signatureValid: true,
    },
    dataUser: { name: 'Pharma Research BV', organizationId: 'NL-KVK-87654321', country: 'NL' },
    dataHolder: { name: 'GP Information Network (LINH)', organizationId: 'NL-OIN-00000000009988776000', country: 'NL' },
    speOperator: { name: 'CBS Secure Processing Environment', organizationId: 'NL-OIN-00000000001234567000', speType: 'Remote Access SPE' },
    purpose: 'Commercial research — drug utilization patterns',
    legalBasis: 'EHDS Article 54(1)(b)',
    dataCategories: ['GP prescription records', 'Diagnosis codes'],
    datasets: [{ id: 'LINH-DS-RX-2022', name: 'GP Prescription Network Dataset 2018–2023' }],
    conditions: ['Data must be processed within the designated SPE only'],
    permitDocument: 'HDAB-NL-PERMIT-2024-00201.pdf',
  },
]

export async function verifySignature(permit) {
  await new Promise((r) => setTimeout(r, 200))
  const issuerInfo = HDAB_ISSUERS[permit.issuer?.authorityId]
  return {
    valid: permit.issuer?.signatureValid ?? false,
    issuer: issuerInfo || null,
    keyId: permit.issuer?.keyId || null,
    algorithm: permit.issuer?.algorithm || null,
  }
}

export async function checkRevocation(permit) {
  await new Promise((r) => setTimeout(r, 300))
  if (permit.status === 'revoked') {
    return { revoked: true, revokedAt: permit.revokedAt, reason: permit.revocationReason }
  }
  return { revoked: false }
}

export function getIssuerInfo(authorityId) {
  return HDAB_ISSUERS[authorityId] || null
}

export async function lookupPermit(permitId) {
  await new Promise((r) => setTimeout(r, 600))
  const id = permitId.trim().toUpperCase()
  const permit = MOCK_PERMITS.find((p) => p.permitId.toUpperCase() === id)
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
  return MOCK_PERMITS.map((p) => ({ id: p.permitId, status: p.status }))
}
