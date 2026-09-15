# JugIQ — UX Prototype Spec

## What it is
A disposable, **frontend-only** high-fidelity clickable UX prototype for JugIQ, a
conversational AI travel planner. No backend, no database, no auth, no real
integrations. All data is local mock fixtures in
`frontend/src/lib/jugiq-data.ts`. The template's FastAPI backend is untouched.

Direction: **Conversation-First** — chat is the dominant surface; the structured
**Current Plan** sits alongside it (desktop right panel, mobile bottom sheet).

## Routes
- `/` → `frontend/src/pages/Home.tsx` (single orchestrating page)

## The six prototype states
Switched via the sticky top pill bar (`state-switcher-<id>`) or the guided
`next-state-button`. Switching a state resets messages, plan and applied flags.

1. `new-trip` — hero + freeform composer, starter chips, "Use the example" chip
   injecting the Bangalore→HK/Macau prompt. No Current Plan panel yet.
2. `first-sketch` — JugIQ reply carrying a `sketch` artifact: two destination
   legs with selective imagery, why-this-order, trade-offs, feasibility notes,
   three open decisions, and **Use this plan** → advances to mature-solo.
3. `mature-solo` — ongoing conversation + canonical Current Plan (route, nights,
   dated stops, stays/activities with booked/held/not-booked pills, Open
   Decisions with Compare).
4. `material-change` — "Actually, let's do Macau first." produces a `diff`
   artifact: side-by-side current vs proposed route, why sequence matters,
   **Apply** (reverses plan stops + glow + toast with Undo) and inline Undo.
5. `group-room` — human-to-human thread (Priya, Arjun, Rohan). JugIQ stays
   silent unless a message contains `@JugIQ`, or **Ask JugIQ** / **Revise Trip**
   is pressed. Revise produces a synthesis card: three settled items applied,
   one disagreement deliberately preserved as an Open Decision.
6. `booking-comparison` — dialog opens automatically. Four sources ranked on
   traveller value only; the monetised option (Viator) ranks third and is
   labelled. Includes neutrality disclosure and non-exhaustive coverage note.

## Mock data model (TS only, `lib/jugiq-data.ts`)
- `Plan { title, travellers, window, origin, stops: PlanStop[], decisions: OpenDecision[] }`
- `PlanStop { id, city, country, nights, stay, stayStatus, highlights[], note }`
- `OpenDecision { id, question, context, options[], comparable?, unresolvedFrom? }`
- `ChatMsg { id, kind: user|jugiq|person, author?, initials?, time, text, artifact? }`
- `BookingOption { provider, price, cancellation, inclusions, availability, convenience, monetised, whyRanked }`

Stop dates are derived client-side from a fixed 20 Dec trip start with `date-fns`.

## Scripted replies
`scriptedReply()` in `Home.tsx` keyword-matches the user's text (macau first /
ferry / price / kid / trip-brief) and returns text plus an optional artifact.
Deterministic, ~650ms simulated typing. No LLM.

## Design
Per `/app/design_guidelines.json`: warm stone palette (#FAF8F5 page, #C2410C clay
accent, #047857 pine), Lora Variable headings + DM Sans Variable body +
JetBrains Mono numerics. Tokens in `frontend/src/index.css`.

## Auth
None. No accounts, no credentials.
