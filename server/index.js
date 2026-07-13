import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { google } from 'googleapis'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const PORT = process.env.PORT || 4000
const SHEET_ID = process.env.GOOGLE_SHEET_ID
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'credentials', 'service_account.json')
const SHORTLIST_PATH = path.join(__dirname, 'shortlist.json')

const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_PATH,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
})
const sheets = google.sheets({ version: 'v4', auth })

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/leads', async (req, res) => {
  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1',
    })
    const [headers = [], ...rows] = result.data.values || []
    const leads = rows.map((row) =>
      Object.fromEntries(headers.map((h, i) => [h, row[i] || '']))
    )
    res.json(leads)
  } catch (err) {
    console.error('Failed to read sheet:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ── Shortlist store (JSON file — small internal tool, no DB needed) ────────
// Shared across everyone using the app, keyed by "company::role" so it
// doesn't depend on sheet row numbers (which shift as rows are added).

function readShortlist() {
  try {
    return JSON.parse(fs.readFileSync(SHORTLIST_PATH, 'utf-8'))
  } catch {
    return {}
  }
}

function writeShortlist(data) {
  fs.writeFileSync(SHORTLIST_PATH, JSON.stringify(data, null, 2))
}

app.get('/api/shortlist', (req, res) => {
  res.json(readShortlist())
})

app.post('/api/shortlist', (req, res) => {
  const { key, tags } = req.body || {}
  if (!key || typeof key !== 'string') {
    return res.status(400).json({ error: 'key is required' })
  }
  const data = readShortlist()
  data[key] = {
    tags: Array.isArray(tags) ? tags.filter((t) => typeof t === 'string' && t.trim()) : [],
    shortlistedAt: new Date().toISOString(),
  }
  writeShortlist(data)
  res.json(data[key])
})

app.delete('/api/shortlist/:key', (req, res) => {
  const data = readShortlist()
  delete data[decodeURIComponent(req.params.key)]
  writeShortlist(data)
  res.json({ ok: true })
})

app.listen(PORT, () => {
  console.log(`Leads API running at http://localhost:${PORT}/api/leads`)
})
