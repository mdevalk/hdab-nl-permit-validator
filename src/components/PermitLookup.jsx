import React, { useState } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { lookupPermit, getMockPermitIds } from '../services/permitService.js'

export default function PermitLookup({ onResult, placeholder = 'Enter permit ID…' }) {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showExamples, setShowExamples] = useState(false)
  const examples = getMockPermitIds()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!value.trim()) return
    setLoading(true)
    setError(null)
    try {
      const result = await lookupPermit(value)
      if (!result.found) {
        setError(`No permit found for ID "${value.trim()}"`)
        onResult(null)
      } else {
        onResult(result.permit)
      }
    } catch {
      setError('Lookup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function useExample(id) {
    setValue(id)
    setShowExamples(false)
  }

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1,
            padding: '10px 14px',
            border: '1.5px solid var(--color-border)',
            borderRadius: 8,
            fontSize: 14,
            outline: 'none',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
          onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          style={{
            background: 'var(--color-primary)',
            color: '#fff',
            padding: '10px 18px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            opacity: loading || !value.trim() ? 0.6 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          <Search size={15} />
          {loading ? 'Looking up…' : 'Validate'}
        </button>
      </form>

      <button
        onClick={() => setShowExamples(v => !v)}
        style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}
      >
        <ChevronDown size={13} style={{ transform: showExamples ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
        Demo permit IDs
      </button>

      {showExamples && (
        <div style={{
          marginTop: 8,
          padding: '8px 12px',
          background: 'var(--color-bg)',
          borderRadius: 8,
          border: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}>
          {examples.map(({ id, status }) => (
            <button
              key={id}
              onClick={() => useExample(id)}
              style={{ textAlign: 'left', fontSize: 13, padding: '4px 6px', borderRadius: 4,
                       color: 'var(--color-primary)', fontFamily: 'monospace' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--color-border)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {id} <span style={{ color: 'var(--color-text-muted)', fontFamily: 'inherit' }}>— {status}</span>
            </button>
          ))}
        </div>
      )}

      {error && (
        <p style={{ marginTop: 10, color: 'var(--color-revoked)', fontSize: 13 }}>{error}</p>
      )}
    </div>
  )
}
