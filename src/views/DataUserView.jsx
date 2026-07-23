import React, { useState } from 'react'
import { User, Eye } from 'lucide-react'
import PermitLookup from '../components/PermitLookup.jsx'
import PermitCard from '../components/PermitCard.jsx'

export default function DataUserView() {
  const [permit, setPermit] = useState(null)
  const [source, setSource] = useState(null)
  const [showJson, setShowJson] = useState(false)

  function handleResult(permit, src) {
    setPermit(permit)
    setSource(src)
    setShowJson(false)
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <User size={20} color="var(--color-user)" />
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Data User — My Permit</h2>
        </div>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: 580 }}>
          View your EHDB permit details, check its current status, and inspect the
          underlying signed JSON when presenting to data holders or SPE operators.
        </p>
      </div>

      <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius)',
                    border: '1px solid var(--color-border)', padding: 20, marginBottom: 24,
                    boxShadow: 'var(--shadow)' }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>Enter your permit ID</div>
        <PermitLookup onResult={handleResult} placeholder="Your permit ID (e.g. DP-NL-2025-0142)…" />
      </div>

      {permit && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <ActionButton
              icon={Eye}
              label={showJson ? 'Hide JSON' : 'View JSON'}
              onClick={() => setShowJson(v => !v)}
            />
          </div>
          {showJson && (
            <pre style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)', padding: 16, marginBottom: 16,
              fontSize: 12, fontFamily: 'monospace', overflowX: 'auto',
            }}>
              {JSON.stringify(permit, null, 2)}
            </pre>
          )}
          <PermitCard permit={permit} source={source} />
        </>
      )}
    </div>
  )
}

function ActionButton({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 14px', borderRadius: 7,
        border: '1.5px solid var(--color-border)',
        background: 'var(--color-surface)',
        fontSize: 13, fontWeight: 600, color: 'var(--color-text)',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg)'}
      onMouseLeave={e => e.currentTarget.style.background = 'var(--color-surface)'}
    >
      <Icon size={14} />
      {label}
    </button>
  )
}
