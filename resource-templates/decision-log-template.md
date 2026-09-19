# Decision Log — Template (25% of total score)

[← Back to README](../README.md)

> **Output:** 1-page PDF, A4, ≥ 10 pt font, named `<TeamID>_decision-log.pdf`, uploaded to Google Drive and linked in [`resource.md`](../resource.md).
> **Length:** 400–550 words. If it spills onto page 2, cut. Reviewers stop at page 1.
> **Voice:** Your own words, first person plural ("we"). No marketing. No generic AI prose.
> Delete everything in *italics* and all blockquotes before exporting.

---

**Team:** `<Team Name>` (`<Team ID>`)  **Sub-problem:** `<e.g. Verification>`  **Date:** `20 Sept 2026`

## Q1. What approach did we take, and what did we reject? (~150 words)

**Our approach:** `<Name it in one line, e.g. "Trust score = weighted blend of duplicate-proximity, photo EXIF/location consistency and reporter history, with a human-review band between 0.4 and 0.7.">`

*How it works in 3–4 sentences: inputs → logic → output. Mention the specific data you used.*

**Alternative we considered and rejected:** `<e.g. "Mandatory OTP-verified identity for every report.">`

*What it is in 1–2 sentences, and why it looked attractive at first.*

## Q2. Why did we reject it? The trade-off (~150 words)

| Dimension | Our approach | Rejected alternative |
|---|---|---|
| `<e.g. Honest reporting / anonymity>` | `<...>` | `<...>` |
| `<e.g. Spam resistance>` | `<...>` | `<...>` |
| `<e.g. Works offline / low-end phones>` | `<...>` | `<...>` |
| `<e.g. Build effort in 72 h>` | `<...>` | `<...>` |

*In 2–3 sentences: which dimension decided it, and what we consciously gave up by choosing our approach. Name the cost.*

> A strong answer names a **cost** you accepted, e.g. "We accept that a coordinated group of real phones can still game the score." A weak answer lists only benefits.

## Q3. What breaks at the scale of all of Mysuru? (~150 words)

*Assume ~65 wards plus surrounding town and gram panchayats, thousands of reports a day, festival spikes (Dasara), and patchy connectivity.*

| What breaks first | Why (with a rough number) | How we'd fix it |
|---|---|---|
| `<e.g. Duplicate check is O(n) over all open complaints>` | `<~50k open items → seconds per insert>` | `<Geospatial index / geohash bucketing>` |
| `<e.g. Offline sync conflicts>` | `<...>` | `<...>` |
| `<e.g. Human review queue>` | `<...>` | `<...>` |

*One closing line: the single change we would make first, and why.*

---

### Self-check before exporting

- [ ] Exactly one approach and one clearly rejected alternative named.
- [ ] At least one cost or downside of **our** approach is admitted.
- [ ] Q3 contains at least one concrete number or estimate.
- [ ] Every team member can explain this page without notes.
