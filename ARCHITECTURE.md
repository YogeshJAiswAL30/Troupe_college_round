# Fairwork MVP: Internal Implementation Note

## 1. Domain Models & Schema Summary

| Model | Primary Purpose & Key Fields |
| :--- | :--- |
| **`UserProfile`** | Identity, role (`CLIENT`, `FREELANCER`, `ARBITRATOR`), verification status (`ID_VERIFIED`, `VERIFIED_PRO`), reputation score. |
| **`Project`** | Scope container: `totalBudgetMinor` (integer cents), client and freelancer IDs, active agreement ID, lifecycle status. |
| **`Agreement`** | Versioned contract: `versionNumber`, structured terms (scope, deliverables, IP clause, confidentiality, law), `acceptedBy` dual-party map, `isActive`, `agreementHash` (SHA-256). |
| **`Milestone`** | Verifiable unit of work: `amountMinor`, acceptance criteria list, review window, revision policy (`maxRevisions`), `currentRevisionCount`, status. |
| **`Delivery`** | Work submission: `revisionNumber`, notes, file references with individual SHA-256 hashes, `deliveryHash` fingerprint, submitted timestamp. |
| **`Review`** | Client evaluation: `decision` (`APPROVED`, `REVISION_REQUESTED`, `DISPUTED`), criteria checklist, feedback, timestamp. |
| **`PaymentRecord`** | Escrow & payout audit log: `type` (`ESCROW_DEPOSIT`, `ESCROW_RELEASE`, `REFUND`, `DISPUTE_PAYOUT`), `amountMinor`, `isSimulated: true`, reference ID. |
| **`Dispute`** | Structured conflict handling: initiator, reason, evidence references, `settlementProposal` (split payouts), status. |
| **`ActivityEvent`** | Audit trail: timestamp, actor role, event type, details, transaction reference. |

---

## 2. Milestone State Machine & Transitions

```text
       [DRAFT]
          │ (Both accept agreement)
          ▼
      [AGREED]
          │ (Ready for funding)
          ▼
 [AWAITING_FUNDING]
          │ (Client deposits escrow)
          ▼
       [FUNDED] ◄────────────────────────┐
          │                              │ (Submit
          ├──────────────┐               │  Revision)
          ▼              ▼               │
    [IN_PROGRESS]   [SUBMITTED] ─────────┼───────┐
          │              │               │       │
          │              ▼               │       │
          │       [UNDER_REVIEW]         │       │
          │         │         │          │       │
          │         │         ▼          │       │
          │         │   [REVISION_REQ] ──┘       │
          │         ▼                            ▼
          │     [APPROVED]                  [DISPUTED]
          │         │                            │
          │         ▼ (Client releases)          ▼ (Mutual settlement /
          │     [RELEASED]                  [RESOLVED]   arbitration)
          │     (Terminal)                   (Terminal)
          ▼
     [CANCELLED]
```

### Transition Enforcement Rules:
1. **Rule 1 (Budget Exact Allocation):** Sum of all milestones' `amountMinor` must equal `project.totalBudgetMinor`.
2. **Rule 2 (No Approval Without Delivery):** A milestone cannot transition to `APPROVED` unless at least one deliverable has been submitted (`deliveries.length > 0`).
3. **Rule 3 (No Double-Release):** `RELEASED` is terminal. Once released, further releases throw a `DomainError`.
4. **Rule 4 (Dispute Locks Ordinary Release):** When in `DISPUTED`, normal release is blocked. Only mutual settlement or arbitrator resolution can transition to `RESOLVED`.
5. **Rule 5 (Strict Participant Authorization):** Only the client can fund escrow, review work, or release payments. Only the freelancer can submit deliverables.
6. **Rule 6 (Dual-Party Agreement Activation):** An agreement version becomes active only when both client and freelancer signatures are registered.
7. **Rule 7 (Versioned Amendments & Consent Renewal):** Amending accepted terms increments the version number (`v1 -> v2`), clears the counterparty's acceptance, and requires renewed consent.
8. **Rule 8 (Integer Minor Units):** All monetary amounts are stored in cents (`amountMinor: 200000` = $2,000.00) to prevent IEEE-754 floating-point drift.
9. **Rule 9 (Single Source of Truth):** Financial metrics (active escrow, released funds, disputed funds) are derived directly from milestone states, never stored in duplicate counters.

---

## 3. Cryptographic Provenance

- **Agreement Hash:** Deterministic canonical JSON serialization hashed using SHA-256 (`crypto.subtle.digest`).
- **Deliverable Hash:** Deterministic combination of submission notes, file sizes, and file content fingerprints.
- **Transparency Disclosure:** All prototype payments and escrow vaults are explicitly labeled with `isSimulated: true`. File hashes prove file integrity without falsely asserting work quality or unverified blockchain execution.

---

## 4. Architectural Trade-offs & Decisions

| Decision | Rationale | Trade-off / Next Stage |
| :--- | :--- | :--- |
| **In-Memory Reactive State with Seed Data** | Allows rapid testing of all user personas and state transitions without external database latency. | State resets on page reload; next stage can attach Supabase / PostgreSQL persistence. |
| **Client-Side SHA-256 via Web Crypto** | Works identically in standard browsers and modern Node/Vitest test environments without binary C++ addons. | For massive multi-gigabyte uploads in production, chunked hashing in a web worker or server-side stream would be preferred. |
| **Single Source of Truth Financial Engine** | Guarantees that escrow balances always reconcile with milestone states and prevents accounting desynchronization. | Requires iterating active milestones (`deriveProjectFinancials`), which is trivial for project sizes (~O(N) where N < 50). |
| **Switchable Persona Header** | Lets judges, mentors, and developers test both sides of the agreement in one tab. | Production will bind to actual authenticated user sessions. |
