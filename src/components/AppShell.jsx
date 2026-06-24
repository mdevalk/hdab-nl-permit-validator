import React from 'react'
import { Shield, LogOut } from 'lucide-react'

const ROLE_LABELS = {
  spe:    { label: 'SPE Operator',  color: 'var(--color-spe)' },
  holder: { label: 'Data Holder',   color: 'var(--color-holder)' },
  user:   { label: 'Data User',     color: 'var(--color-user)' },
}

export default function AppShell({ role, onSwitchRole, children }) {
  const { label, color } = ROLE_LABELS[role] || {}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header style={{
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Shield size={22} color="var(--color-primary)" />
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>
            HDAB-NL Permit Validator
          </span>
          <span style={{
            background: color,
            color: '#fff',
            fontSize: 11,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 20,
            marginLeft: 4,
            letterSpacing: '0.02em',
          }}>
            {label}
          </span>
        </div>
        <button
          onClick={onSwitchRole}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--color-text-muted)',
            fontSize: 13,
            padding: '4px 8px',
            borderRadius: 6,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={15} />
          Switch role
        </button>
      </header>
      <main style={{ flex: 1, padding: '32px 24px', maxWidth: 960, margin: '0 auto', width: '100%' }}>
        {children}
      </main>
      <footer style={{
        textAlign: 'center',
        padding: '12px 24px',
        fontSize: 12,
        color: 'var(--color-text-muted)',
        borderTop: '1px solid var(--color-border)',
      }}>
        HDAB-NL · European Health Data Space · EHDS Regulation (EU) 2025/327
      </footer>
    </div>
  )
}
