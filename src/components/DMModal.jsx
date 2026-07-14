import { useState } from 'react'
import { supabase } from '../lib/supabase'

const REASONS = [
  'Contract lock-in',
  'Too much hassle to switch',
  'Happy enough with current system',
  'Mid-contract',
  'Other',
]

const OUTCOMES = ['Meeting booked', 'Follow-up call', 'Email sent', 'Closed lost']

export default function DMModal({ rep, callLogId, defaultOutcome, onClose, onSaved }) {
  const [agentCompany, setAgentCompany] = useState('')
  const [currentSystem, setCurrentSystem] = useState('')
  const [frustration, setFrustration] = useState('')
  const [whyNotChanged, setWhyNotChanged] = useState('')
  const [outcome, setOutcome] = useState(defaultOutcome || '')
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    const { error } = await supabase.from('dm_conversations').insert({
      call_log_id: callLogId,
      rep,
      agent_company: agentCompany || null,
      current_system: currentSystem || null,
      frustration: frustration || null,
      why_not_changed: whyNotChanged || null,
      outcome: outcome || null,
    })
    setSaving(false)
    if (error) {
      console.error(error)
      return
    }
    onSaved()
  }

  return (
    <div className="modal-bg">
      <div className="modal">
        <h3>Log DM conversation</h3>
        <p className="modal-sub">
          Each entry builds your dataset. After 20–30 conversations you'll see exactly where
          deals leak and which objections mask buying signals.
        </p>

        <div className="dm-field">
          <label>Agent / Company</label>
          <input
            type="text"
            placeholder="e.g. Capital Homes"
            value={agentCompany}
            onChange={(e) => setAgentCompany(e.target.value)}
          />
        </div>

        <div className="dm-field">
          <label>Current system</label>
          <input
            type="text"
            placeholder="e.g. Goodlord, Alto, Reapit, none..."
            value={currentSystem}
            onChange={(e) => setCurrentSystem(e.target.value)}
          />
        </div>

        <div className="dm-field">
          <label>Biggest frustration (exact words if possible)</label>
          <textarea
            placeholder='"It takes forever to chase rent arrears"'
            value={frustration}
            onChange={(e) => setFrustration(e.target.value)}
          />
        </div>

        <div className="dm-field">
          <label>Why they haven't changed</label>
          <select value={whyNotChanged} onChange={(e) => setWhyNotChanged(e.target.value)}>
            <option value="">Select reason...</option>
            {REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="dm-field">
          <label>Outcome</label>
          <div className="o-pills">
            {OUTCOMES.map((o) => (
              <button
                key={o}
                className={'o-pill' + (outcome === o ? ' sel' : '')}
                onClick={() => setOutcome(o)}
              >
                {o}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-save" onClick={save} disabled={saving}>
            {saving ? 'Saving...' : 'Save log'}
          </button>
          <button className="btn-skip" onClick={onClose}>
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
