import { useEffect, useState } from 'react'
import './LeadsTable.css'

const SHEET_ID = import.meta.env.VITE_SHEET_ID
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`

// Minimal RFC4180-ish CSV parser: handles quoted fields, escaped quotes, and commas/newlines inside quotes.
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += c
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''))
}

function LeadsTable({ onLogout }) {
  const [headers, setHeaders] = useState([])
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!SHEET_ID) {
      setError('VITE_SHEET_ID is not set — see .env.example.')
      setLoading(false)
      return
    }
    fetch(CSV_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Sheet fetch failed (${res.status})`)
        return res.text()
      })
      .then((text) => {
        const parsed = parseCsv(text)
        if (parsed.length === 0) {
          setHeaders([])
          setRows([])
        } else {
          setHeaders(parsed[0])
          setRows(parsed.slice(1))
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="leads-page">
      <header className="leads-header">
        <h1>Scraped Leads</h1>
        <button className="logout-btn" onClick={onLogout}>
          Log out
        </button>
      </header>

      {loading && <p className="status-msg">Loading leads…</p>}

      {error && (
        <p className="status-msg error">
          Couldn't load the sheet: {error}
          <br />
          Make sure the Master Sheet is shared as "Anyone with the link can view".
        </p>
      )}

      {!loading && !error && rows.length === 0 && (
        <p className="status-msg">No leads found yet.</p>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="table-scroll">
          <table className="leads-table">
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => {
                    const header = headers[j]
                    if (header === 'Apply Link' && cell) {
                      return (
                        <td key={j}>
                          <a href={cell} target="_blank" rel="noreferrer">
                            Apply
                          </a>
                        </td>
                      )
                    }
                    if (header === 'Status' && cell) {
                      return (
                        <td key={j}>
                          <span className={`status-badge status-${cell.toLowerCase().replace(/\s+/g, '-')}`}>
                            {cell}
                          </span>
                        </td>
                      )
                    }
                    return <td key={j}>{cell}</td>
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
