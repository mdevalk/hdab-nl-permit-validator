import React, { useState } from 'react'
import { Database, CheckCircle, XCircle, AlertTriangle, Package, ArrowRight, Shield } from 'lucide-react'
import PermitLookup from '../components/PermitLookup.jsx'
import PermitCard from '../components/PermitCard.jsx'

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
          Before granting a data user access to your dataset, verify their EHDB permit is valid,
          covers your specific dataset, and has not been revoked or expired.
        </p>
      </div>

      <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius)',
                    border: '1px solid var(--color-border)', padding: 20, marginBottom: 24,
                    boxShadow: 'var(--shadow)' }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>Look up a permit</div>
        <PermitLookup onResult={handleResult} placeholder="Enter permit ID provided by data user…" />
      </div>

      {permit && (
        <>
          <AccessDecision permit={permit} />
          {permit.status === 'valid' && <DataDelivery permit={permit} />}
          <div style={{ marginTop: 20 }}>
            <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 13,
                          color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Full Permit Details
            </div>
            <PermitCard permit={permit} source={source} />
          </div>
        </>
      )}
    </div>
  )
}

function DataDelivery({ permit }) {
  const spe = permit.speOperator

  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1.5px solid var(--color-border)',
      borderRadius: 'var(--radius)',
      marginTop: 16,
      boxShadow: 'var(--shadow)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 20px',
        background: '#f8faff',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontWeight: 700,
        fontSize: 13,
      }}>
        <Package size={15} color="var(--color-holder)" />
        Data Delivery Instructions
      </div>

      <div style={{ padding: 20 }}>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Datasets to deliver
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {permit.datasets.map(ds => (
            <div key={ds.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px',
              background: 'var(--color-bg)',
              borderRadius: 8,
              border: '1px solid var(--color-border)',
            }}>
              <Package size={14} color="var(--color-holder)" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{ds.name}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--color-text-muted)', marginTop: 1 }}>{ds.id}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <ArrowRight size={15} color="var(--color-text-muted)" />
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Deliver to
          </div>
        </div>

        <div style={{
          padding: '14px 16px',
          background: 'var(--color-bg)',
          borderRadius: 8,
          border: '1.5px solid var(--color-spe)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
        }}>
          <Shield size={18} color="var(--color-spe)" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{spe.name}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4 }}>
              Org ID: <span style={{ fontFamily: 'monospace' }}>{spe.organizationId}</span>
            </div>
            {spe.speType && (
              <span style={{
                display: 'inline-block',
                background: '#ede9fe',
                color: 'var(--color-spe)',
                fontSize: 11,
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 20,
              }}>
                {spe.speType}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function AccessDecision({ permit }) {
  const isValid   = permit.status === 'valid'
  const isRevoked = permit.status === 'revoked'

  const Icon  = isValid ? CheckCircle : isRevoked ? XCircle : AlertTriangle
  const color = isValid ? 'var(--color-valid)' : isRevoked ? 'var(--color-revoked)' : 'var(--color-expired)'
  const bg    = isValid ? 'var(--color-valid-bg)' : isRevoked ? 'var(--color-revoked-bg)' : 'var(--color-expired-bg)'

  const headline = isValid
    ? 'Access may be granted'
    : isRevoked
    ? 'Access must be denied — permit revoked'
    : 'Access must be denied — permit expired'

  const detail = isValid
    ? 'This permit is currently valid. Verify that your dataset is listed under "Permitted Datasets" before granting access.'
    : isRevoked
    ? `This permit was revoked on ${new Date(permit.revokedAt).toLocaleDateString('en-GB')}. Reason: ${permit.revocationReason}`
    : `This permit expired on ${new Date(permit.expiresAt).toLocaleDateString('en-GB')}. The data user must apply for a renewal.`

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
