import { useRef, useState } from "react";
import { addDays, format } from "date-fns";
import { cn } from "@/lib/utils";
import type { BookingDetails, BookStatus, MarkTarget, Plan, PlanStop } from "@/lib/jugiq-data";
import { CircleCheck, CornerDownRight, MessageSquareDot, Scale, TriangleAlert } from "lucide-react";

const TRIP_START = new Date(2026, 11, 20);

const DOT: Record<BookStatus, string> = {
  booked: "bg-pine",
  planned: "bg-clay",
  "not-booked": "bg-transparent ring-1 ring-muted-foreground/40",
};

const STATUS_TEXT: Record<BookStatus, string> = {
  booked: "text-pine",
  planned: "text-clay",
  "not-booked": "text-muted-foreground",
};

const STATUS_WORD: Record<BookStatus, string> = {
  booked: "Booked",
  planned: "Planned",
  "not-booked": "Not booked",
};

export interface AdoptedStance {
  agreed: string[];
  unresolved: string[];
}

function BookingLine({ booking, conflict, range }: { booking: BookingDetails; conflict?: boolean; range: string }) {
  const bits = [booking.provider, booking.dates, booking.amount, booking.cancellation].filter(
    Boolean,
  ) as string[];
  return (
    <div className="mt-0.5">
      {bits.length > 0 && (
        <p className="text-[0.72rem] leading-snug text-muted-foreground">{bits.join(" · ")}</p>
      )}
      {booking.note && (
        <p className="text-[0.72rem] italic leading-snug text-muted-foreground/80">{booking.note}</p>
      )}
      {conflict && (
        <p
          className="mt-1 flex items-start gap-1 text-[0.72rem] font-medium leading-snug text-amber-700"
          data-testid="c-booking-conflict"
        >
          <TriangleAlert className="mt-0.5 size-3 shrink-0" />
          Booking needs attention — plan now runs {range}, booked for {booking.dates}. JugIQ hasn't
          moved or rebooked it.
        </p>
      )}
    </div>
  );
}

/** Understated, discoverable item action — icon only, not repeated as prominent text. */
function MarkBookedAction({ label, onClick, testid }: { label: string; onClick: () => void; testid: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={`Mark "${label}" as booked`}
      aria-label={`Mark ${label} as booked`}
      className="shrink-0 rounded-full p-1 text-muted-foreground/60 transition-colors hover:bg-secondary hover:text-clay"
      data-testid={testid}
    >
      <CircleCheck className="size-3.5" />
    </button>
  );
}

