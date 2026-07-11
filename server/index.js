import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { google } from 'googleapis'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const PORT = process.env.PORT || 4000
const SHEET_ID = process.env.GOOGLE_SHEET_ID
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'credentials', 'service_account.json')

const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_PATH,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
})
const sheets = google.sheets({ version: 'v4', auth })

const app = express()
app.use(cors())

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

app.listen(PORT, () => {
  console.log(`Leads API running at http://localhost:${PORT}/api/leads`)
})
