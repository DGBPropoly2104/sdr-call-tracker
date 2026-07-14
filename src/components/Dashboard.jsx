import { useState, useEffect, useCallback } from 'react'
import { supabase, REPS } from '../lib/supabase'

const RANGES = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This week' },
  { key: 'month', label: 'This month' },
  { key: 'all', label: 'All time' },
]

function rangeStart(key) {
  const d = new Date()
  if (key === 'today') {
    d.setHours(0, 0, 0, 0)
    return d.toISOString()
  }
  if (key === 'week') {
    const day = d.getDay()
    d.setDate(d.getDate() - day)
    d.setHours(0, 0, 0, 0)
    return d.toISOString()
  }
  if (key === 'month') {
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
    return d.toISOString()
  }
  return null
}

function pct(n, d) {
  if (!d) return null
  return Math.round((n / d) * 1000) / 10
}

export default function Dashboard() {
  const [range, setRange] = useState('today')
  const [repFilter, setRepFilter] = useState('all')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('call_logs').select('*')
    const start = rangeStart(range)
    if (start) query = query.gte('ts', start)
    if (repFilter !== 'all') query = query.eq('rep', repFilter)
    const { data, error } = await query
    if (!error) setRows(data || [])
    setLoading(false)
  }, [range, repFilter])

  useEffect(() => {
    load()
  }, [load])

  const dials = rows.length
  const connectedDM = rows.filter((r) => r.reached_dm).length
  const meetings = rows.filter((r) => r.meeting_booked).length
  const propolyMeetings = rows.filter((r) => r.meeting_booked && r.brand === 'Propoly').length
  const l4lMeetings = rows.filter((r) => r.meeting_booked && r.brand === 'L4L').length

  const connectedPct = pct(connectedDM, dials)
  const meetingPct = pct(meetings, connectedDM)
  const setRate = pct(meetings, connectedDM)

  function benchmarkClass(val, lo, hi) {
    if (val === null) return ''
    if (val >= lo && val <= hi) return 'good'
    return ''
  }

  return (
    <div>
      <div className="filter-row">
        {RANGES.map((r) => (
          <button
            key={r.key}
            className={'filter-btn' + (range === r.key ? ' active' : '')}
            onClick={() => setRange(r.key)}
          >
            {r.label}
          </button>
        ))}
      </div>
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
        <div className="label">FUNNEL</div>

        <div className="funnel-row">
          <span className="funnel-label">Dials</span>
          <div className="funnel-right">
            <span className="funnel-val">{loading ? '—' : dials}</span>
          </div>
        </div>

        <div className="funnel-row">
          <span className="funnel-label">Connected with DM</span>
          <div className="funnel-right">
            <span className="funnel-val">
              {loading ? '—' : `${connectedDM} · ${connectedPct ?? 0}%`}
            </span>
            <span className={'funnel-hint ' + benchmarkClass(connectedPct, 3, 15)}>
              industry range 3–15%
            </span>
          </div>
        </div>

        <div className="funnel-row">
          <span className="funnel-label">Meeting booked</span>
          <div className="funnel-right">
            <span className="funnel-val">
              {loading ? '—' : `${meetings} · ${meetingPct ?? 0}% of DM connects`}
            </span>
            <span className="funnel-hint">
              {loading ? '' : `Propoly ${propolyMeetings} · L4L ${l4lMeetings}`}
            </span>
          </div>
        </div>

        <div className="funnel-row">
          <span className="funnel-label">Set rate (DM → meeting)</span>
          <div className="funnel-right">
            <span className="funnel-val">{loading ? '—' : `${setRate ?? 0}%`}</span>
            <span className={'funnel-hint ' + benchmarkClass(setRate, 4, 9)}>
              industry range 4–9%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
