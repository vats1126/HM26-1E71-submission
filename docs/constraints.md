# The Five Hard Constraints

[← Back to README](../README.md)

The platform is designed around the five operational constraints identified in the challenge. The implementation combines validation, structured workflows, role-based handling, map/location information and offline-first behavior.

| # | Constraint                                               | Status     | 
| - | -------------------------------------------------------- | ---------- | 
| 1 | Fake, spam and harassment reports                        | ✅ Handled |
| 2 | Unclear jurisdiction                                     | ✅ Handled | 
| 3 | Prioritisation beyond "most votes"                       | ✅ Handled | 
| 4 | Bad input (duplicate, fake photo, wrong location, abuse) | ✅ Handled | 
| 5 | Works without internet                                   | ✅ Handled  | 

---

## 1. Fake, spam and harassment reports

* **Approach:** Reports are handled through structured complaint fields, validation and staff-side review rather than being treated as automatically trustworthy. Role-based workflows allow staff to review, update and resolve submitted complaints.
* **Anonymity trade-off:** The system is designed to allow civic reporting without requiring excessive personal information while retaining enough structured information for staff review and follow-up.
* **Human review:** Suspicious, inappropriate or invalid submissions can be reviewed and managed by authorized staff.
* **Code:** `app/api/reports/[id]/verify/route.ts`, `lib/services/reports.ts`, `lib/role-context.tsx`

---

## 2. Unclear jurisdiction

* **Approach:** Complaints use structured location information and map-based context to support routing and administrative handling. The architecture separates complaint reporting from jurisdiction/workflow handling so that routing decisions can be reviewed by staff.
* **What happens in a boundary case:** A complaint with an unclear or boundary location can be reviewed by the responsible staff instead of being silently discarded. The complaint remains visible in the workflow until the appropriate handling decision is made.
* **Code:** `components/map/MapComponents.tsx`, `components/map/MapSection.tsx`, `lib/services/reports.ts`, `app/api/reports/[id]/verify/route.ts`

---

## 3. Prioritisation

* **Formula / rules:** Prioritisation is based on the information available in the complaint workflow, including issue type, complaint status, location/context and the age or progress of the complaint. Staff can use these signals to determine which complaints require attention.
* **Why not simply "most votes":** A civic issue should not be considered important only because it receives the largest number of reports. Severity, location, current status and how long the issue remains unresolved provide additional context for operational prioritisation.
* **Code:** `lib/mock-data.ts`, `lib/services/reports.ts`, `app/dashboard/page.tsx`

---

## 4. Bad input

| Input                                   | What our system does                                                                                                                                                             |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Duplicate report                        | Structured complaint information and existing report data can be reviewed by staff to identify repeated reports concerning the same civic issue.                                 |
| Fake / unrelated photo                  | Uploaded evidence is treated as supporting information rather than automatically trusted; questionable submissions can be reviewed through the verification workflow.            |
| Wrong or impossible location            | Location information is handled as part of the complaint workflow and can be reviewed before the complaint is treated as a valid operational request.                            |
| Abusive message                         | Structured reporting and staff review provide a mechanism for inappropriate submissions to be identified and handled rather than automatically entering the resolution workflow. |
| Missing / invalid complaint information | Form and application validation prevents incomplete information from being treated as a complete complaint wherever validation is available.                                     |

**Verification code:** `app/api/reports/[id]/verify/route.ts`

**Report service:** `lib/services/reports.ts`

---

## 5. Offline Operation

* **What works offline:** The application is designed around an offline-first workflow so that core complaint/reporting interactions can continue when connectivity is temporarily unavailable.
* **How it syncs:** Locally created actions can be retained until connectivity is restored and then synchronized with the backend. Retry behavior is used to handle temporary connectivity failures.
* **Conflict handling:** Server-side validation and the report workflow provide a second layer of verification when locally created information reaches the backend.
* **What does not work offline:** Operations that require live server communication, such as retrieving newly updated server-side information or completing server-dependent actions, require connectivity.
* **How to test:** See [setup.md](./setup.md#testing-offline-mode).

### Offline-first principle

The application treats loss of connectivity as an expected operating condition rather than an immediate failure. The user can continue with supported local interactions and synchronize when a network connection becomes available.

---

## Implementation Summary

| Constraint        | Implementation approach                               |
| ----------------- | ----------------------------------------------------- |
| Fake / spam       | Validation + verification + staff review              |
| Jurisdiction      | Location/map context + administrative review          |
| Prioritisation    | Issue/context/status-based operational handling       |
| Bad input         | Structured validation + verification workflow         |
| Offline operation | Local-first interaction + synchronization when online |

The system intentionally combines **automation where appropriate with human verification**, allowing staff to intervene in cases where automated information is uncertain or potentially invalid.
