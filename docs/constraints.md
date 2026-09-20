# The Five Hard Constraints

[← Back to README](../README.md)

<!-- The problem statement names five constraints that decide whether a solution would hold up
in Mysuru. Be honest: ✅ handled · ⚠️ partial · ❌ not yet. Timestamps point to the video. -->

| # | Constraint | Status | Video |
|---|---|---|---|
| 1 | Fake, spam and harassment reports | `<✅/⚠️/❌>` | `<mm:ss>` |
| 2 | Unclear jurisdiction | `<...>` | `<...>` |
| 3 | Prioritisation beyond "most votes" | `<...>` | `<...>` |
| 4 | Bad input (duplicate, fake photo, wrong location, abuse) | `<...>` | `<...>` |
| 5 | Works without internet | `<...>` | `<...>` |

---

## 1. Fake, spam and harassment reports

- **Approach:** `<signals used, thresholds, human review?>`
- **Anonymity trade-off:** `<how you keep honest anonymous reports while limiting abuse>`
- **Code:** `src/<...>`

## 2. Unclear jurisdiction

- **Approach:** `<boundary data, buffer zones, confidence score, shared queue, escalation>`
- **What happens in a boundary case:** `<...>`
- **Code:** `src/<...>`

## 3. Prioritisation

- **Formula / rules:** `<e.g. severity × sensitive-location weight × unique reporters × age>`
- **Why not simply "most votes":** `<...>`
- **Code:** `src/<...>`

## 4. Bad input

| Input | What our system does |
|---|---|
| Duplicate report | `<...>` |
| Fake / unrelated photo | `<...>` |
| Wrong or impossible location | `<...>` |
| Abusive message | `<...>` |
| `<Anything else you tested>` | `<...>` |

## 5. Offline operation

- **What works offline:** `<...>`
- **How it syncs:** `<queue, retry, conflict handling>`
- **What does not work offline:** `<...>`
- **How to test:** see [setup.md](./setup.md#testing-offline-mode)
