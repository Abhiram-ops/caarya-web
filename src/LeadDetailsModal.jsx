import { isEmpty } from './leadHelpers'

function LeadDetailsModal({ lead, headers, onClose }) {
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

export default LeadDetailsModal
