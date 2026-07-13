import 'dotenv/config'
import * as functions from 'firebase-functions'
import express from 'express'
import cors from 'cors'
import { google } from 'googleapis'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

initializeApp()
const db = getFirestore()
const shortlistCollection = db.collection('shortlist')

// Firestore document IDs can't contain "/", and lead keys are built from
// scraped company/role text that occasionally does (e.g. "UI/UX Designer") —
// base64url-encode so any lead key is a safe doc ID. The original key is
// also stored in the document body, so no decoding is needed on read.
function encodeDocId(key: string): string {
  return Buffer.from(key, 'utf-8').toString('base64url')
}

const app = express()
app.use(cors())
app.use(express.json())

const getGoogleAuth = () => {
  // For local emulator: load from .env.local and credentials file
  const serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH
  const sheetId = process.env.GOOGLE_SHEET_ID

  if (!sheetId) {
    throw new Error('GOOGLE_SHEET_ID environment variable is not set')
  }

  if (serviceAccountPath) {
    // Local development with file-based credentials
    return new google.auth.GoogleAuth({
      keyFile: serviceAccountPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })
  }

  // Production: Firebase handles credentials via default application credentials
  return new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })
}

app.get('/api/leads', async (req, res) => {
  try {
    const auth = getGoogleAuth()
    const sheets = google.sheets({ version: 'v4', auth })
    const sheetId = process.env.GOOGLE_SHEET_ID!

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Sheet1',
    })

    const [headers = [], ...rows] = result.data.values || []
    const leads = rows.map((row) =>
      Object.fromEntries(headers.map((h, i) => [h, row[i] || '']))
    )

    res.json(leads)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Failed to read sheet:', message)
    res.status(500).json({ error: message })
  }
})

// ── Shortlist (Firestore-backed — shared across everyone using the app) ────

app.get('/api/shortlist', async (req, res) => {
  try {
    const snapshot = await shortlistCollection.get()
    const data: Record<string, { tags: string[]; shortlistedAt: string }> = {}
    snapshot.forEach((doc) => {
      const d = doc.data()
      data[d.key] = { tags: d.tags || [], shortlistedAt: d.shortlistedAt }
    })
    res.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Failed to read shortlist:', message)
    res.status(500).json({ error: message })
  }
})

app.post('/api/shortlist', async (req, res) => {
  const { key, tags } = req.body || {}
  if (!key || typeof key !== 'string') {
    res.status(400).json({ error: 'key is required' })
    return
  }
  const entry = {
    key,
    tags: Array.isArray(tags)
      ? tags.filter((t): t is string => typeof t === 'string' && t.trim() !== '')
      : [],
    shortlistedAt: new Date().toISOString(),
  }
  try {
    await shortlistCollection.doc(encodeDocId(key)).set(entry)
    res.json({ tags: entry.tags, shortlistedAt: entry.shortlistedAt })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Failed to save shortlist entry:', message)
    res.status(500).json({ error: message })
  }
})

app.delete('/api/shortlist/:key', async (req, res) => {
  try {
    await shortlistCollection.doc(encodeDocId(req.params.key)).delete()
    res.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Failed to remove shortlist entry:', message)
    res.status(500).json({ error: message })
  }
})

export const leads = functions.https.onRequest(app)
