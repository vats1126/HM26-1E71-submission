# Setup & Run Instructions

[← Back to README](../README.md)

<!-- A reviewer should get this running in under 10 minutes if the live link is down. -->

## Prerequisites

| Tool | Version |
|---|---|
| `<Node.js / Python / Docker>` | `<20.x / 3.11 / 24+>` |

## 1. Clone

```bash
git clone <repo-url>
cd <repo>
```

## 2. Environment Variables

```bash
cp .env.example .env
```

| Variable | Required | Example | Purpose |
|---|---|---|---|
| `DATABASE_URL` | Yes | `<...>` | `<...>` |
| `<API_KEY>` | `<No>` | `<...>` | `<...>` |

> Never commit real secrets. Commit only `.env.example`.

## 3. Install & Seed Demo Data

```bash
<install command>
<migration command>
<seed command>          # loads <N> sample complaints across <N> wards
```

## 4. Run

```bash
<run command>
```

Open `http://localhost:<port>`. Test accounts are listed in [resource.md](../resource.md#5-live-mvp).

## Testing Offline Mode

1. `<Open the app and log in>`
2. `<Chrome DevTools → Network → Offline, or phone airplane mode>`
3. `<File a complaint → it shows "queued">`
4. `<Go back online → it syncs and shows "submitted">`

## Troubleshooting

| Problem | Fix |
|---|---|
| `<Port already in use>` | `<...>` |
