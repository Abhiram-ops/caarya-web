const LEADS_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/leads'
const SHORTLIST_API_URL = LEADS_API_URL.replace(/\/leads$/, '/shortlist')

export async function fetchShortlist() {
  const res = await fetch(SHORTLIST_API_URL)
  if (!res.ok) throw new Error(`Shortlist request failed (${res.status})`)
  return res.json()
}

export async function addToShortlist(key, tags) {
  const res = await fetch(SHORTLIST_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, tags }),
  })
  if (!res.ok) throw new Error(`Failed to shortlist (${res.status})`)
  return res.json()
}

export async function removeFromShortlist(key) {
  const res = await fetch(`${SHORTLIST_API_URL}/${encodeURIComponent(key)}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error(`Failed to remove from shortlist (${res.status})`)
  return res.json()
}
