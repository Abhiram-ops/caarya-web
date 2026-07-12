import { useEffect, useMemo, useState } from 'react'
import './StatsPage.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/leads'

function extractSource(notes) {
  const match = (notes || '').match(/Source:\s*([^\]]+)/i)
  return match ? match[1].trim() : 'Unknown'
}

function classifyCompensation(comp) {
  const c = (comp || '').trim()
  if (c === '' || c === 'Not stated') return 'Not stated'
  if (c === 'Unpaid') return 'Unpaid'
  if (/₹\s*[\d,]+/.test(c)) return 'Paid — amount stated'
  return 'Paid — amount vague'
}

function countBy(rows, fn) {
  const counts = {}
  for (const row of rows) {
    const key = fn(row) || 'Unknown'
    counts[key] = (counts[key] || 0) + 1
  }
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
}

function BarChart({ title, data }) {
  const max = Math.max(...data.map((d) => d.count), 1)
  return (
    <div className="stat-card">
      <h2>{title}</h2>
      {data.length === 0 ? (
        <p className="empty">No data yet</p>
      ) : (
        <div className="bar-list">
          {data.map((d) => (
            <div className="bar-row" key={d.label}>
              <span className="bar-label">{d.label}</span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ width: `${(d.count / max) * 100}%` }}
                />
              </div>
              <span className="bar-value">{d.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatTile({ label, value }) {
  return (
    <div className="stat-tile">
      <div className="stat-tile-value">{value}</div>
      <div className="stat-tile-label">{label}</div>
    </div>
  )
}

function StatsPage({ onLogout, onViewLeads }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`API request failed (${res.status})`)
        return res.json()
      })
      .then(setRows)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const stats = useMemo(() => {
    const total = rows.length
    const researched = rows.filter((r) => r.Status === 'Researched').length
    const inReview = rows.filter((r) => r.Status === 'In Review').length
    const companies = new Set(rows.map((r) => r['Company Name']).filter(Boolean))

    return {
      total,
      researched,
      inReview,
      companies: companies.size,
      researchedRate: total > 0 ? Math.round((researched / total) * 100) : 0,
      bySource: countBy(rows, (r) => extractSource(r.Notes)),
      byRoleType: countBy(rows, (r) => r['Role Type'] || 'Not stated'),
      byWorkMode: countBy(rows, (r) => r['Work Mode'] || 'Not stated'),
      byCompensation: countBy(rows, (r) => classifyCompensation(r.Compensation)),
    }
  }, [rows])

  return (
    <div className="stats-page">
      <header className="stats-header">
        <h1>Lead Stats</h1>
        <div className="header-actions">
          <button className="nav-btn" onClick={onViewLeads}>
            View Leads
          </button>
          <button className="logout-btn" onClick={onLogout}>
            Log out
          </button>
        </div>
      </header>

      {loading && <p className="status-msg">Loading stats…</p>}
      {error && (
        <p className="status-msg error">
          Couldn't load stats: {error}
          <br />
          Make sure the backend server is running (<code>cd server && npm start</code>).
        </p>
      )}

      {!loading && !error && (
        <>
          <div className="kpi-row">
            <StatTile label="Total companies" value={stats.companies} />
            <StatTile label="Total opportunities" value={stats.total} />
            <StatTile label="Researched" value={stats.researched} />
            <StatTile label="In review" value={stats.inReview} />
            <StatTile label="Researched rate" value={`${stats.researchedRate}%`} />
          </div>

          <div className="stat-grid">
            <BarChart title="By source" data={stats.bySource} />
            <BarChart title="By role type" data={stats.byRoleType} />
            <BarChart title="By work mode" data={stats.byWorkMode} />
            <BarChart title="By compensation" data={stats.byCompensation} />
          </div>
        </>
      )}
    </div>
  )
}

export default StatsPage
