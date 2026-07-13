import React from 'react'
import { Search, Upload, Database } from 'lucide-react'

const SOURCES = {
  lookup:   { icon: Search,   label: 'Looked up by ID',          color: 'var(--color-primary)' },
  upload:   { icon: Upload,   label: 'Loaded from uploaded file', color: '#7c3aed' },
  registry: { icon: Database, label: 'Mock registry',             color: 'var(--color-text-muted)' },
}

export default function SourceBadge({ source }) {
  if (!source) return null
  const cfg = SOURCES[source] || SOURCES.lookup
  const Icon = cfg.icon
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 12, color: cfg.color, marginBottom: 12,
      padding: '4px 10px',
      background: `${cfg.color}12`,
      border: `1px solid ${cfg.color}33`,
      borderRadius: 20,
    }}>
      <Icon size={12} />
      <span>Source: <strong>{cfg.label}</strong></span>
    </div>
  )
}
