# Setup & Run Instructions

[← Back to README](../README.md)

> A reviewer should be able to get the application running locally in under 10 minutes if the live deployment is unavailable.

## Prerequisites

| Tool           | Version                           |
| -------------- | --------------------------------- |
| Node.js        | `20.x or later`                   |
| npm            | `10.x or later`                   |
| Git            | `Any recent version`              |
| Modern browser | `Chrome, Edge, Firefox or Safari` |

---

## 1. Clone the Repository

```bash
git clone https://github.com/vats1126/HM26-1E71-submission.git
cd HM26-1E71-submission
```

---

## 2. Environment Variables

Create the local environment file:

```bash
cp .env.example .env.local
```

Configure the Supabase connection in `.env.local`.

### Supabase Project

**Supabase URL:**

```text
https://eoxwlcnehoacjnflninh.supabase.co
```

| Variable                        | Required    | Value / Example                            | Purpose                           |
| ------------------------------- | ----------- | ------------------------------------------ | --------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes         | `https://eoxwlcnehoacjnflninh.supabase.co` | Supabase project URL              |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes         | `<your Supabase anon/publishable key>`     | Client-side Supabase access       |
| `SUPABASE_SERVICE_ROLE_KEY`     | If required | `<your service-role key>`                  | Server-side privileged operations |

> **Security:** Never commit the Supabase service-role key or other private credentials to GitHub. Use `.env.local` for local secrets. Only safe placeholder values should be included in `.env.example`.

---

## 3. Install Dependencies

Install all project dependencies:

```bash
npm install
```

The repository includes `package-lock.json`, so npm will use the locked dependency versions where applicable.

---

## 4. Supabase Setup

The application uses **Supabase** for backend/database functionality.

Supabase project:

```text
https://eoxwlcnehoacjnflninh.supabase.co
```

For a configured project:

1. Add the Supabase URL to `.env.local`.
2. Add the Supabase anon/publishable key to `.env.local`.
3. Add any server-side key required by the application locally.
4. Ensure the required database tables/configuration are available in the Supabase project.
5. Do not commit private credentials.

Database-related project files are available under:

```text
supabase/
```

---

## 5. Run the Application

Start the Next.js development server:

```bash
npm run dev
```

Open the application at:

```text
http://localhost:3000
```

---

## 6. Verify the Production Build

Run:

```bash
npm run build
```

If the build completes successfully, start the production server:

```bash
npm start
```

Then open:

```text
http://localhost:3000
```

---

## 7. Testing Offline Mode

The application is designed to support an offline-first workflow for supported interactions.

### Browser Test

1. Start the application:

```bash
npm run dev
```

2. Open:

```text
http://localhost:3000
```

3. Open **Chrome DevTools**.
4. Go to **Network**.
5. Set network throttling to **Offline**.
6. Use the supported complaint/reporting workflow.
7. Continue using the supported offline functionality.
8. Restore the network connection.
9. Verify that connectivity-dependent synchronization/server operations can resume.

### Mobile Test

1. Open the application in a mobile browser.
2. Load the application while connected to the internet.
3. Enable **Airplane Mode**.
4. Test the supported offline workflow.
5. Disable Airplane Mode.
6. Restore connectivity and verify synchronization/reconnection behavior.

> Features requiring live communication with Supabase or another server cannot complete while completely offline.

---

## 8. Troubleshooting

| Problem                    | Fix                                                                                                        |
| -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Port `3000` already in use | Run `npm run dev -- -p 3001` and open `http://localhost:3001`.                                             |
| `npm install` fails        | Check the Node.js/npm versions and run `npm install` again.                                                |
| Environment variable error | Verify `.env.local` contains the variables defined in `.env.example`, then restart the development server. |
| Supabase connection error  | Verify the Supabase URL and anon/publishable key and confirm that the Supabase project is accessible.      |
| Blank/error page           | Check the terminal running Next.js and the browser console for the reported error.                         |
| Changes are not appearing  | Restart the development server and perform a browser hard refresh.                                         |
| Build fails                | Run `npm run build` and fix the first reported error before rebuilding.                                    |

---

## 9. Quick Start

For a reviewer with the required Supabase credentials:

```bash
git clone https://github.com/vats1126/HM26-1E71-submission.git
cd HM26-1E71-submission
cp .env.example .env.local
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

## 10. Project Structure

```text
HM26-1E71-submission/
├── app/                  # Next.js application routes and pages
├── components/           # Reusable UI components
├── lib/                  # Application logic, services and utilities
├── src/                  # Supporting source code
├── supabase/             # Supabase/database configuration
├── docs/                 # Project documentation
├── resource-templates/   # Submission resources and templates
├── ai.md                 # AI usage documentation
├── README.md             # Project overview
├── package.json          # Dependencies and npm scripts
├── package-lock.json     # Locked dependency versions
└── .env.example          # Environment variable template
```

---

## Supabase Configuration

| Property      | Value                                            |
| ------------- | ------------------------------------------------ |
| Provider      | Supabase                                         |
| Project URL   | `https://eoxwlcnehoacjnflninh.supabase.co`       |
| Database      | Supabase PostgreSQL                              |
| Client access | Supabase client configuration                    |
| Secrets       | Stored locally in `.env.local` and not committed |
