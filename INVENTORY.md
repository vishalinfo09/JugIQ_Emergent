# JugIQ Prototype — Inventory

A disposable, **frontend-only** clickable UX prototype. No backend, no API calls,
no database, no auth. All data is local mock fixtures in
`frontend/src/lib/jugiq-data.ts`; JugIQ replies are scripted (no LLM). The
template's FastAPI backend is untouched (stock `StatusCheck` demo route only).

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
