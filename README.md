# `<Project Name>` — `<one-line tagline>`

> HackMysuru 1.0 · Phase 1 · Civic Governance & Clean Mysuru
> Team `<Team Name>` (`<Team ID>`)

| 📎 Submission links | 📋 Templates | 🏗️ Architecture | 🛡️ Hard constraints | ⚙️ Setup | 🤖 AI usage | ⚠️ Limitations |
|---|---|---|---|---|---|---|
| [resource.md](./resource.md) | [resource-templates/](./resource-templates/) | [docs/architecture.md](./docs/architecture.md) | [docs/constraints.md](./docs/constraints.md) | [docs/setup.md](./docs/setup.md) | [ai.md](./ai.md) | [docs/limitations.md](./docs/limitations.md) |

<!--
This README is the overview. Detailed content lives in the linked files so each stays short.
Keep the section ORDER below. Reviewers look for each section in the same place in every repo.
-->

---

## 1. Problem Understanding

<!-- Which sub-problem did you pick and WHY that one? 5–8 sentences. -->

**Chosen sub-problem:** `<e.g. Routing>`

- **The gap we saw:** `<What actually goes wrong today, in Mysuru terms>`
- **Why it matters:** `<Consequence: delay, bounced complaints, lost trust, health risk>`
- **Why we chose this over the others:** `<Your reasoning>`
- **What "solved" looks like for us:** `<A measurable outcome, e.g. "a citizen never has to pick an office">`

## 2. Target Users & Mysuru Context

| User | Their situation | What they need from us |
|---|---|---|
| `<Resident in a ward at the MCC–panchayat edge>` | `<No idea which office owns the drain; patchy 4G>` | `<Report once, see who owns it, see status>` |
| `<Panchayat / MCC officer>` | `<...>` | `<...>` |
| `<Sanitation / field worker>` | `<Basic Android phone, low data>` | `<...>` |

**Local context we designed for:** `<jurisdiction overlap, connectivity, Kannada/English, device types, literacy>`

## 3. Solution Overview

<!-- Plain language. A non-engineer should follow this. -->

`<2–4 sentence summary>`

**Core flow:**
1. `<Citizen does X>`
2. `<System does Y>`
3. `<Staff does Z>`
4. `<Citizen sees outcome>`

**Screenshots:** `<2–4 images under docs/images/, each < 1 MB>`

## 4. Architecture

`<One-sentence summary, e.g. "Offline-first PWA → REST API → PostgreSQL/PostGIS, with a rules-based routing service.">`

➡️ Diagram, components, data model and APIs: **[docs/architecture.md](./docs/architecture.md)**

## 5. Tech Stack & AI Usage

**Stack:** `<React PWA · FastAPI · PostgreSQL + PostGIS · Render>` (full rationale in [docs/architecture.md](./docs/architecture.md#tech-stack))

**AI tools used in development:** `<ChatGPT, Copilot, ...>`
**AI inside the product:** `<e.g. YOLOv8 for bin detection / none>`

➡️ Full disclosure: **[ai.md](./ai.md)**

## 6. Decision Log (Summary)

<!-- The full 1-page Decision Log is a PDF on Google Drive, linked in resource.md. ≤ 3 lines here. -->

- **Chose:** `<approach>`, **over:** `<rejected alternative>`
- **Because:** `<the trade-off in one line>`
- **First thing to break at city scale:** `<one line>`

➡️ Full decision log: **[resource.md](./resource.md#4-submission-artifacts-google-drive)** · Template: **[decision-log-template.md](./resource-templates/decision-log-template.md)**

## 7. Setup & Run

```bash
git clone <repo-url> && cd <repo>
<one-line install> && <one-line run>
```

➡️ Prerequisites, environment variables, seed data and offline testing: **[docs/setup.md](./docs/setup.md)**

## 8. Known Limitations

- `<Top limitation 1>`
- `<Top limitation 2>`
- `<Top limitation 3>`

➡️ Full list, edge cases and scaling roadmap: **[docs/limitations.md](./docs/limitations.md)**

---

## Team

| Name | Role | GitHub |
|---|---|---|
| `<...>` | `<...>` | `@<...>` |

## License

`<MIT / Apache-2.0 / None>`. You retain full ownership of your code.
