import 'dotenv/config'
import * as functions from 'firebase-functions'
import express from 'express'
import cors from 'cors'
import { google } from 'googleapis'

const app = express()
app.use(cors())

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

export const leads = functions.https.onRequest(app)
