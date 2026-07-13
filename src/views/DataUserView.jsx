import React, { useState } from 'react'
import { User, Download, Share2 } from 'lucide-react'
import PermitLookup from '../components/PermitLookup.jsx'
import PermitCard from '../components/PermitCard.jsx'
import SourceBadge from '../components/SourceBadge.jsx'

export default function DataUserView() {
  const [state, setState] = useState({ permit: null, source: null })

  function handleExport() {
    if (!state.permit) return
    const json = JSON.stringify(state.permit, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${state.permit.permitId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <User size={20} color="var(--color-user)" />
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Data User — My Permit</h2>
        </div>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: 580 }}>
          View your EHDB permit details, check its current status, and export or share it
          when presenting to data holders or SPE operators.
        </p>
      </div>

      <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius)',
                    border: '1px solid var(--color-border)', padding: 20, marginBottom: 24,
                    boxShadow: 'var(--shadow)' }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>Enter your permit ID or upload a file</div>
        <PermitLookup
          onResult={(permit, source) => setState({ permit, source })}
          placeholder="Your permit ID (e.g. EHDB-2024-NL-00142)…"
        />
      </div>

      {state.permit && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <SourceBadge source={state.source} />
            <div style={{ display: 'flex', gap: 10 }}>
              <ActionButton icon={Download} label="Export JSON" onClick={handleExport} />
              <ActionButton icon={Share2} label="Copy permit ID" onClick={() => {
                navigator.clipboard?.writeText(state.permit.permitId)
              }} />
            </div>
          </div>
          <PermitCard permit={state.permit} />
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
