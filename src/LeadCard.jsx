import { useState } from 'react'
import { isEmpty } from './leadHelpers'
import { StatusBadge, ApplyLink } from './LeadBits'

function ShortlistModal({ onSave, onClose }) {
  const [tags, setTags] = useState([])
  const [draft, setDraft] = useState('')

  const addTag = () => {
    const t = draft.trim()
    if (t && !tags.includes(t)) setTags([...tags, t])
    setDraft('')
  }

  const removeTag = (t) => setTags(tags.filter((x) => x !== t))

  return (
    <div className="lead-modal-overlay" onClick={onClose}>
      <div className="lead-modal shortlist-modal" onClick={(e) => e.stopPropagation()}>
        <div className="lead-modal-head">
          <h2>Why is this shortlisted?</h2>
          <button className="lead-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="shortlist-modal-body">
          <p className="shortlist-modal-hint">
            Add a few short tags explaining the reason (e.g. "High stipend", "Remote",
            "Reputed company"). Press Enter or comma to add.
          </p>
          <div className="tag-input-row">
            <input
              type="text"
              value={draft}
              placeholder="Type a reason…"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault()
                  addTag()
                }
              }}
            />
            <button type="button" onClick={addTag}>
              Add
            </button>
          </div>
          {tags.length > 0 && (
            <div className="tag-chip-row">
              {tags.map((t) => (
                <span className="tag-chip" key={t}>
                  {t}
                  <button
                    type="button"
                    aria-label={`Remove ${t}`}
                    onClick={() => removeTag(t)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="shortlist-modal-actions">
            <button className="view-more-btn" onClick={onClose}>
              Cancel
            </button>
            <button className="shortlist-btn shortlist-btn-solid" onClick={() => onSave(tags)}>
              Save shortlist
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function LeadCard({
  lead,
  onOpenCarousel,
  onViewMore,
  shortlisted = false,
  shortlistTags = [],
  onShortlist,
  onRemoveShortlist,
}) {
  const [modalOpen, setModalOpen] = useState(false)

  const location = [lead['Location'], lead['Work Mode']]
    .filter((v) => !isEmpty(v))
    .join(' · ')

  return (
    <div className="lead-card">
      <div onClick={onOpenCarousel} className="lead-card-clickable">
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

      {shortlisted && shortlistTags.length > 0 && (
        <div className="tag-chip-row shortlist-reason-tags">
          {shortlistTags.map((t) => (
            <span className="tag-chip tag-chip-static" key={t}>
              {t}
            </span>
          ))}
        </div>
      )}

      {shortlisted ? (
        <button
          className="shortlist-btn shortlist-btn-active"
          onClick={(e) => {
            e.stopPropagation()
            onRemoveShortlist()
          }}
        >
          ★ Shortlisted — remove
        </button>
      ) : (
        <button
          className="shortlist-btn"
          onClick={(e) => {
            e.stopPropagation()
            setModalOpen(true)
          }}
        >
          ☆ Shortlist
        </button>
      )}

      {modalOpen && (
        <ShortlistModal
          onClose={() => setModalOpen(false)}
          onSave={(tags) => {
            setModalOpen(false)
            onShortlist(tags)
          }}
        />
      )}
    </div>
  )
}

export default LeadCard
