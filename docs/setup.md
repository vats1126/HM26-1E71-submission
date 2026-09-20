# Setup & Run Instructions

[← Back to README](../README.md)

> A reviewer should be able to clone the repository and run the Mysuru Janseva MVP locally in a few minutes when the live deployment is unavailable.

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | `20.x` or later |
| npm | `10.x` or later |
| Git | Any recent version |
| Modern browser | Chrome, Edge, Firefox or Safari |

The application is a **Next.js + TypeScript** project and uses **Supabase** for backend/database services.

---

## 1. Clone the Repository

```bash
git clone https://github.com/vats1126/HM26-1E71-submission.git
cd HM26-1E71-submission
```

---

## 2. Install Dependencies

Install the project dependencies:

```bash
npm install
```

The repository contains `package-lock.json`, so npm can reproduce the locked dependency tree.

---

## 3. Environment Variables

Create the local environment file.

### Windows PowerShell

```powershell
Copy-Item .env.example .env.local
```

### macOS / Linux

```bash
cp .env.example .env.local
```

Add the Supabase connection values to `.env.local`.

### Required variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://eoxwlcnehoacjnflninh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your Supabase anon or publishable key>
```

The real key should remain local and must **not** be committed to GitHub.

### Environment-variable purpose

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Connects the application to the Mysuru Janseva Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Client-side Supabase access using the project's public/anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | No for the current MVP flow | Only add this locally if a future server-side privileged operation explicitly requires it |

> **Security:** `.env.local` is ignored by Git. Never commit Supabase private/service credentials.

---

## 4. Supabase Backend

The MVP uses the existing Supabase project:

```text
https://eoxwlcnehoacjnflninh.supabase.co
```

### Backend services

| Service | Usage |
|---|---|
| PostgreSQL | Stores profiles, reports, evidence metadata, timelines and notifications |
| PostGIS | Supports geographic report/location functionality |
| Storage | Supports report evidence and cleanup evidence metadata/assets |
| Realtime | Supports live status/activity synchronization |
| Row Level Security | Provides database-level access controls |

### Database migrations

Database migrations are stored in:

```text
supabase/migrations/
```

The current project includes the foundation schema and RLS/profile setup used by the MVP.

A configured Supabase project should already have these migrations applied. If setting up a fresh compatible environment, apply the migrations using the Supabase CLI:

```bash
npx supabase db push --include-all --yes
```

The repository's Supabase configuration and migrations should be treated as the source of truth for the database structure.

---

## 5. Run the Development Server

Start the Next.js development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Windows PowerShell note

On some Windows systems, PowerShell may block `npm.ps1` because of the execution policy. In that case use:

```powershell
npm.cmd run dev
```

The same pattern can be used for other npm commands when necessary:

```powershell
npx.cmd tsc --noEmit
npm.cmd run build
```

---

## 6. First-Run Role Selection

Mysuru Janseva uses session-scoped role selection for the demo workflow.

On a new browser session:

```text
"Who are you?"
        ↓
Select a role
        ↓
Enter the application
```

Supported role tracks include:

```text
Citizen / Public
Municipal Officer / Operations
NGO / Community
```

A selected role remains active while navigating and refreshing within the same browser session.

To test the initial role selector again, use a new/incognito browser session or sign out.

### Sign-out behavior

```text
Sign out
   ↓
Active role cleared
   ↓
"Who are you?"
```

---

## 7. Recommended Demo Walkthrough

After opening the application, the following sequence demonstrates the core product flow.

### Citizen reporting

```text
Select Citizen
      ↓
Open Report
      ↓
Capture / choose location
      ↓
Add photo or video evidence
      ↓
Select issue category
      ↓
Enter description
      ↓
Review
      ↓
Submit
```

The resulting report should become available through the public report/map workflow.

### Operations flow

Switch to the **Municipal Officer** role:

```text
Dashboard
   ↓
Open report queue
   ↓
