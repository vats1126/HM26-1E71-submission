# AI Usage Disclosure

[← Back to README](./README.md)

> AI tools are **100% permitted** at HackMysuru 1.0. Disclosing them is **mandatory**.
> Using AI never costs you points. Not being able to explain code you submitted does.
> Reviewers check this file against your commit history and the AI segment of your video.

---

## Summary

| Question | Answer |
|---|---|
| Did we use AI tools during development? | Yes |
| Does our product use AI/ML at runtime? | No |
| Roughly how much of the code was AI-assisted? | Mostly AI-assisted throughout development; exact percentages were not formally tracked. |
| Can every team member explain the AI-assisted code? | Yes |

---

## 1. AI Tools Used During Development

| Tool | Model / plan | Used by | What we used it for |
|---|---|---|---|
| ChatGPT | Not tracked | Vivek Urs G A | Architecture discussion, debugging, planning, code guidance |
| Google Antigravity | Not tracked | Vivek Urs G A | Full-stack implementation, debugging, testing |
| Hermes | Not tracked | Vivek Urs G A | Coding / agent-assisted workflows |
| Claude Code | Not tracked | Vivek Urs G A | Coding, review, debugging |
| Codex / Codex CLI | Not tracked | Vivek Urs G A | Coding, review |

Other team members' individual AI tool usage was not tracked or confirmed.

## 2. Where AI Helped in the Codebase

AI assistance was used broadly across product architecture, frontend, backend integration, and debugging/testing, in line with the "AI Tools Used" table above. Specific areas AI materially contributed to:

| Area | Level of AI help | What a human did |
|---|---|---|
| Architecture & data model (report lifecycle, role model, Supabase/PostGIS design) | High — design discussion and scaffolding | Team reviewed and finalized the architecture; runtime AI was deliberately kept optional/non-existent in the MVP |
| Frontend (Next.js pages, components, `/report` flow, map UI) | Medium–High | Team fixed layout/mobile bugs, tuned UX, verified against real devices |
| Backend (Supabase integration, RLS, lifecycle API routes) | Medium | Team designed the schema/permission model and validated RLS behavior |
| Debugging / testing | High — used to isolate root causes | Team verified and applied the actual fixes (see Section 5) |

**Commit convention:** commits containing substantial AI-generated code are tagged `[ai]` in the message, e.g. `feat: ward status page [ai]`.

## 3. AI Inside the Product (runtime)

**Runtime AI: None.** The submitted MVP does not invoke an AI model as part of its production user workflow. Cleanup verification runs through human review only. The architecture keeps a `verifyCleanup(before, after)` interface for a future, provider-agnostic AI layer, but no model is called at runtime in this submission. AI was used as a development tool, not as a required runtime component.

## 4. Key Prompts

The following are representative prompts that shaped real design and implementation decisions — described as representative summaries of our prompting, not exact historical quotations.

| # | Prompt (representative) | What we kept | What we changed or rejected |
|---|---|---|---|
| 1 | "Design the end-to-end architecture for a real-time civic accountability platform where citizens report issues with geographic evidence, reports are routed, government/NGOs can act, and citizens can verify or reopen them." | Overall lifecycle and Supabase/PostGIS-based architecture | Kept AI verification optional rather than a hard dependency |
| 2 | "Design the role and permission model separating citizen/public access from municipal officer and NGO operational actions while keeping public information visible." | Citizen / Officer / NGO / Verifier role separation | Enforced permissions at the API level, not just the UI |
| 3 | "Implement the complete civic report lifecycle from submission through claim, cleanup, verification, reopening, follow-up, and bounty handling, with timeline and notification updates." | Full lifecycle state machine and timeline model | — |
| 4 | "Connect the existing CleanCity frontend to Supabase with PostgreSQL/PostGIS, API routes, report persistence, lifecycle actions, and RLS while preserving the existing demo fallback." | Supabase/PostGIS integration, RLS approach | Preserved a working demo fallback path |
| 5 | "Investigate and fix the /report page layout issue involving sticky headers, overflow, scrolling, stacking, and mobile responsiveness." | Root-cause fix for the stacking/overflow bug | — |

## 5. How We Verified AI Output

AI-assisted debugging helped identify and resolve the following issues, which the team then verified and fixed:

- GPS requests that could hang or timeout.
- Incorrect `/report` sticky-header and overflow stacking behavior.
- Mobile bottom-sheet and navigation layering issues.
- Incorrect visibility of operational controls for Citizen/Public roles.
- Incorrect actor assignment in NGO bounty flows.
- Persistent role storage preventing the intended fresh-session role selector.
- Hydration / non-deterministic rendering issues.

Architecture decisions produced with AI assistance were reviewed rather than accepted as-is — in particular, the team deliberately kept runtime AI optional/non-existent in the submitted MVP rather than following a suggestion to integrate a provider directly.

## 6. What We Deliberately Did *Not* Use AI For

- The Decision Log — written by the team in our own words.
- The final call on runtime architecture (keeping AI out of the production workflow) — made and owned by the team, not delegated to a tool's suggestion.

---

**Declaration:** We confirm this disclosure is complete, and every team member can explain the code listed above.
**Signed:** Varun P on behalf of Mysuru Janseva · 20 September 2026
