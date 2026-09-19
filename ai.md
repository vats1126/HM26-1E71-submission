# AI Usage Disclosure

[← Back to README](./README.md)

> AI tools are **100% permitted** at HackMysuru 1.0. Disclosing them is **mandatory**.
> Using AI never costs you points. Not being able to explain code you submitted does.
> Reviewers check this file against your commit history and the AI segment of your video.

<!--
This file covers two different things. Keep them separate:
  Section 1: AI tools YOU used while building (ChatGPT, Copilot, Cursor, Claude, v0, ...)
  Section 3: AI models your PRODUCT uses at runtime (vision model, LLM classifier, ...)
If you used no AI at all, say so explicitly in the Summary and delete the rest.
-->

---

## Summary

| Question | Answer |
|---|---|
| Did we use AI tools during development? | `<Yes / No>` |
| Does our product use AI/ML at runtime? | `<Yes / No>` |
| Roughly how much of the code was AI-assisted? | `<e.g. ~40% of frontend, ~15% of backend, 0% of routing logic>` |
| Can every team member explain the AI-assisted code? | `<Yes>` |

---

## 1. AI Tools Used During Development

| Tool | Model / plan | Used by | What we used it for |
|---|---|---|---|
| `<ChatGPT>` | `<GPT-x, free>` | `<@handle>` | `<Debugging CORS errors, regex for phone validation>` |
| `<GitHub Copilot>` | `<...>` | `<@handle, @handle>` | `<Autocomplete in React components>` |
| `<Cursor / Claude / v0 / ...>` | `<...>` | `<...>` | `<...>` |

## 2. Where AI Helped in the Codebase

| Area / file | Level of AI help | What a human did |
|---|---|---|
| `src/<frontend/components/>` | `<High: scaffolded by v0>` | `<Rewrote state handling, added offline queue>` |
| `src/<api/routes.py>` | `<Medium: Copilot suggestions>` | `<Designed endpoints, wrote validation>` |
| `src/<routing/engine.py>` | `<None>` | `<Written by hand, core logic>` |
| `<README / docs>` | `<...>` | `<...>` |

**Commit convention (optional, recommended):** commits containing substantial AI-generated code are tagged `[ai]` in the message, e.g. `feat: ward status page [ai]`.

## 3. AI Inside the Product (runtime)

<!-- Delete this section if your product uses no AI/ML at runtime. -->

| Model / API | What it does in our product | Hosted where | Trained / fine-tuned by us? |
|---|---|---|---|
| `<YOLOv8n>` | `<Detects overflowing bins in photos>` | `<On server / on device>` | `<Fine-tuned on 300 labelled images>` |
| `<LLM API>` | `<Classifies complaint text into issue types>` | `<Provider API>` | `<No, prompt only>` |

- **Accuracy we measured:** `<e.g. 82% precision on 50 held-out images>` (or "not measured yet")
- **What happens when the model is wrong:** `<fallback, human review, confidence threshold>`
- **Does it work offline?** `<...>`
- **Citizen data sent to third parties:** `<none / what, and why>`
- **Cost at city scale:** `<rough estimate, or "unknown">`

## 4. Key Prompts (optional, max 5)

<!-- Only prompts that shaped a real design or code decision. Not a full chat log. -->

| # | Prompt (short) | What we kept | What we changed or rejected |
|---|---|---|---|
| 1 | `<"Suggest a schema for complaints with geo-dedup">` | `<Table layout>` | `<Replaced lat/lng floats with PostGIS geography>` |

## 5. How We Verified AI Output

- `<e.g. Every AI-generated function was run against our seed data before merging>`
- `<e.g. Rejected suggestions that stored photos in the database as base64>`
- `<Example of a bug an AI tool introduced and how we caught it>`

## 6. What We Deliberately Did *Not* Use AI For

- `<e.g. The Decision Log — written by the team in our own words>`
- `<e.g. The jurisdiction routing rules>`

---

**Declaration:** We confirm this disclosure is complete, and every team member can explain the code listed above.
**Signed:** `<Team Leader name>` on behalf of `<Team Name>` · `<date>`
