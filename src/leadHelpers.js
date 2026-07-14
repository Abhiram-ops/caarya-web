// Small pieces shared between the leads table/cards and the shortlisted page.

export const IMPORTANT_FIELDS = [
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
export const isEmpty = (v) => EMPTY.has((v ?? '').toString().trim().toLowerCase())

// ── Opportunity scoring (0–100) ────────────────────────────────────────────
// Mirror of the scraper's score_opportunity() in
// Caarya/caarya/opportunity_finder.py — keep the two in sync. Prefer a stored
// Score if the scraper already computed one; otherwise compute from the fields
// so existing (pre-scoring) rows still show a score.

const BLANK = new Set(['', 'not stated', 'none stated', 'n/a', 'na', 'unknown', 'none'])
const GROWTH_KW = ['growth', 'ownership', 'lead the', 'conversion', 'grow into',
  'career path', 'mentorship', 'mentor', 'promotion', 'take ownership']
const PERK_KW = ['real client', 'live project', 'flexible', 'paid leave', 'networking',
  'stipend increment', 'work from home', 'wfh', 'incentive', 'bonus', 'swag', 'goodies']
const FUNDING_KW = ['funded', 'funding', 'backed', 'raised', 'venture', 'vc-backed',
  'yc-backed', 'y combinator', 'seed', 'series a', 'series b']

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const kwHit = (text, kws) => kws.some((k) => new RegExp('\\b' + escapeRe(k) + '\\b').test(text))
const kwCount = (text, kws) => kws.filter((k) => new RegExp('\\b' + escapeRe(k) + '\\b').test(text)).length

export function stipendAmount(compensation) {
  const text = compensation || ''
  let m = text.match(/₹\s*([\d,]+)/)
  if (m) return parseInt(m[1].replace(/,/g, ''), 10)
  m = text.match(/(\d[\d,]{2,})/)
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0
}

export function durationMonths(duration) {
  const m = (duration || '').toLowerCase().match(/(\d+(?:\.\d+)?)\s*(month|week|day|year)/)
  if (!m) return 0
  const n = parseFloat(m[1])
  return { month: n, week: n / 4.345, day: n / 30, year: n * 12 }[m[2]]
}

export function scoreOpportunity(lead) {
  const stored = parseInt(lead.Score, 10)
  if (!Number.isNaN(stored)) return Math.max(0, Math.min(stored, 100))

  const text = ['Role Title', 'Role Description', 'Skills Required', 'Compensation',
    'Perks', 'Company Info', 'Growth Trajectory', 'Deliverables', 'Role Level']
    .map((f) => lead[f] || '').join(' ').toLowerCase()

  let total = 0

  const amt = stipendAmount(lead['Compensation'])
  total += amt >= 25000 ? 30 : amt >= 15000 ? 27 : amt >= 10000 ? 22 : amt >= 7500 ? 15 : 0

  const mo = durationMonths(lead['Duration'])
  total += mo >= 6 ? 10 : mo >= 5 ? 9 : mo >= 3 ? 7 : mo >= 1 ? 4 : 0

  let cred = 0
  if (kwHit(text, ['certificate'])) cred += 4
  if (kwHit(text, ['letter of recommendation', 'lor'])) cred += 4
  if (kwHit(text, ['ppo', 'pre-placement', 'full-time offer', 'experience letter', 'job offer', 'placement'])) cred += 7
  total += Math.min(cred, 15)

  const gf = (lead['Growth Trajectory'] || '').trim().toLowerCase()
  let g = gf && !BLANK.has(gf) ? 6 : 0
  if (kwHit(text, GROWTH_KW)) g += 4
  total += Math.min(g, 10)

  total += Math.min(kwCount(text, PERK_KW) * 3, 10)

  const nSkills = (lead['Skills Required'] || '').split(/[,;]/).filter((s) => s.trim()).length
  total += nSkills >= 5 ? 10 : nSkills >= 3 ? 6 : nSkills >= 1 ? 3 : 0

  const cinfo = (lead['Company Info'] || '').trim()
  let c = !BLANK.has(cinfo.toLowerCase()) ? Math.min(Math.floor(cinfo.length / 60), 8) : 0
  if (kwHit(text, FUNDING_KW)) c += 4
  if (/\b(19|20)\d{2}\b/.test((lead['Founded Year'] || '') + ' ' + cinfo)) c += 3
  total += Math.min(c, 15)

  return Math.min(total, 100)
}

// Label + tier (for badge colour) from a numeric score.
export function scoreTier(score) {
  if (score >= 70) return 'high'
  if (score >= 40) return 'mid'
  return 'low'
}
