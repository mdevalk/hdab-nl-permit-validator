import React, { useState } from 'react'
import { Database, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import PermitLookup from '../components/PermitLookup.jsx'
import PermitCard from '../components/PermitCard.jsx'
import { deriveStatus, getRevocationInfo } from '../services/permitService.js'

export default function DataHolderView() {
  const [permit, setPermit] = useState(null)
  const [source, setSource] = useState(null)

  function handleResult(permit, src) {
    setPermit(permit)
    setSource(src)
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Database size={20} color="var(--color-holder)" />
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Data Holder — Permit Verification</h2>
        </div>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: 580 }}>
          Before granting a data user access to your dataset, verify their EHDB permit is valid
          and has not been revoked or expired.
        </p>
      </div>

      <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius)',
                    border: '1px solid var(--color-border)', padding: 20, marginBottom: 24,
                    boxShadow: 'var(--shadow)' }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>Look up a permit</div>
        <PermitLookup onResult={handleResult} placeholder="Enter permit ID provided by data user…" />
      </div>

      {permit && (() => {
        const status = deriveStatus(permit)
        return (
          <>
            <AccessDecision permit={permit} status={status} />
            <div style={{ marginTop: 20 }}>
              <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 13,
                            color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Full Permit Details
              </div>
              <PermitCard permit={permit} source={source} />
            </div>
          </>
        )
      })()}
    </div>
  )
}

function AccessDecision({ permit, status }) {
  const revInfo = status === 'revoked' ? getRevocationInfo(permit.permitId) : null

  const isValid   = status === 'valid'
  const isRevoked = status === 'revoked'

  const Icon  = isValid ? CheckCircle : isRevoked ? XCircle : AlertTriangle
  const color = isValid ? 'var(--color-valid)' : isRevoked ? 'var(--color-revoked)' : 'var(--color-expired)'
  const bg    = isValid ? 'var(--color-valid-bg)' : isRevoked ? 'var(--color-revoked-bg)' : 'var(--color-expired-bg)'

  const headline = isValid
    ? 'Access may be granted'
    : isRevoked
    ? 'Access must be denied — permit revoked'
    : 'Access must be denied — permit expired'

  const detail = isValid
    ? 'This permit is currently valid. Confirm the application reference matches your own records before granting access.'
    : isRevoked && revInfo
    ? `This permit was revoked on ${new Date(revInfo.revokedAt).toLocaleDateString('en-GB')}. Reason: ${revInfo.reason}`
    : `This permit expired on ${new Date(permit.validUntil).toLocaleDateString('en-GB')}. The data user must apply for a renewal.`

  return (
    <div style={{
      background: bg, border: `2px solid ${color}`,
      borderRadius: 'var(--radius)', padding: '16px 20px',
      display: 'flex', alignItems: 'flex-start', gap: 14,
    }}>
      <Icon size={24} color={color} style={{ flexShrink: 0, marginTop: 1 }} />
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, color, marginBottom: 4 }}>{headline}</div>
        <div style={{ fontSize: 13, color: 'var(--color-text)' }}>{detail}</div>
      </div>
    </div>
  )
}
