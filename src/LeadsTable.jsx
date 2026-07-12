import { useEffect, useState } from 'react'
import './LeadsTable.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/leads'

// The handful of fields worth showing at a glance; everything else lives
// behind "View more".
const IMPORTANT_FIELDS = [
  'Company Name',
  'Role Title',
  'Role Type',
  'Compensation',
  'Location',
  'Work Mode',
  'Status',
  'Apply Link',
]

const EMPTY = new Set(['', 'not stated', 'none stated', 'n/a', 'na', 'null'])
const isEmpty = (v) => EMPTY.has((v ?? '').toString().trim().toLowerCase())

function StatusBadge({ status }) {
  if (!status) return null
  return (
    <span
      className={`status-badge status-${status.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {status}
    </span>
  )
}

function ApplyLink({ href }) {
  if (isEmpty(href)) return <span className="muted">—</span>
  return (
    <a href={href} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
      Apply
    </a>
  )
}

function DetailsModal({ lead, headers, onClose }) {
  return (
    <div className="lead-modal-overlay" onClick={onClose}>
      <div className="lead-modal" onClick={(e) => e.stopPropagation()}>
        <div className="lead-modal-head">
          <h2>{lead['Company Name'] || 'Full details'}</h2>
          <button className="lead-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <dl className="lead-modal-body">
          {headers
            .filter((h) => !isEmpty(lead[h]))
            .map((h) => (
              <div className="lead-modal-field" key={h}>
                <dt>{h}</dt>
                <dd>
                  {h === 'Apply Link' ? (
                    <a href={lead[h]} target="_blank" rel="noreferrer">
                      {lead[h]}
                    </a>
                  ) : (
                    lead[h]
                  )}
                </dd>
              </div>
            ))}
        </dl>
      </div>
    </div>
  )
}

function LeadCard({ lead, onOpenCarousel, onViewMore }) {
  const location = [lead['Location'], lead['Work Mode']]
    .filter((v) => !isEmpty(v))
    .join(' · ')
  return (
    <div className="lead-card" onClick={onOpenCarousel}>
      <div className="lead-card-top">
        <h3>{lead['Company Name'] || 'Company'}</h3>
        <StatusBadge status={lead['Status']} />
      </div>
      <div className="lead-card-role">{lead['Role Title'] || 'Opportunity'}</div>
      <div className="lead-card-tags">
        {!isEmpty(lead['Role Type']) && (
          <span className="lead-tag">{lead['Role Type']}</span>
        )}
        {!isEmpty(lead['Compensation']) && (
          <span className="lead-tag">{lead['Compensation']}</span>
        )}
      </div>
      {location && <div className="lead-card-loc">📍 {location}</div>}
      <div className="lead-card-actions">
        <ApplyLink href={lead['Apply Link']} />
        <button
          className="view-more-btn"
          onClick={(e) => {
            e.stopPropagation()
            onViewMore()
          }}
        >
          View more
        </button>
      </div>
    </div>
  )
}

function LeadsTable({ onLogout, onViewStats, onSelectLead }) {
  const [headers, setHeaders] = useState([])
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState('cards')
  const [detailLead, setDetailLead] = useState(null)

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

  const importantCols = IMPORTANT_FIELDS.filter((f) => headers.includes(f))

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
          {rows.map((row, i) => (
            <LeadCard
              key={i}
              lead={row}
              onOpenCarousel={() => onSelectLead(row)}
              onViewMore={() => setDetailLead(row)}
            />
          ))}
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
        <DetailsModal
          lead={detailLead}
          headers={headers}
          onClose={() => setDetailLead(null)}
        />
      )}
    </div>
  )
}

export default LeadsTable
