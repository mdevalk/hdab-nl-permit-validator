import React from 'react'
import { Shield, Database, User } from 'lucide-react'

const ROLES = [
  {
    id: 'spe',
    icon: Shield,
    color: 'var(--color-spe)',
    title: 'SPE Operator',
    subtitle: 'Secure Processing Environment',
    description: 'Monitor active permits across datasets, verify that an active permit covers a requested processing operation, and audit access events.',
  },
  {
    id: 'holder',
    icon: Database,
    color: 'var(--color-holder)',
    title: 'Data Holder',
    subtitle: 'Health data source organisation',
    description: "Verify a data user's permit before granting access to a dataset. Confirm the permit is valid, not expired or revoked, and covers the specific dataset you hold.",
  },
  {
    id: 'user',
    icon: User,
    color: 'var(--color-user)',
    title: 'Data User',
    subtitle: 'Researcher or commercial applicant',
    description: 'View your own permit details, check its current validity status, and share or export it to present to data holders and SPE operators.',
  },
]

export default function RoleSelector({ onSelect }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <Shield size={28} color="var(--color-primary)" />
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
          HDAB-NL Permit Validator
        </h1>
      </div>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 40, textAlign: 'center', maxWidth: 420 }}>
        Select your role to begin. You can switch roles at any time from the header.
      </p>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 900 }}>
        {ROLES.map(({ id, icon: Icon, color, title, subtitle, description }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            style={{
              background: 'var(--color-surface)',
              border: '2px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              padding: '28px 24px',
              width: 260,
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.1s',
              boxShadow: 'var(--shadow)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = color
              e.currentTarget.style.boxShadow = `0 0 0 3px ${color}22, var(--shadow-md)`
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--color-border)'
              e.currentTarget.style.boxShadow = 'var(--shadow)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: `${color}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Icon size={22} color={color} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{title}</div>
            <div style={{ fontSize: 12, color: color, fontWeight: 600, marginBottom: 10 }}>{subtitle}</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.55 }}>{description}</div>
          </button>
        ))}
      </div>

      <p style={{ marginTop: 48, fontSize: 12, color: 'var(--color-text-muted)' }}>HDAB-NL</p>
    </div>
  )
}
