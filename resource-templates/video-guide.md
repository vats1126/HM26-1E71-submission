# Video Guide — Pitch + System Design (45% of score rides on this)

[← Back to README](../README.md)

> **Output:** One continuous MP4, **≤ 10:00**, named `<TeamID>_video.mp4`, uploaded to Google Drive ("Anyone with the link → Viewer") and linked in [`resource.md`](../resource.md).
> **Order:** Part 1 (Pitch, 2–3 min) → Part 2 (Code & System Design, 5–7 min). No separate files.
> The video is how judges score **Code & Architecture Walkthrough (25%)** and **Working Product (20%)**, since there's no live interview in Phase 1.

---

## Recording rules

| Rule | Detail |
|---|---|
| Continuous | One take or seamless screen capture. No jump-cuts that hide failures. Trimming dead air at start/end is fine. |
| Real software | Show the running product, not slides or Figma. Slides are allowed only for the architecture diagram. |
| Voices | Every team member should speak in at least one segment. It is the easiest authenticity signal you can give. |
| Face cam | Recommended (small corner overlay). |
| Quality | 1080p preferred (720p minimum), readable IDE font (≥ 16 pt / zoom 125%), clear audio with no music under speech. |
| Language | English. Kannada is fine for in-app content; explain it in English. |
| Tools | OBS Studio, Loom, Zoom local recording, or built-in OS screen recorder. |
| Upload early | Upload by 20 Sept 20:00 IST. Drive needs time to process large videos before previews play. |

---

## Part 1 — Product Pitch (2:00–3:00)

| Time | Segment | Must show / say |
|---|---|---|
| 0:00–0:20 | **Hook & problem** | Team name, chosen sub-problem, one concrete Mysuru scenario |
| 0:20–0:40 | **Who it's for** | Primary user(s) and their constraints (device, network, knowledge of jurisdiction) |
| 0:40–1:50 | **Live core flow** | End-to-end on the running app: create → system decision (route/score/group/detect) → staff action → citizen sees result |
| 1:50–2:30 | **Bad-input test** (see [`docs/constraints.md`](../docs/constraints.md)) | Submit at least one: duplicate report, wrong/impossible location, unrelated or fake photo, abusive text. Show what the system *actually* does. |
| 2:30–3:00 | **Offline test** | Turn on airplane mode / DevTools Offline *on camera*, perform the core action, reconnect, show sync |

> The problem statement says judges will test bad input and airplane mode live. In Phase 1 the video *is* your live demo, so these two segments are **mandatory**.

## Part 2 — Code & System Design (5:00–7:00)

| Time | Segment | Must show / say |
|---|---|---|
| 3:00–4:30 | **Architecture** | Walk the diagram from [`docs/architecture.md`](../docs/architecture.md): clients, API, data store, services, external data. Trace one request end-to-end. |
| 4:30–5:30 | **Data model & APIs** | Open the schema / models file. Explain key entities and relationships and 2–3 important endpoints. |
| 5:30–7:30 | **Core logic in the IDE** | Open the file that holds your "brain" (routing rules, trust scoring, dedup/hotspot clustering, detection model, sync logic). Explain it line-by-line where it matters. |
| 7:30–8:30 | **Decisions & trade-offs** | The approach you chose, the one you rejected, and the cost you accepted. Must match the [Decision Log](./decision-log-template.md). |
| 8:30–9:15 | **Scale & limits** | What breaks at full-city scale and how you'd fix it; known gaps |
| 9:15–10:00 | **AI usage & ownership** | Walk through your [`ai.md`](../ai.md): tools used and where, plus any AI/ML inside the product. Open one AI-assisted file and explain what you changed or verified. |

### What reviewers listen for in Part 2

- **"Why"**, not just "what": *"We used a geohash bucket instead of scanning all complaints because…"*
- **Honest failure modes**: *"This breaks if two wards share a street name."*
- **Ownership**: the speaker can navigate the code without hunting for files.
- **Consistency** between video, [README](../README.md), [`docs/`](../docs/architecture.md), [`ai.md`](../ai.md), [Decision Log](./decision-log-template.md), and [slides](./presentation-template.md).

### Red flags that cost points

- Reading a script word-for-word over slides.
- Demo shows features that aren't in the repo.
- Cuts right before a failure.
- "The AI wrote this part, we're not sure how it works."
- AI tools shown or mentioned in the video that are missing from [`ai.md`](../ai.md).
- Going over 10:00. Reviewers may stop watching at the limit.

---

## Pre-upload checklist

- [ ] Duration ≤ 10:00, Part 1 before Part 2.
- [ ] Bad-input and offline segments included.
- [ ] Every member speaks.
- [ ] Drive link opens in incognito and plays.
- [ ] AI tools mentioned in the video match [`ai.md`](../ai.md).
- [ ] Chapter timestamps copied into [`resource.md`](../resource.md).
- [ ] SHA-256 hash recorded in [`resource.md`](../resource.md).