Claim a report
   ↓
Start cleanup
   ↓
Complete cleanup
   ↓
Add after-cleanup evidence
   ↓
Pending verification
```

### Independent verification

Use a separate verifier role/actor for the verification step.

```text
Pending Verification
        ↓
Independent Verifier
        ↓
Verify / Reject
        ↓
Public lifecycle updated
```

The system intentionally prevents the actor who performed the cleanup from independently verifying the same report.

### Bounty workflow

For an eligible unresolved public cleanup bounty:

```text
Bounty created
      ↓
NGO / Community claims
      ↓
Cleanup
      ↓
After-cleanup evidence
      ↓
Independent verification
```

---

## 8. Test the Public Report Lifecycle

A report page should expose the public-facing lifecycle and accountability information.

Check:

- Report status
- Location
- Category
- Evidence
- Assigned actor, where applicable
- Timeline
- SLA information
- Verification state
- Follow-up / reopen actions where applicable

The public view is designed so that **ownership remains with the reporting citizen**, while operational assignment belongs to the municipal/NGO actor.

---

## 9. Testing Location

The reporting workflow uses point-in-time location capture rather than continuous tracking.

The captured location may include:

```text
latitude
longitude
GPS accuracy
captured_at
```

### Browser test

Allow location access when prompted.

If the browser cannot obtain a usable GPS position, the application can expose supported fallback/manual/demo-location handling instead of silently treating an invented location as live GPS.

Do not interpret demo/manual coordinates as real current GPS data.

---

## 10. Testing Evidence Capture

The report wizard supports evidence capture/upload as part of the reporting flow.

Test:

1. Open `/report`.
2. Complete the location step.
3. Capture or upload a photo.
4. Optionally add video evidence where supported.
5. Continue to details.
6. Review the evidence before submitting.

For cleanup:

1. Open a claimed report.
2. Start cleanup.
3. Complete cleanup.
4. Add after-cleanup evidence.
5. Confirm that the report moves toward verification.

---

## 11. Testing Offline / Network Failure

The MVP contains local persistence/fallback behavior so supported reporting interactions can survive temporary backend/network problems.

### Browser test

1. Start the application:

```bash
npm run dev
```

2. Open:

```text
http://localhost:3000
```

3. Open Chrome/Edge DevTools.
4. Go to **Network**.
5. Set the connection to **Offline**.
6. Test supported client-side report interactions.
7. Restore the network.
8. Confirm that server-dependent operations can resume when connectivity returns.

### Important distinction

Offline support does **not** mean that the entire Supabase-backed civic platform operates independently of the server.

The following require connectivity:

- Reading fresh server-side updates
- Claiming reports
- Starting/completing server-side workflow transitions
- Verification
- Realtime updates
- Server-confirmed synchronization

Local persistence is primarily a resilience mechanism for supported client-side interactions.

---

## 12. API Health Check

The application exposes:

```text
GET /api/health
```

When running locally, open:

```text
http://localhost:3000/api/health
```

A correctly configured environment should report that the backend configuration is present and the Supabase connection is available.

This is the fastest way to distinguish a frontend issue from a backend configuration issue.

---

## 13. Production Build Verification

Before submitting or deploying, verify the application builds successfully:

```bash
npm run build
```

For the Windows PowerShell execution-policy case:

```powershell
npm.cmd run build
```

A successful production build confirms that the Next.js application can compile with the current code and configuration.

You can then start a production server:

```bash
npm start
```

Open:

```text
http://localhost:3000
```

If port `3000` is already occupied, use another port during local testing.

Example:

```bash
npx next start -p 3001
```

or on Windows PowerShell:

```powershell
npx.cmd next start -p 3001
```

Then open:

```text
http://localhost:3001
```

---

## 14. Troubleshooting

| Problem | Fix |
|---|---|
| `npm` is blocked by PowerShell | Use `npm.cmd run dev`, `npm.cmd run build`, etc. |
| Port `3000` is already in use | Run the app on another port such as `3001`. |
| Supabase connection error | Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`, then restart Next.js. |
| Environment variables are not detected | Stop and restart the development server after editing `.env.local`. |
| Blank/error page | Check the Next.js terminal output and browser console. |
| Role selector does not appear | Start a new browser/incognito session or sign out; the active role is session-scoped. |
| Location permission failed | Check browser location permissions and use the supported manual/fallback location flow. |
| Camera does not open | Grant camera permission or use the supported upload flow. |
| Live status is stale | Confirm the browser is online and the Supabase connection is configured. |
| Build fails | Run `npm run build` and fix the first reported error before rebuilding. |
| Database schema is missing | Apply the repository's Supabase migrations to the linked project. |
| Changes do not appear | Restart the development server and perform a hard refresh. |

