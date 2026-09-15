# JugIQ Prototype — Inventory

A disposable, **frontend-only** clickable prototype with **two independent UX
directions** for JugIQ. No backend, no API calls, no database, no auth. All data
is local mock fixtures in `frontend/src/lib/jugiq-data.ts`; JugIQ replies are
scripted (no LLM). The template's FastAPI backend is untouched.

- **Variant A — Conversation-First** at `/` (`pages/Home.tsx`, `components/jugiq/*`):
  chat dominant, Current Plan a secondary collapsible panel / mobile drawer.
- **Variant B — Decision Workspace** at `/b` (`pages/HomeB.tsx`, `components/jugiq-b/*`):
  chat ~60% + a persistent Trip Workspace ~38% in three layers (Needs attention →
  Current Plan route spine → Open Decisions); mobile surfaces it via a bottom bar
  → sheet. A global `VariantSwitcher` (mounted in `App.tsx`) toggles the two;
  `Home.tsx`/`components/jugiq/*` were not modified to add B. B reuses `ChatMessage`,
  `BookingComparison`, `MarkBookedDialog` and all `jugiq-data.ts` fixtures.

## Where the code lives
- `frontend/src/pages/Home.tsx` — single orchestrating page: state machine,
  scripted replies, all interaction handlers.
- `frontend/src/lib/jugiq-data.ts` — all mock data + TS types in one place.
- `frontend/src/components/jugiq/` — 6 presentational components:
  `ChatMessage`, `FirstSketchCard`, `CurrentPlanPanel`, `MaterialChangeDiff`,
  `ReviseSynthesisCard`, `BookingComparison`.
- `frontend/src/index.css` — theme tokens + fonts (warm stone / clay / pine,
  Lora + DM Sans + JetBrains Mono).
- Template scaffolding NOT used by the prototype: `frontend/src/lib/api.ts`,
  `session.ts`, `queryClient.ts`, `recharts.tsx`, `lucide-react.tsx`.

Verify no network plumbing:
`grep -rn "apiGet\|apiPost\|fetch(" frontend/src/pages frontend/src/components/jugiq`
→ returns nothing.

## Screens / states (6, single route `/`)
1. **New Trip** — hero + freeform composer, starter chips; no Current Plan yet.
2. **First Trip Sketch** — rich card: 2 legs w/ selective imagery, why-this-order,
   trade-offs, feasibility notes, open decisions.
3. **Mature Solo Trip** — chat + canonical Current Plan (route, dated nights,
   stays/activities with booked·held·not-booked, Open Decisions).
4. **Material Plan Change** — before/after route diff + sequence-impact list.
5. **Group Trip Room** — human thread; JugIQ silent unless invoked; Revise
   synthesis card that keeps a disagreement as an Open Decision.
6. **Booking Comparison** — 4 sources ranked on traveller value; neutrality +
   coverage disclosures; monetised option (Viator) ranked 3rd and labelled.

## Clickable interactions
- State-switcher pills (1–6) + guided "Next: …" link.
- Chat: type + Send/Enter; starter chips append text; "Use the example" chip.
- New→Sketch: typing a trip brief produces the sketch artifact.
- Sketch card: decision chips open the plan; "Use this plan" creates Current Plan
  and advances to Mature.
- Mature chips: "Actually, let's do Macau first."; "Compare Peak Tram options".
- Current Plan: desktop collapse/expand toggle; mobile bottom-drawer w/ decision
  badge; per-decision Compare + inline settle buttons (with Undo toast).
- Decision Nudges: tappable prompt scrolls to + glows the linked Open Decision.
- Material change: Apply (reverses route + glow + Undo), Keep current order,
  inline Undo this change.
- Group room: Ask JugIQ (prefills @JugIQ), Revise Trip, typing @JugIQ invokes it;
  plain messages don't. Apply to Current Plan / Undo on the synthesis card.
- Booking dialog: "Open on …" per source; Reopen comparison button; Esc/close.
- Header: Invite (copies link toast).

## Behaviors added beyond the literal prompt
- Prototype state-switcher bar + "Next" stepper (agreed at kickoff).
- Simulated ~650ms typing indicator before scripted JugIQ replies.
- Keyword-matched scripted replies (ferry / price / trip-brief, etc.).
- Toasts with contextual Undo on settle / apply-change / apply-revise / invite.
- Route-change glow animation; date derivation (fixed 20 Dec start via date-fns).
- Third status "held" beyond booked/not-booked.
- Decision Nudges (added via follow-up requests): one generic treatment shown in
  two demo spots — solo crossing choice, group show-vs-flight after Revise.
- "canonical" badge on Current Plan; "Draft — nothing booked" badge on sketch.

## Run locally
- Frontend: `cd frontend && yarn && yarn dev` (port 3000).
- Typecheck: `cd frontend && yarn typecheck`.
- Backend is not required to view the prototype.

## Variant B — Decision Workspace (`/b`)
Independent second direction. Orchestrator `pages/HomeB.tsx`; components in
`frontend/src/components/jugiq-b/`:
- `WorkspacePanel.tsx` — persistent workspace: a "Needs attention" header, the
  Current Plan as a vertical route spine with status dots (Booked/Planned/Not
  booked), inline Mark-as-booked + Decision Nudges, booking-conflict flag, a
  group-stance block (agreed vs unresolved), and Open Decisions.
- `SketchTimeline.tsx` — First Sketch as a concise route timeline (thumbnails +
  nights/dates) with rationale, feasibility and still-to-decide.
- `ChangeImpact.tsx` — adopted vs proposed mini-routes, downstream effects, and a
  preserve-the-confirmed-booking conflict band.
- `GroupProposal.tsx` — Revise output labelled "Proposed from your discussion"
  (→ "Adopted" after Apply); agreed items vs one unresolved Open Decision.
- `VariantSwitcher.tsx` — global A/B toggle mounted in `App.tsx`.
Same six states, same scenario, same booking-neutrality + confirmed-booking rules
as A. Desktop is a ~60/40 chat+workspace split; mobile is chat-first with the
workspace behind a bottom bar → sheet.
