import React, { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Building2, User, Shield, FileText, Tag, BadgeCheck, ShieldAlert, Loader, Ban, Globe, FolderOpen } from 'lucide-react'
import { verifySignature, checkRevocation } from '../services/permitService.js'

const STATUS_CONFIG = {
  valid:   { icon: CheckCircle,   color: 'var(--color-valid)',   bg: 'var(--color-valid-bg)',   label: 'Valid' },
  expired: { icon: AlertTriangle, color: 'var(--color-expired)', bg: 'var(--color-expired-bg)', label: 'Expired' },
  revoked: { icon: XCircle,       color: 'var(--color-revoked)', bg: 'var(--color-revoked-bg)', label: 'Revoked' },
}

function Section({ title, icon: Icon, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10,
                    color: 'var(--color-text-muted)', fontSize: 12, fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        <Icon size={13} />
        {title}
      </div>
      {children}
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{label}: </span>
      <span style={{ fontSize: 13 }}>{value}</span>
    </div>
  )
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function CheckRow({ loading, loadingText, icon: Icon, iconColor, bg, borderColor, left, right }) {
  if (loading) {
    return (
      <div style={{
        padding: '12px 20px', borderBottom: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--color-bg)', color: 'var(--color-text-muted)', fontSize: 13,
      }}>
        <Loader size={15} style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
        {loadingText}
      </div>
    )
  }
  return (
    <div style={{
      padding: '12px 20px', borderBottom: `1px solid ${borderColor}`,
      background: bg, display: 'flex', alignItems: 'flex-start',
      justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <Icon size={20} color={iconColor} style={{ flexShrink: 0, marginTop: 1 }} />
        <div>{left}</div>
      </div>
      {right && <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'right', lineHeight: 1.8 }}>{right}</div>}
    </div>
  )
}

function SignatureBanner({ permit }) {
  const [state, setState] = useState({ loading: true })

  useEffect(() => {
    setState({ loading: true })
    verifySignature(permit).then(result => setState({ loading: false, ...result }))
  }, [permit.permitId])

  if (state.loading) {
    return <CheckRow loading loadingText="Verifying issuer signature…" />
  }

  const { valid, issuer } = state
  return (
    <CheckRow
      icon={valid ? BadgeCheck : ShieldAlert}
      iconColor={valid ? 'var(--color-valid)' : 'var(--color-revoked)'}
      bg={valid ? '#f0fdf4' : '#fff5f5'}
      borderColor={valid ? 'var(--color-valid)' : 'var(--color-revoked)'}
      left={
        <>
          <div style={{ fontWeight: 700, fontSize: 13, color: valid ? 'var(--color-valid)' : 'var(--color-revoked)', marginBottom: 2 }}>
            {valid ? 'Issuer signature verified' : 'Issuer signature invalid — permit may be forged'}
          </div>
          {issuer ? (
            <div style={{ fontSize: 13, color: 'var(--color-text)' }}>
              Issued by <strong>{issuer.name}</strong>
              {' '}
              <span style={{ background: valid ? 'var(--color-valid)' : 'var(--color-revoked)', color: '#fff',
                             fontSize: 11, fontWeight: 600, padding: '1px 7px', borderRadius: 20 }}>
                {permit.issuer?.authorityId}
              </span>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--color-revoked)' }}>Issuing authority not recognised</div>
          )}
        </>
      }
      right={issuer && (
        <>
          <div><strong>Key ID:</strong> {state.keyId}</div>
          <div><strong>Algorithm:</strong> {state.algorithm}</div>
          <div><strong>Org ID:</strong> {issuer.organizationId}</div>
        </>
      )}
    />
  )
}

function RevocationBanner({ permit }) {
  const [state, setState] = useState({ loading: true })

  useEffect(() => {
    setState({ loading: true })
    checkRevocation(permit).then(result => setState({ loading: false, ...result }))
  }, [permit.permitId])

  if (state.loading) {
    return <CheckRow loading loadingText="Checking revocation registry…" />
  }

  const { revoked } = state
  return (
    <CheckRow
      icon={Ban}
      iconColor='var(--color-revoked)'
      bg='#fff5f5'
      borderColor='var(--color-revoked)'
      left={
        <>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-revoked)', marginBottom: 2 }}>
            Permit revoked in HDAB registry
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            {revoked
              ? `Revoked ${new Date(state.revokedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} · ${state.reason}`
              : ''
            }
          </div>
        </>
      }
    />
  )
}