export function PlanPanelC({
  plan,
  newMessagesNote,
  adoptedStance,
  onCompare,
  onResolve,
  onMarkBooked,
  highlightRoute,
  className,
}: {
  plan: Plan;
  newMessagesNote?: string;
  adoptedStance?: AdoptedStance;
  onCompare: () => void;
  onResolve: (id: string) => void;
  onMarkBooked: (t: MarkTarget) => void;
  highlightRoute?: boolean;
  className?: string;
}) {
  const decisionRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const [focused, setFocused] = useState<string | null>(null);
  const openIds = new Set(plan.decisions.map((d) => d.id));

  function focusDecision(id: string) {
    setFocused(id);
    decisionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => setFocused((c) => (c === id ? null : c)), 1500);
  }

  let cursor = TRIP_START;
  const dated = plan.stops.map((s: PlanStop) => {
    const start = cursor;
    const end = addDays(start, s.nights);
    cursor = end;
    return { ...s, range: `${format(start, "d MMM")} – ${format(end, "d MMM")}` };
  });

  const conflictCount = plan.stops.filter((s) => s.bookingConflict).length;
  const nextItem = plan.decisions[0];

  return (
    <div className={cn("flex flex-col bg-parchment", className)} data-testid="plan-panel-c">
      {/* Needs attention */}
      <div className="border-b border-hairline px-5 py-4" data-testid="c-attention">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Needs attention
        </p>
        <p className="mt-1 font-heading text-[1.35rem] leading-tight">
          <span className="text-clay">{plan.decisions.length}</span> open{" "}
          {plan.decisions.length === 1 ? "decision" : "decisions"}
          {conflictCount > 0 && (
            <>
              {" · "}
              <span className="text-amber-700">{conflictCount} booking flag</span>
            </>
          )}
        </p>
        {nextItem && (
          <button
            type="button"
            onClick={() => focusDecision(nextItem.id)}
            className="mt-1 flex items-start gap-1 text-left text-[0.8rem] leading-snug text-muted-foreground transition-colors hover:text-foreground"
            data-testid="c-next-attention"
          >
            <CornerDownRight className="mt-0.5 size-3.5 shrink-0 text-clay" />
            Next up: {nextItem.question}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Neutral group signal BEFORE Revise — no agreement claims */}
        {newMessagesNote && (
          <div
            className="flex items-center gap-2 border-b border-hairline bg-clay/[0.05] px-5 py-2.5 text-[0.8rem] text-foreground/80"
            data-testid="c-new-messages"
          >
            <MessageSquareDot className="size-4 shrink-0 text-clay" />
            {newMessagesNote}
          </div>
        )}

        {/* Adopted group state — ONLY after Apply */}
        {adoptedStance && (
          <section className="border-b border-hairline px-5 py-4" data-testid="c-adopted-stance">
            <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Where the group stands
            </h3>
            <p className="mt-2 text-[0.7rem] font-medium uppercase tracking-wide text-pine">Adopted</p>
            <ul className="mt-1 space-y-1">
              {adoptedStance.agreed.map((a) => (
                <li key={a} className="flex items-start gap-1.5 text-sm text-foreground/80">
                  <CircleCheck className="mt-0.5 size-3.5 shrink-0 text-pine" /> {a}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[0.7rem] font-medium uppercase tracking-wide text-clay">
              Still an Open Decision
            </p>
            <ul className="mt-1 space-y-1">
              {adoptedStance.unresolved.map((u) => (
                <li key={u} className="flex items-start gap-1.5 text-sm text-foreground/80">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-clay" /> {u}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Current Plan — route spine */}
        <section className="px-5 py-4">
          <div className="flex items-baseline justify-between">
            <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Current Plan
            </h3>
            <span className="text-[0.72rem] text-muted-foreground">{plan.window}</span>
          </div>

          <div
            className={cn("relative mt-4 rounded-lg pl-6", highlightRoute && "animate-glow")}
            data-testid="c-route"
          >
            <span className="absolute bottom-2 left-[0.31rem] top-2 w-px bg-hairline" />
            <ol className="space-y-5">
              {dated.map((s) => (
                <li key={s.id} className="relative" data-testid={`c-stop-${s.id}`}>
                  <span className="absolute -left-[1.03rem] top-1 size-2.5 rounded-full bg-foreground ring-4 ring-parchment" />
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="font-heading text-[1.05rem] leading-none">{s.city}</h4>
                    <span className="font-mono text-[0.7rem] text-muted-foreground">
                      {s.nights}n · {s.range}
                    </span>
                  </div>

                  <ul className="mt-2 space-y-2">
                    {/* stay */}
                    <li className="flex items-start gap-2">
                      <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", DOT[s.stayStatus])} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-x-2">
                          <span className="text-sm text-foreground/90">{s.stay}</span>
                          <div className="flex items-center gap-1">
                            <span className={cn("text-[0.7rem] font-medium", STATUS_TEXT[s.stayStatus])}>
                              {STATUS_WORD[s.stayStatus]}
                            </span>
                            {s.stayStatus !== "booked" && (
                              <MarkBookedAction
                                label={s.stay}
                                testid={`c-mark-booked-stay-${s.id}`}
                                onClick={() =>
                                  onMarkBooked({
                                    stopId: s.id,
                                    kind: "stay",
                                    label: s.stay,
                                    title: `${s.city} — ${s.stay}`,
                                    prefill: { dates: s.range },
                                  })
                                }
                              />
                            )}
                          </div>
                        </div>
                        {s.stayStatus === "booked" && s.stayBooking ? (
                          <BookingLine booking={s.stayBooking} conflict={s.bookingConflict} range={s.range} />
                        ) : (
                          s.stayNudge &&
                          s.stayBlockedBy &&
                          openIds.has(s.stayBlockedBy) && (
                            <button
                              type="button"
                              onClick={() => focusDecision(s.stayBlockedBy!)}
                              className="mt-0.5 text-left text-[0.72rem] leading-snug text-muted-foreground transition-colors hover:text-foreground"
                              data-testid={`c-nudge-${s.stayBlockedBy}`}
                            >
                              {s.stayNudge}
                            </button>
                          )
                        )}
                      </div>
                    </li>
                    {/* activities */}
                    {s.highlights.map((h) => (
                      <li key={h.label} className="flex items-start gap-2">
                        <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", DOT[h.status])} />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-x-2">
                            <span className="text-sm text-muted-foreground">{h.label}</span>
                            <div className="flex items-center gap-1">
                              <span className={cn("text-[0.7rem] font-medium", STATUS_TEXT[h.status])}>
                                {STATUS_WORD[h.status]}
                              </span>
                              {h.status !== "booked" && (
                                <MarkBookedAction
                                  label={h.label}
                                  testid={`c-mark-booked-activity-${h.label.slice(0, 10).toLowerCase().replace(/\s+/g, "-")}`}
                                  onClick={() =>
                                    onMarkBooked({ stopId: s.id, kind: "highlight", label: h.label, title: h.label })
                                  }
                                />
                              )}
                            </div>
                          </div>
                          {h.status === "booked" && h.booking ? (
                            <BookingLine booking={h.booking} range={s.range} />
                          ) : (
                            h.nudge &&
                            h.blockedBy &&
                            openIds.has(h.blockedBy) && (
                              <button
                                type="button"
                                onClick={() => focusDecision(h.blockedBy!)}
                                className="mt-0.5 text-left text-[0.72rem] leading-snug text-muted-foreground transition-colors hover:text-foreground"
                                data-testid={`c-nudge-${h.blockedBy}`}
                              >
                                {h.nudge}
                              </button>
                            )
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Open Decisions */}
        <section className="border-t border-hairline px-5 py-4">
          <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Open Decisions
          </h3>
          <ul className="mt-2 divide-y divide-hairline">
            {plan.decisions.map((d) => (
              <li
                key={d.id}
                ref={(el) => {
                  decisionRefs.current[d.id] = el;
                }}
                className={cn("rounded-md py-3 transition-colors", focused === d.id && "animate-glow")}
                data-testid={`c-decision-${d.id}`}
              >
                <p className="text-sm font-medium leading-snug">{d.question}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{d.context}</p>
                {d.unresolvedFrom && (
                  <p className="mt-1 text-[0.7rem] font-medium text-clay">{d.unresolvedFrom}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                  {d.comparable && (
                    <button
                      type="button"
                      onClick={onCompare}
                      className="flex items-center gap-1 text-[0.75rem] font-medium text-foreground transition-colors hover:text-clay"
                      data-testid={`c-compare-${d.id}`}
                    >
                      <Scale className="size-3" /> Compare
                    </button>
                  )}
                  {d.options.slice(0, 2).map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => onResolve(d.id)}
                      className="text-[0.75rem] text-muted-foreground transition-colors hover:text-foreground"
                      data-testid={`c-decide-${d.id}-${o.slice(0, 10).toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </li>
            ))}
            {plan.decisions.length === 0 && (
              <li className="py-3 text-sm text-muted-foreground">Nothing open right now.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
