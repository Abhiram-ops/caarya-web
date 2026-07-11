# Caarya Web

React frontend for the Caarya Lead Finder tool. Login-gated leads table backed
by a small local API that reads the Master Sheet with a service account (so
the sheet can stay private — no credentials ever reach the browser).

## Setup

**1. Frontend**
```
npm install
npm run dev
```

**2. Backend (separate terminal)**
```
cd server
npm install
```
Copy your Google service account JSON to `server/credentials/service_account.json`,
and copy `server/.env.example` to `server/.env` with your `GOOGLE_SHEET_ID`.
```
npm start
```

The frontend expects the API at `http://localhost:4000/api/leads` by default
(override with `VITE_API_URL` in a frontend `.env`).

## Login

Username: `admin` · Password: `caarya`
