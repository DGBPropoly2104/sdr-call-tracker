import { useState, useEffect, useCallback } from 'react'
import { supabase, REPS } from '../lib/supabase'

function pct(n, d) {
  if (!d) return 0
  return Math.round((n / d) * 1000) / 10
}

function toCSV(rows) {
  const header = ['timestamp', 'rep', 'reached_dm', 'meeting_booked', 'brand']
  const lines = rows.map((r) =>
    [r.ts, r.rep, r.reached_dm, r.meeting_booked, r.brand || ''].join(',')
  )
  return [header.join(','), ...lines].join('\n')
}

function downloadCSV(rows) {
  const csv = toCSV(rows)
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sdr-call-logs-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function Reports() {
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [repFilter, setRepFilter] = useState('all')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('call_logs').select('*').order('ts', { ascending: false })
    if (fromDate) query = query.gte('ts', new Date(fromDate).toISOString())
    if (toDate) {
      const end = new Date(toDate)
      end.setHours(23, 59, 59, 999)
      query = query.lte('ts', end.toISOString())
    }
    if (repFilter !== 'all') query = query.eq('rep', repFilter)
    const { data, error } = await query
    if (!error) setRows(data || [])
    setLoading(false)
  }, [fromDate, toDate, repFilter])

  useEffect(() => {
    load()
  }, [load])

  async function deleteCall(id) {
    if (!window.confirm('Delete this call log?')) return
    const { error } = await supabase.from('call_logs').delete().eq('id', id)
    if (!error) setRows((prev) => prev.filter((r) => r.id !== id))
  }

  const leaderboard = REPS.map((r) => {
    const repRows = rows.filter((row) => row.rep === r)
    const dials = repRows.length
    const dm = repRows.filter((row) => row.reached_dm).length
    const meetings = repRows.filter((row) => row.meeting_booked).length
    return { rep: r, dials, dm, meetings, setRate: pct(meetings, dm) }
  }).sort((a, b) => b.meetings - a.meetings)

  return (
    <div>
      <div className="card">
        <div className="label">FILTER</div>
        <div className="date-inputs">
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>
        <div className="filter-row" style={{ marginBottom: 0 }}>
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
      </div>

      <div className="card">
        <div className="label">LEADERBOARD</div>
        {leaderboard.map((l) => (
          <div className="leaderboard-row" key={l.rep}>
            <span className="leaderboard-name">{l.rep}</span>
            <div className="leaderboard-stats">
              <span>{l.dials} dials</span>
              <span>{l.dm} DM</span>
              <span>{l.meetings} meetings</span>
              <span>{l.setRate}% set</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>CALL LOG ({rows.length})</span>
          <button className="export-btn" onClick={() => downloadCSV(rows)}>
            Export CSV
          </button>
        </div>
        {loading ? (
          <div className="empty">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="empty">No calls logged for this filter.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="log-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Rep</th>
                  <th>Outcome</th>
                  <th>Brand</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const d = new Date(r.ts)
                  const outcome = r.meeting_booked
                    ? 'Meeting'
                    : r.reached_dm
                    ? 'Reached DM'
                    : 'No DM'
                  return (
                    <tr key={r.id}>
                      <td>
                        {d.toLocaleDateString([], { day: '2-digit', month: 'short' })}{' '}
                        {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td>{r.rep}</td>
                      <td>{outcome}</td>
                      <td>{r.brand || '—'}</td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => deleteCall(r.id)}
                          aria-label="Delete call"
                          title="Delete call"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
