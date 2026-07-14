import { useState, useEffect } from 'react'
import { supabase, REPS, BRANDS } from '../lib/supabase'

export default function LogCall({ rep, setRep }) {
  const [pendingMeeting, setPendingMeeting] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2200)
    return () => clearTimeout(t)
  }, [toast])

  async function log(reached_dm, meeting_booked, brand = null) {
    const { error } = await supabase.from('call_logs').insert({
      rep,
      reached_dm,
      meeting_booked,
      brand,
    })
    if (error) {
      setToast('Error saving — try again')
      console.error(error)
      return
    }
    setPendingMeeting(false)
    if (meeting_booked) {
      setToast(`Meeting booked for ${brand} logged`)
    } else if (reached_dm) {
      setToast('Reached DM logged')
    } else {
      setToast('Call logged')
    }
  }

  if (pendingMeeting) {
    return (
      <div className="card">
        <div className="label">MEETING BOOKED FOR</div>
        <div className="brand-row">
          {BRANDS.map((b) => (
            <button key={b} className="brand-btn" onClick={() => log(true, true, b)}>
              {b}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <button className="export-btn" onClick={() => setPendingMeeting(false)}>
            Back
          </button>
        </div>
        {toast && <div className="toast">{toast}</div>}
      </div>
    )
  }

  return (
    <div>
      <div className="card">
        <div className="label">REP</div>
        <div className="rep-row">
          {REPS.map((r) => (
            <button
              key={r}
              className={'rep-btn' + (rep === r ? ' active' : '')}
              onClick={() => setRep(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="label">LOG A CALL</div>
        <div className="outcome-grid">
          <button className="outcome-btn" onClick={() => log(false, false)}>
            No answer <span className="arrow">→</span>
          </button>
          <button className="outcome-btn" onClick={() => log(false, false)}>
            Gatekeeper / no DM <span className="arrow">→</span>
          </button>
          <button className="outcome-btn" onClick={() => log(true, false)}>
            Reached DM, no meeting <span className="arrow">→</span>
          </button>
          <button className="outcome-btn meeting" onClick={() => setPendingMeeting(true)}>
            Meeting booked <span className="arrow">→</span>
          </button>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
