import React, { useRef, useState, useEffect } from 'react'
import { Shield, CheckCircle, XCircle, AlertTriangle, Upload, X } from 'lucide-react'
import { getMockPermitIds, lookupPermit, deriveStatus } from '../services/permitService.js'
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
  const [selectedSource, setSelectedSource] = useState(null)
  const [filter, setFilter] = useState('all')
  const [uploadError, setUploadError] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    async function loadAll() {
      const ids = getMockPermitIds()
      const results = await Promise.all(ids.map(({ id }) => lookupPermit(id)))
      setPermits(results.filter(r => r.found).map(r => ({ permit: r.permit, source: { type: 'registry' } })))
      setLoading(false)
    }
    loadAll()
  }, [])

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const permit = JSON.parse(evt.target.result)
        if (!permit.permitId) throw new Error('Missing permitId')
        const source = { type: 'file', filename: file.name }
        setPermits(prev => {
          const exists = prev.some(p => p.permit.permitId === permit.permitId)
          if (exists) return prev.map(p => p.permit.permitId === permit.permitId ? { permit, source } : p)
          return [{ permit, source }, ...prev]
        })
        setSelected(permit)
        setSelectedSource(source)
      } catch {
        setUploadError('Could not parse permit file. Expected a valid JSON file with a permitId field.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const counts = { valid: 0, expired: 0, revoked: 0 }
  permits.forEach(({ permit }) => {
    const s = deriveStatus(permit)
    if (counts[s] !== undefined) counts[s]++
  })

  const filtered = filter === 'all' ? permits : permits.filter(({ permit }) => deriveStatus(permit) === filter)

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={20} color="var(--color-spe)" />
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>SPE Operator — Permit Dashboard</h2>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 8,
              border: '1.5px solid var(--color-spe)',
              background: '#f5f3ff',
              color: 'var(--color-spe)',
              fontSize: 13, fontWeight: 600,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#ede9fe'}
            onMouseLeave={e => e.currentTarget.style.background = '#f5f3ff'}
          >
            <Upload size={14} />
            Upload permit
          </button>
          <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileChange} />
        </div>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: 580 }}>
          Monitor all active permits across datasets in the secure processing environment.
          Select a permit to verify details before allowing a processing operation to proceed.
        </p>
        {uploadError && (
          <div style={{
            marginTop: 10, display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', borderRadius: 8,
            background: 'var(--color-revoked-bg)', border: '1px solid var(--color-revoked)',
            fontSize: 13, color: 'var(--color-revoked)',
          }}>
            <XCircle size={14} style={{ flexShrink: 0 }} />
            {uploadError}
            <button onClick={() => setUploadError(null)} style={{ marginLeft: 'auto', color: 'inherit', opacity: 0.7 }}>
              <X size={13} />
            </button>
          </div>
        )}
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
            {filtered.map(({ permit: p, source }) => {
              const status = deriveStatus(p)
              const { icon: Icon, color } = STATUS_ICON[status] || STATUS_ICON.expired
              const isSelected = selected?.permitId === p.permitId
              return (
                <button
                  key={p.permitId}
                  onClick={() => {
                    if (isSelected) { setSelected(null); setSelectedSource(null) }
                    else { setSelected(p); setSelectedSource(source) }
                  }}
                  style={{
                    textAlign: 'left', padding: '12px 14px',
                    borderRadius: 8, border: '1.5px solid',
                    borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                    background: isSelected ? '#eff6ff' : 'var(--color-surface)',
                    cursor: 'pointer', boxShadow: 'var(--shadow)', transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = '#a0aec0' }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--color-border)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Icon size={15} color={color} />
                    <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600 }}>{p.permitId}</span>
                    {source.type === 'file' && (
                      <span style={{
                        marginLeft: 'auto', fontSize: 10, fontWeight: 600,
                        background: '#ede9fe', color: 'var(--color-spe)',
                        padding: '1px 6px', borderRadius: 20,
                      }}>
                        uploaded
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Application: {p.applicationId}</div>
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
              <PermitCard permit={selected} source={selectedSource} />
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
