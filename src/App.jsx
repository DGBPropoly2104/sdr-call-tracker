import { useState } from 'react'
import LogCall from './components/LogCall'
import Dashboard from './components/Dashboard'
import Reports from './components/Reports'
import './index.css'

export default function App() {
  const [tab, setTab] = useState('log')
  const [rep, setRep] = useState('DB')

  return (
    <>
      <div className="header">
        <div className="header-title">PROPOLY · SDR TRACKER</div>
        <div className="header-sub">Call Tracker</div>
      </div>

      <div className="nav">
        <button className={'nav-btn' + (tab === 'log' ? ' active' : '')} onClick={() => setTab('log')}>
          Log
        </button>
        <button className={'nav-btn' + (tab === 'dashboard' ? ' active' : '')} onClick={() => setTab('dashboard')}>
          Dashboard
        </button>
        <button className={'nav-btn' + (tab === 'reports' ? ' active' : '')} onClick={() => setTab('reports')}>
          Reports
        </button>
      </div>

      <div className="content">
        {tab === 'log' && <LogCall rep={rep} setRep={setRep} />}
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'reports' && <Reports />}
      </div>
    </>
  )
}
