import { isEmpty } from './leadHelpers'

export function StatusBadge({ status }) {
  if (!status) return null
  return (
    <span className={`status-badge status-${status.toLowerCase().replace(/\s+/g, '-')}`}>
      {status}
    </span>
  )
}

export function ApplyLink({ href }) {
  if (isEmpty(href)) return <span className="muted">—</span>
  return (
    <a href={href} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
      Apply
    </a>
  )
}
