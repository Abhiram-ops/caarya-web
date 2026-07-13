import { useEffect, useState } from 'react'
import './LeadsTable.css'
import LeadCard from './LeadCard'
import LeadDetailsModal from './LeadDetailsModal'
import { leadKey } from './opportunityContent'
import { fetchShortlist, removeFromShortlist } from './shortlistApi'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/leads'

function ShortlistedPage({ onLogout, onViewStats, onBackToLeads, onSelectLead }) {
  const [rows, setRows] = useState([])
  const [shortlist, setShortlist] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [detailLead, setDetailLead] = useState(null)

  useEffect(() => {
    Promise.all([
      fetch(API_URL).then((res) => {
        if (!res.ok) throw new Error(`Leads request failed (${res.status})`)
        return res.json()
      }),
      fetchShortlist(),
    ])
      .then(([leads, sl]) => {
        setRows(leads)
        setShortlist(sl)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleRemoveShortlist = async (lead) => {
    const key = leadKey(lead)
    await removeFromShortlist(key)
    setShortlist((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const shortlistedRows = rows.filter((row) => !!shortlist[leadKey(row)])

  return (
    <div className="leads-page">
      <header className="leads-header">
        <h1>Shortlisted Opportunities</h1>
        <div className="header-actions">
          <button className="nav-btn" onClick={onBackToLeads}>
            All Leads
          </button>
          <button className="nav-btn" onClick={onViewStats}>
            View Stats
          </button>
          <button className="logout-btn" onClick={onLogout}>
            Log out
          </button>
        </div>
      </header>

      {loading && <p className="status-msg">Loading shortlist…</p>}

      {error && (
        <p className="status-msg error">
          Couldn't load the shortlist: {error}
          <br />
          Make sure the backend server is running (<code>cd server && npm start</code>).
        </p>
      )}

      {!loading && !error && shortlistedRows.length === 0 && (
        <p className="status-msg">
          Nothing shortlisted yet — go to All Leads and click "Shortlist" on an
          opportunity.
        </p>
      )}

      {!loading && !error && shortlistedRows.length > 0 && (
        <div className="lead-card-grid">
          {shortlistedRows.map((row, i) => {
            const key = leadKey(row)
            const entry = shortlist[key]
            return (
              <LeadCard
                key={i}
                lead={row}
                onOpenCarousel={() => onSelectLead(row)}
                onViewMore={() => setDetailLead(row)}
                shortlisted
                shortlistTags={entry?.tags || []}
                onRemoveShortlist={() => handleRemoveShortlist(row)}
              />
            )
          })}
        </div>
      )}

      {detailLead && (
        <LeadDetailsModal
          lead={detailLead}
          headers={Object.keys(detailLead)}
          onClose={() => setDetailLead(null)}
        />
      )}
    </div>
  )
}

export default ShortlistedPage
