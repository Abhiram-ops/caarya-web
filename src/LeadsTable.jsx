import { useEffect, useState } from 'react'
import './LeadsTable.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/leads'

function LeadsTable({ onLogout, onViewStats, onSelectLead }) {
  const [headers, setHeaders] = useState([])
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`API request failed (${res.status})`)
        return res.json()
      })
      .then((leads) => {
        setRows(leads)
        setHeaders(leads.length > 0 ? Object.keys(leads[0]) : [])
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="leads-page">
      <header className="leads-header">
        <h1>Scraped Leads</h1>
        <div className="header-actions">
          <button className="nav-btn" onClick={onViewStats}>
            View Stats
          </button>
          <button className="logout-btn" onClick={onLogout}>
            Log out
          </button>
        </div>
      </header>

      {loading && <p className="status-msg">Loading leads…</p>}

      {error && (
        <p className="status-msg error">
          Couldn't load leads: {error}
          <br />
          Make sure the backend server is running (<code>cd server && npm start</code>).
        </p>
      )}

      {!loading && !error && rows.length === 0 && (
        <p className="status-msg">No leads found yet.</p>
      )}

      {!loading && !error && rows.length > 0 && (
        <p className="table-hint">Tip: click any row to open its social-media carousel view.</p>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="table-scroll">
          <table className="leads-table">
            <thead>
              <tr>
                {headers.map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className="lead-row"
                  onClick={() => onSelectLead(row)}
                >
                  {headers.map((h) => {
                    const cell = row[h]
                    if (h === 'Apply Link' && cell) {
                      return (
                        <td key={h}>
                          <a
                            href={cell}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Apply
                          </a>
                        </td>
                      )
                    }
                    if (h === 'Status' && cell) {
                      return (
                        <td key={h}>
                          <span className={`status-badge status-${cell.toLowerCase().replace(/\s+/g, '-')}`}>
                            {cell}
                          </span>
                        </td>
                      )
                    }
                    return <td key={h}>{cell}</td>
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default LeadsTable