function SourceBadge({ source }) {
  if (!source) return null
  const isFile = source.type === 'file'
  const Icon = isFile ? FolderOpen : Globe
  const label = isFile ? `Uploaded: ${source.filename}` : 'HDAB Registry'
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: isFile ? '#f0f4ff' : '#f0fdf4',
      color: isFile ? '#3b4ec8' : '#0e7a57',
      border: `1px solid ${isFile ? '#c7d2fe' : '#a7f3d0'}`,
    }}>
      <Icon size={11} />
      {label}
    </div>
  )
}

export default function PermitCard({ permit, source, speView = false }) {
  const cfg = STATUS_CONFIG[permit.status] || STATUS_CONFIG.expired
  const StatusIcon = cfg.icon

  return (
    <div style={{
      background: 'var(--color-surface)',
      border: `2px solid ${cfg.color}`,
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-md)',
    }}>
      <SignatureBanner permit={permit} />
      {permit.status === 'revoked' && <RevocationBanner permit={permit} />}

      <div style={{
        background: cfg.bg,
        borderBottom: `1px solid ${cfg.color}44`,
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <StatusIcon size={22} color={cfg.color} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: cfg.color }}>{cfg.label}</div>
            <div style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--color-text-muted)' }}>
              {permit.permitId}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--color-text-muted)' }}>
          {source && <div style={{ marginBottom: 6 }}><SourceBadge source={source} /></div>}
          <div>Issued: {formatDate(permit.issuedAt)}</div>
          <div>Expires: {formatDate(permit.expiresAt)}</div>
          {permit.revokedAt && <div style={{ color: cfg.color, fontWeight: 600 }}>Revoked: {formatDate(permit.revokedAt)}</div>}
        </div>
      </div>

      <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
        <Section title="Data User" icon={User}>
          <Field label="Name"    value={permit.dataUser.name} />
          <Field label="Org ID"  value={permit.dataUser.organizationId} />
          <Field label="Country" value={permit.dataUser.country} />
        </Section>

        <Section title="Data Holder" icon={Building2}>
          <Field label="Name"    value={permit.dataHolder.name} />
          <Field label="Org ID"  value={permit.dataHolder.organizationId} />
          <Field label="Country" value={permit.dataHolder.country} />
        </Section>

        <Section title="SPE Operator" icon={Shield}>
          <Field label="Name"   value={permit.speOperator.name} />
          <Field label="Org ID" value={permit.speOperator.organizationId} />
        </Section>

        <Section title="Legal Basis" icon={FileText}>
          <Field label="Purpose"     value={permit.purpose} />
          <Field label="Legal basis" value={permit.legalBasis} />
        </Section>
      </div>

      <div style={{ padding: '0 20px 20px' }}>
        <Section title="Data Categories" icon={Tag}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {permit.dataCategories.map(cat => (
              <span key={cat} style={{
                background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                borderRadius: 20, padding: '3px 10px', fontSize: 12,
              }}>
                {cat}
              </span>
            ))}
          </div>
        </Section>

        <Section title="Permitted Datasets" icon={FileText}>
          {permit.datasets.map(ds => (
            <div key={ds.id} style={{ marginBottom: 4 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--color-text-muted)' }}>{ds.id}</span>
              {' '}
              <span style={{ fontSize: 13 }}>{ds.name}</span>
            </div>
          ))}
        </Section>

        {speView ? (
          <Section title="Requested SPE Type" icon={Shield}>
            <Field label="SPE type" value={permit.speOperator.speType || '—'} />
          </Section>
        ) : (
          <Section title="Conditions" icon={AlertTriangle}>
            <ol style={{ paddingLeft: 18, fontSize: 13, lineHeight: 1.7, color: 'var(--color-text)' }}>
              {permit.conditions.map((c, i) => <li key={i}>{c}</li>)}
            </ol>
          </Section>
        )}
      </div>
    </div>
  )
}
