import React, { useState, useEffect } from 'react'
import { Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { getMockPermitIds, lookupPermit } from '../services/permitService.js'
import PermitCard from '../components/PermitCard.jsx'

const STATUS_ICON = {
  valid:   { icon: CheckCircle,   color: 'var(--color-valid)' },
  expired: { icon: AlertTriangle, color: 'var(--color-expired)' },
  revoked: { icon: XCircle,       color: 'var(--color-revoked)' },
}

export default function SpeOperatorView() {
  const [permits, setPermits] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function loadAll() {
      const ids = getMockPermitIds()
      const results = await Promise.all(ids.map(({ id }) => lookupPermit(id)))
      setPermits(results.filter(r => r.found).map(r => r.permit))
      setLoading(false)
    }
    loadAll()
  }, [])

  const counts = { valid: 0, expired: 0, revoked: 0 }
  permits.forEach(p => { if (counts[p.status] !== undefined) counts[p.status]++ })

  const filtered = filter === 'all' ? permits : permits.filter(p => p.status === filter)

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Shield size={20} color="var(--color-spe)" />
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>SPE Operator — Permit Dashboard</h2>
        </div>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: 580 }}>
          Monitor all active permits across datasets in the secure processing environment.
          Select a permit to verify details before allowing a processing operation to proceed.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <SummaryCard label="Active"  count={counts.valid}   color="var(--color-valid)"   bg="var(--color-valid-bg)" />
        <SummaryCard label="Expired" count={counts.expired} color="var(--color-expired)" bg="var(--color-expired-bg)" />
        <SummaryCard label="Revoked" count={counts.revoked} color="var(--color-revoked)" bg="var(--color-revoked-bg)" />
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {['all', 'valid', 'expired', 'revoked'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              border: '1.5px solid',
              borderColor: filter === f ? 'var(--color-primary)' : 'var(--color-border)',
              background: filter === f ? 'var(--color-primary)' : 'var(--color-surface)',
              color: filter === f ? '#fff' : 'var(--color-text)',
              textTransform: 'capitalize',
            }}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Loading permits…</p>
      ) : (
        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: selected ? '280px 1fr' : '1fr', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(p => {
              const { icon: Icon, color } = STATUS_ICON[p.status] || STATUS_ICON.expired
              return (
                <button
                  key={p.permitId}
                  onClick={() => setSelected(selected?.permitId === p.permitId ? null : p)}
                  style={{
                    textAlign: 'left', padding: '12px 14px',
                    borderRadius: 8, border: '1.5px solid',
                    borderColor: selected?.permitId === p.permitId ? 'var(--color-primary)' : 'var(--color-border)',
                    background: selected?.permitId === p.permitId ? '#eff6ff' : 'var(--color-surface)',
                    cursor: 'pointer', boxShadow: 'var(--shadow)', transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => { if (selected?.permitId !== p.permitId) e.currentTarget.style.borderColor = '#a0aec0' }}
                  onMouseLeave={e => { if (selected?.permitId !== p.permitId) e.currentTarget.style.borderColor = 'var(--color-border)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Icon size={15} color={color} />
                    <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600 }}>{p.permitId}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 2 }}>{p.dataUser.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>↳ {p.dataHolder.name}</div>
                </button>
              )
            })}
            {filtered.length === 0 && (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>No permits match this filter.</p>
            )}
          </div>
          {selected && (
            <div>
              <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 13,
                            color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Permit Details
              </div>
              <PermitCard permit={selected} speView />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, count, color, bg }) {
  return (
    <div style={{
      background: bg, border: `1.5px solid ${color}44`,
      borderRadius: 'var(--radius)', padding: '14px 20px',
      minWidth: 110, boxShadow: 'var(--shadow)',
    }}>
      <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>{count}</div>
      <div style={{ fontSize: 12, color, fontWeight: 600, marginTop: 4 }}>{label}</div>
    </div>
  )
}
