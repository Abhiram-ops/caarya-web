import { useEffect, useState } from 'react'
import './LeadsTable.css'
import { IMPORTANT_FIELDS } from './leadHelpers'
import { StatusBadge, ApplyLink } from './LeadBits'
import LeadCard from './LeadCard'
import LeadDetailsModal from './LeadDetailsModal'
import { leadKey } from './opportunityContent'
import { fetchShortlist, addToShortlist, removeFromShortlist } from './shortlistApi'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/leads'

function LeadsTable({ onLogout, onViewStats, onViewShortlist, onSelectLead }) {
  const [headers, setHeaders] = useState([])
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState('cards')
  const [detailLead, setDetailLead] = useState(null)
  const [shortlist, setShortlist] = useState({})

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

    fetchShortlist()
      .then(setShortlist)
      .catch(() => {
        // Non-fatal — the leads list still works without shortlist state.
      })
  }, [])

  const importantCols = IMPORTANT_FIELDS.filter((f) => headers.includes(f))

  const handleShortlist = async (lead, tags) => {
    const key = leadKey(lead)
    const entry = await addToShortlist(key, tags)
    setShortlist((prev) => ({ ...prev, [key]: entry }))
  }

  const handleRemoveShortlist = async (lead) => {
    const key = leadKey(lead)
    await removeFromShortlist(key)
    setShortlist((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  return (
    <div className="leads-page">
      <header className="leads-header">
        <h1>Scraped Leads</h1>
        <div className="header-actions">
          <button className="nav-btn" onClick={onViewShortlist}>
            View Shortlisted
          </button>
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
        <div className="leads-toolbar">
          <div className="view-toggle">
            <button
              className={viewMode === 'cards' ? 'active' : ''}
              onClick={() => setViewMode('cards')}
            >
              Cards
            </button>
            <button
              className={viewMode === 'table' ? 'active' : ''}
              onClick={() => setViewMode('table')}
            >
              Table
            </button>
          </div>
          <span className="leads-hint">
            Click a {viewMode === 'cards' ? 'card' : 'row'} for its carousel view · “View
            more” for all fields
          </span>
        </div>
      )}

      {!loading && !error && rows.length > 0 && viewMode === 'cards' && (
        <div className="lead-card-grid">
          {rows.map((row, i) => {
            const key = leadKey(row)
            const entry = shortlist[key]
            return (
              <LeadCard
                key={i}
                lead={row}
                onOpenCarousel={() => onSelectLead(row)}
                onViewMore={() => setDetailLead(row)}
                shortlisted={!!entry}
                shortlistTags={entry?.tags || []}
                onShortlist={(tags) => handleShortlist(row, tags)}
                onRemoveShortlist={() => handleRemoveShortlist(row)}
              />
            )
          })}
        </div>
      )}

      {!loading && !error && rows.length > 0 && viewMode === 'table' && (
        <div className="table-scroll">
          <table className="leads-table">
            <thead>
              <tr>
                {importantCols.map((h) => (
                  <th key={h}>{h}</th>
                ))}
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="lead-row" onClick={() => onSelectLead(row)}>
                  {importantCols.map((h) => {
                    if (h === 'Apply Link') {
                      return (
                        <td key={h}>
                          <ApplyLink href={row[h]} />
                        </td>
                      )
                    }
                    if (h === 'Status') {
                      return (
                        <td key={h}>
                          <StatusBadge status={row[h]} />
                        </td>
                      )
                    }
                    return <td key={h}>{row[h]}</td>
                  })}
                  <td>
                    <button
                      className="view-more-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDetailLead(row)
                      }}
                    >
                      View more
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detailLead && (
        <LeadDetailsModal
          lead={detailLead}
          headers={headers}
          onClose={() => setDetailLead(null)}
        />
      )}
    </div>
  )
}

export default LeadsTable