---

## 15. Quick Start

For a reviewer who has the required Supabase credentials:

```bash
git clone https://github.com/vats1126/HM26-1E71-submission.git
cd HM26-1E71-submission
npm install
cp .env.example .env.local
```

Configure:

```env
NEXT_PUBLIC_SUPABASE_URL=https://eoxwlcnehoacjnflninh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your Supabase anon or publishable key>
```

Then:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

On Windows PowerShell, use:

```powershell
npm.cmd run dev
```

---

## 16. Project Structure

```text
HM26-1E71-submission/
├── app/                    # Next.js routes, pages and API route handlers
│   ├── api/                # Backend API endpoints
│   ├── report/             # Citizen reporting workflow
│   ├── dashboard/          # Operations dashboard
│   ├── transparency/       # Public accountability view
│   ├── leaderboard/        # Public participation view
│   ├── profile/            # User/profile view
│   └── welcome/            # Role/session selection
├── components/             # Reusable UI, map and app-shell components
├── lib/                    # Role state, services, models and utilities
├── supabase/               # Database migrations/configuration
├── docs/                   # Submission documentation
├── resource-templates/     # Submission resource templates
├── ai.md                   # AI usage and runtime boundary
├── README.md               # Project overview
├── package.json            # Dependencies and scripts
├── package-lock.json       # Locked dependency versions
└── .env.example            # Safe environment-variable template
```

---

## Supabase Configuration

| Property | Value |
|---|---|
| Provider | Supabase |
| Project URL | `https://eoxwlcnehoacjnflninh.supabase.co` |
| Database | Supabase PostgreSQL |
| Geospatial extension | PostGIS |
| Storage | Supabase Storage |
| Realtime | Supabase Realtime |
| Client access | Supabase public/anon key |
| Migrations | `supabase/migrations/` |
| Local secrets | `.env.local` |
| Service-role credentials | Not required for the normal current MVP flow; never commit them |

---

## Deployment

The project is connected to GitHub and is intended to deploy through Vercel.

```text
GitHub
   ↓
Vercel
   ↓
Next.js application
   ↓
Supabase
```

For production, configure the required environment variables in Vercel rather than committing credentials to the repository.

GitHub pushes to `main` are used as the deployment source for the connected Vercel project.

---

## Reviewer Verification Checklist

A reviewer can verify the core MVP by checking:

```text
[ ] Repository clones successfully
[ ] Dependencies install
[ ] Environment variables load
[ ] Next.js starts
[ ] "Who are you?" role selector appears in a new session
[ ] Citizen can open the report workflow
[ ] Location can be captured / handled
[ ] Evidence can be added
[ ] Report can be submitted
[ ] Report appears publicly
[ ] Officer can claim
[ ] Officer can start cleanup
[ ] Officer can complete cleanup with after evidence
[ ] Report enters pending verification
[ ] Independent verification works
[ ] Public lifecycle/timeline updates
[ ] Follow-up/reopen flow can be tested
[ ] Offline resilience can be tested
[ ] /api/health responds
[ ] Production build succeeds
```
