# HackMysuru 1.0 — Phase 1 Submission Index

> **This is the landing file for your submission.** Reviewers open this file first.
> Every evaluation artifact is uploaded to **Google Drive** and linked below. No files in the repo, no other platforms.
> **Freeze: 20 September 2026, 23:59 IST.** Anything not linked here before the freeze does not exist for judging.

---

## 1. Team Details

| Field       | Value                                                  |
| ----------- | ------------------------------------------------------ |
| Team ID     | `HM26-1E71`                                            |
| Team Name   | `Bug Busters`                                          |
| College     | `Maharaja Institute of Technology Mysore`              |
| Team Leader | `Varun P` · `varunrao246@gmail.com` · `9108365820`     |
| Repository  | `https://github.com/vats1126/HM26-1E71-submission.git` |

|  # | Member              | Program & Year       | GitHub Handle       |
| -: | ------------------- | -------------------- | ------------------- |
|  1 | `Varun P` — Lead    | `B.E. CSE, 3rd Year` | `@varunrao246`      |
|  2 | `Vivek Urs G A`     | `B.E. CSE, 3rd Year` | `@vats1126`         |
|  3 | `Syed Naheed Ahmed` | `B.E. CSE, 3rd Year` | `@n4heed`           |
|  4 | `Vignesh Kumar M`   | `B.E. CSE, 3rd Year` | `@VigneshKumar2709` |

---

## 2. What We Built

**Sub-problem:** `Routing | Follow-through | Visibility | Verification`

**In one sentence:**

> **An offline-first civic grievance management platform that enables citizens to report local issues, routes complaints through the appropriate administrative workflow, helps staff track and resolve them, and provides citizens with visibility into the status and resolution of their complaints.**

### Core Workflow

**Citizen Report → Validation → Routing → Staff Action → Resolution → Citizen Visibility**

The platform is designed to address the gap between reporting a civic issue and ensuring that the issue is actually tracked through to resolution.

---

## 3. Repository Documents

| Document                                       | What it covers                                                                    |
| ---------------------------------------------- | --------------------------------------------------------------------------------- |
| [README.md](./README.md)                       | Project overview, problem statement, users, solution and setup                    |
| [ai.md](./ai.md)                               | AI tools used during development and AI/ML capabilities used in the product       |
| [docs/architecture.md](./docs/architecture.md) | System architecture, components, data flow, data model, APIs and technology stack |
| [docs/constraints.md](./docs/constraints.md)   | Approach to the major technical and operational constraints                       |
| [docs/setup.md](./docs/setup.md)               | Local installation, configuration, seed data and testing instructions             |
| [docs/limitations.md](./docs/limitations.md)   | Known limitations, edge cases and future improvements                             |
| [resource-templates/](./resource-templates/)   | Templates and guides for the video, decision log and presentation                 |

---

## 4. Submission Artifacts — Google Drive

|  # | Artifact                                                                              | Google Drive Link                                                                    | File Name                    | SHA-256 — First 16 Characters |
| -: | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------- | ----------------------------- |
|  1 | [Pitch + Code Walkthrough Video](./resource-templates/video-guide.md) — ≤ 10 min, MP4 | `https://drive.google.com/file/d/1HumxC8fk8K-4Qp_N2Bmoku-8l4hBD0NA/view?usp=sharing`                                                          | `<HM26-1E71_video.mp4`          | `6e9f2d3caa7e582660c8c1701efeb63538fb0ce94be874c77288d2309d90edd4`                   |
|  2 | [Decision Log](./resource-templates/decision-log-template.md) — 1 page, PDF           | `https://drive.google.com/file/d/1cUwGwFHDXj768JwydzTUckeXcGAiZAg6/view?usp=sharing` | `HM26-1E71_decision-log.pdf` | `0d66b58f6b79075e`            |
|  3 | [Presentation](./resource-templates/presentation-template.md) — ≤ 10 slides, PDF      | `https://drive.google.com/file/d/1npdG3AsbNua5uuvlIVwcbefRcp-luevk/view?usp=sharing` | `HM26-1E71_presentation.pdf` | `dc9e4072f3ca79ab`            |



### Video Chapters

| Timestamp | Section                                       |
| --------- | --------------------------------------------- |
| `00:00`   | Part 1: Problem & target users                |
| `00:40`   | Part 1: Live demo — core complaint flow       |
| `01:50`   | Part 1: Input validation & bad-input handling |
| `02:30`   | Part 1: Offline / airplane mode               |
| `03:00`   | Part 2: Architecture overview                 |
| `04:30`   | Part 2: Data model & APIs                     |
| `05:30`   | Part 2: Key code walkthrough                  |
| `07:30`   | Part 2: Decisions & trade-offs                |
| `08:30`   | Part 2: Scaling & limitations                 |
| `09:15`   | Part 2: AI usage — see [ai.md](./ai.md)       |

---

## 5. Live MVP

| Field                    | Value                                                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Live URL                 | `https://hm-26-1-e71-submission-1cn3.vercel.app/welcome`                                                         |
| Platform                 | `Web Application / PWA`                                                                                                               |
| Hosting                  | `Vercel`                                                                                                                              |
| Backend / Database       | `Supabase`                                                                                                                            |
| Test Login               | `Use the application's available demo/test authentication flow`                                                                       |
| Sample Data              | `Synthetic/demo data for demonstrating the civic complaint workflow`                                                                  |
| Offline Mode             | `Open the application, disconnect the network or enable airplane mode, create a complaint and verify the supported offline workflow.` |
| Detailed Offline Testing | See [docs/setup.md](./docs/setup.md#testing-offline-mode)                                                                             |
| If Live Link Is Down     | Follow [docs/setup.md](./docs/setup.md) to run the application locally                                                                |

---

## 6. Quick Reviewer Path — ≤ 3 Minutes

The following path demonstrates the core end-to-end workflow:

1. **Open the live MVP** and enter the citizen-facing application.
2. **Create a civic complaint** by selecting an issue category and providing the required details and location.
3. **Observe the complaint workflow**, including validation and routing.
4. **Open the staff/admin interface** and verify that the complaint appears in the appropriate workflow or queue.
5. **Update the complaint status** and verify that the updated status is reflected in the citizen-facing interface.

### Key Features to Observe

* Citizen complaint reporting
* Structured issue and location information
* Complaint validation
* Complaint routing
* Staff/admin workflow
* Complaint status tracking
* Resolution workflow
* Citizen visibility
* Offline-first capability
* Modular application architecture

---

## 7. Declaration

* [ ] All Google Drive links open in an incognito/private window with **Viewer** access and do not require access requests.
* [ ] The video is one continuous recording and is **≤ 10 minutes**, with Part 1 followed by Part 2.
* [ ] The decision log is one page and written by the team in our own words.
* [ ] All AI tools used during development and any AI/ML used inside the product are disclosed in [`ai.md`](./ai.md).
* [ ] No code specific to this challenge was written before **18 September 2026, 00:00 IST**.
* [ ] We will not modify or replace any linked submission artifact after **20 September 2026, 23:59 IST**.
* [ ] All SHA-256 values have been calculated from the final uploaded files.
* [ ] The final Drive links, filenames and hashes have been verified before submission.

---

**Submitted by:** `Varun P`
**Team:** `Bug Busters`
**Team ID:** `HM26-1E71`
**Date/Time (IST):** `20-09-2026`
