import { useState, useEffect, useCallback } from 'react'
import { supabase, REPS } from '../lib/supabase'

function badgeClass(o) {
  if (o === 'Meeting booked') return 'badge badge-meeting'
  if (o === 'Follow-up call') return 'badge badge-followup'
  if (o === 'Email sent') return 'badge badge-email'
  return 'badge badge-closed'
}

export default function Insights() {
  const [repFilter, setRepFilter] = useState('all')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('dm_conversations').select('*').order('ts', { ascending: false })
    if (repFilter !== 'all') query = query.eq('rep', repFilter)
    const { data, error } = await query
    if (!error) setRows(data || [])
    setLoading(false)
  }, [repFilter])

  useEffect(() => {
    load()
  }, [load])

  const n = rows.length

  const reasonCounts = {}
  rows.forEach((r) => {
    const key = r.why_not_changed || 'Not captured'
    reasonCounts[key] = (reasonCounts[key] || 0) + 1
  })
  const reasonList = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])

  const systemCounts = {}
  rows.forEach((r) => {
    if (!r.current_system) return
    const key = r.current_system.trim()
    if (!key) return
    systemCounts[key] = (systemCounts[key] || 0) + 1
  })
  const systemList = Object.entries(systemCounts).sort((a, b) => b[1] - a[1]).slice(0, 8)

  return (
    <div>
      <div className="filter-row">
        <button
          className={'filter-btn' + (repFilter === 'all' ? ' active' : '')}
          onClick={() => setRepFilter('all')}
        >
          All reps
        </button>
        {REPS.map((r) => (
          <button
            key={r}
            className={'filter-btn' + (repFilter === r ? ' active' : '')}
            onClick={() => setRepFilter(r)}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="label">DATASET</div>
        <div className="insight-summary">
          {loading ? '—' : `${n} DM conversation${n === 1 ? '' : 's'} logged`}
        </div>
        {!loading && n > 0 && (
          <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 10, lineHeight: 1.5 }}>
            Check which frustrations repeat most and which objections are masking buying
            signals — that's where to refine the script.
          </p>
        )}
      </div>

      <div className="card">
        <div className="label">WHY THEY HAVEN'T CHANGED</div>
        {reasonList.length === 0 ? (
          <div className="empty">No reasons logged yet.</div>
        ) : (
          reasonList.map(([reason, count]) => (
            <div className="reason-bar-row" key={reason}>
              <div className="reason-bar-label">
                <span>{reason}</span>
                <span>{count}</span>
              </div>
              <div className="reason-bar-track">
                <div
