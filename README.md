# Caarya Web

React frontend for the Caarya Lead Finder tool. Login-gated leads table backed
by Firebase Cloud Functions that reads the Master Sheet with a service account (so
the sheet can stay private — no credentials ever reach the browser).

Deployable to **Firebase Hosting** (frontend) + **Cloud Functions** (backend).

## Local Development

### Prerequisites

- Node.js 20+
- Firebase CLI: `npm install -g firebase-tools`
- Google service account JSON (saved locally in `functions/credentials/service_account.json`)

### Setup

**1. Install dependencies**
```bash
npm install
cd functions && npm install && cd ..
```

**2. Set up credentials**
- Copy your Google service account JSON to `functions/credentials/service_account.json`
- Copy `functions/.env.example` to `functions/.env.local`:
  ```
  GOOGLE_SHEET_ID=your_sheet_id_here
  GOOGLE_SERVICE_ACCOUNT_PATH=credentials/service_account.json
  ```

**3. Run with emulator**

Build and run everything on Firebase emulator:
```bash
npm run dev
```

This command:
- Builds the frontend (Vite) to `dist/`
- Builds the backend (TypeScript) to `functions/dist/`
- Starts Firebase emulators for both Hosting and Functions

The emulator will output URLs for:
- **Hosting**: http://localhost:5000 (serves frontend with `/api/**` rewrites to Functions)
- **Functions**: http://localhost:5001

Frontend loads at `http://localhost:5000`, calls `/api/leads` which is rewritten to the Functions emulator.

**Alternative: Frontend-only development** (hot reload)

If you want to develop just the frontend with hot module reloading while the backend is running:
```bash
# Terminal 1: Start backend emulator
firebase emulators:start --only functions --project=demo

# Terminal 2: Start frontend dev server with HMR
npm run dev:frontend
# Then set VITE_API_URL=http://localhost:5001/caarya-web/us-central1/leads
```

### Production Deployment

Set up Firebase secrets on your project:
```bash
firebase functions:secrets:set GOOGLE_SHEET_ID --project=<your-project-id>
firebase functions:secrets:set GOOGLE_SERVICE_ACCOUNT_JSON --project=<your-project-id>
```

Then deploy:
```bash
npm run build
firebase deploy --project=<your-project-id>
```

## Login

Username: `admin` · Password: `caarya`
