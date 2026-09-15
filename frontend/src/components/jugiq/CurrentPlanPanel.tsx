import { useRef, useState } from "react";
import { addDays, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BookingDetails, BookStatus, MarkTarget, Plan, PlanStop } from "@/lib/jugiq-data";
import {
  ArrowRight,
  CalendarClock,
  CircleCheck,
  CircleHelp,
  CornerDownRight,
  MapPin,
  Moon,
  Scale,
  TriangleAlert,
} from "lucide-react";

const TRIP_START = new Date(2026, 11, 20);

const STATUS_STYLE: Record<BookStatus, string> = {
  booked: "bg-pine/12 text-pine ring-1 ring-pine/25",
  planned: "bg-clay/12 text-clay ring-1 ring-clay/25",
  "not-booked": "bg-secondary text-muted-foreground ring-1 ring-border",
};

const STATUS_LABEL: Record<BookStatus, string> = {
  booked: "Booked",
  planned: "Planned",
  "not-booked": "Not booked",
};

export function StatusPill({ status }: { status: BookStatus }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[0.68rem] font-medium tracking-wide",
        STATUS_STYLE[status],
      )}
      data-testid={`status-pill-${status}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function BookingSummary({
  booking,
  conflict,
  plannedRange,
}: {
  booking: BookingDetails;
  conflict?: boolean;
  plannedRange?: string;
}) {
  const bits = [booking.provider, booking.dates, booking.amount, booking.cancellation].filter(
    Boolean,
  ) as string[];
  return (
    <div className="mt-1.5 space-y-1">
      {bits.length > 0 && (
        <p className="flex items-start gap-1 text-[0.72rem] leading-snug text-muted-foreground">
          <CircleCheck className="mt-0.5 size-3 shrink-0 text-pine" />
          <span>{bits.join(" · ")}</span>
        </p>
      )}
      {booking.note && (
        <p className="pl-4 text-[0.72rem] italic leading-snug text-muted-foreground">
          {booking.note}
        </p>
      )}
      {conflict && (
        <div
          className="mt-1 rounded-lg border border-amber-500/40 bg-amber-500/[0.08] px-2.5 py-2"
          data-testid="booking-conflict-flag"
        >
          <p className="flex items-center gap-1.5 text-[0.72rem] font-semibold text-amber-700">
            <TriangleAlert className="size-3.5" /> Booking needs attention
          </p>
          <p className="mt-0.5 text-[0.72rem] leading-snug text-amber-800/90">
            Your plan now runs {plannedRange}, but this stay is booked for {booking.dates}. JugIQ
            hasn't cancelled, moved or rebooked it — check whether the reservation still works.
          </p>
        </div>
      )}
    </div>
  );
}

export function CurrentPlanPanel({
  plan,
  onCompare,
  onResolve,
  onMarkBooked,
  highlightRoute,
  className,
}: {
  plan: Plan;
  onCompare: () => void;
  onResolve: (id: string) => void;
  onMarkBooked: (target: MarkTarget) => void;
  highlightRoute?: boolean;
  className?: string;
}) {
  const decisionRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const [focusedDecision, setFocusedDecision] = useState<string | null>(null);
  const openIds = new Set(plan.decisions.map((d) => d.id));

  function focusDecision(id: string) {
    setFocusedDecision(id);
    decisionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => setFocusedDecision((cur) => (cur === id ? null : cur)), 1500);
  }

  let cursor = TRIP_START;
  const dated = plan.stops.map((s: PlanStop) => {
    const start = cursor;
    const end = addDays(start, s.nights);
    cursor = end;
    return { ...s, range: `${format(start, "d MMM")} – ${format(end, "d MMM")}` };
  });

  return (
    <div className={cn("flex flex-col", className)} data-testid="current-plan-panel">
      <div className="border-b border-hairline px-5 py-4">
        <h2 className="font-heading text-lg leading-tight">Current Plan</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {plan.window} · {plan.travellers}
        </p>
        <p className="text-sm text-muted-foreground">From {plan.origin}</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <section className="px-5 py-4">
          <h3 className="mb-3 flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <MapPin className="size-3.5" /> Route
          </h3>
          <div
            className={cn(
              "mb-4 flex flex-wrap items-center gap-1.5 rounded-lg",
              highlightRoute && "animate-glow",
            )}
            data-testid="current-plan-route"
          >
            {plan.stops.map((s, i) => (
              <span key={s.id} className="flex items-center gap-1.5">
                <span className="rounded-lg bg-secondary px-2.5 py-1 text-sm font-medium text-secondary-foreground">
                  {s.city}
                </span>
                {i < plan.stops.length - 1 && (
                  <ArrowRight className="size-3.5 text-muted-foreground" />
                )}
              </span>
            ))}
          </div>

          <ol className="space-y-4">
            {dated.map((s, i) => (
              <li key={s.id} data-testid={`plan-stop-${s.id}`}>
                <div className="flex items-baseline justify-between gap-2">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[0.7rem] text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h4 className="font-heading text-base">{s.city}</h4>
                  </div>
                  <span className="flex items-center gap-1 font-mono text-[0.7rem] text-muted-foreground">
                    <Moon className="size-3" />
                    {s.nights}
                  </span>
                </div>
                <p className="ml-6 text-xs text-muted-foreground">{s.range}</p>

                <div className="ml-6 mt-2 space-y-2 border-l border-hairline pl-3">
                  {/* stay row */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span className="text-sm text-foreground/90">{s.stay}</span>
                      <StatusPill status={s.stayStatus} />
                    </div>
                    {s.stayStatus === "booked" && s.stayBooking ? (
                      <BookingSummary
                        booking={s.stayBooking}
                        conflict={s.bookingConflict}
                        plannedRange={s.range}
                      />
                    ) : (
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() =>
                            onMarkBooked({
                              stopId: s.id,
                              kind: "stay",
                              label: s.stay,
                              title: `${s.city} — ${s.stay}`,
                              prefill: { dates: s.range },
                            })
                          }
                          data-testid={`mark-booked-stay-${s.id}`}
                        >
                          <CircleCheck className="size-3" /> Mark as booked
                        </Button>
                        {s.stayNudge && s.stayBlockedBy && openIds.has(s.stayBlockedBy) && (
                          <button
                            type="button"
                            onClick={() => focusDecision(s.stayBlockedBy!)}
                            className="flex items-start gap-1 text-left text-[0.72rem] leading-snug text-clay/90 transition-colors hover:text-clay"
                            data-testid={`decision-nudge-${s.stayBlockedBy}`}
                          >
                            <CornerDownRight className="mt-0.5 size-3 shrink-0" />
                            {s.stayNudge}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* activity rows */}
                  {s.highlights.map((h) => (
                    <div key={h.label}>
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <span className="text-sm text-muted-foreground">{h.label}</span>
                        <StatusPill status={h.status} />
                      </div>
                      {h.status === "booked" && h.booking ? (
                        <BookingSummary booking={h.booking} />
                      ) : (
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <Button
                            size="xs"
                            variant="ghost"
                            className="h-6 px-2 text-[0.72rem] text-muted-foreground hover:text-foreground"
                            onClick={() =>
                              onMarkBooked({
                                stopId: s.id,
                                kind: "highlight",
                                label: h.label,
                                title: h.label,
                              })
                            }
                            data-testid={`mark-booked-activity-${h.label.slice(0, 10).toLowerCase().replace(/\s+/g, "-")}`}
                          >
                            <CircleCheck className="size-3" /> Mark as booked
                          </Button>
                          {h.nudge && h.blockedBy && openIds.has(h.blockedBy) && (
                            <button
                              type="button"
                              onClick={() => focusDecision(h.blockedBy!)}
                              className="flex items-start gap-1 text-left text-[0.72rem] leading-snug text-clay/90 transition-colors hover:text-clay"
                              data-testid={`decision-nudge-${h.blockedBy}`}
                            >
                              <CornerDownRight className="mt-0.5 size-3 shrink-0" />
                              {h.nudge}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="border-t border-hairline bg-[#FFFDF9] px-5 py-4">
          <h3 className="mb-3 flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <CircleHelp className="size-3.5" /> Open Decisions
            <span
              className="ml-auto rounded-full bg-clay px-1.5 py-0.5 font-mono text-[0.65rem] text-white"
              data-testid="open-decisions-badge"
            >
              {plan.decisions.length}
            </span>
          </h3>
          <ul className="space-y-3">
            {plan.decisions.map((d) => (
              <li
                key={d.id}
                ref={(el) => {
                  decisionRefs.current[d.id] = el;
                }}
                className={cn(
                  "rounded-xl border border-hairline bg-card p-3 transition-[border-color] hover:border-clay/35",
                  focusedDecision === d.id && "animate-glow border-clay/50",
                )}
                data-testid={`open-decision-${d.id}`}
              >
                <p className="text-sm font-medium leading-snug">{d.question}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{d.context}</p>
                {d.unresolvedFrom && (
                  <p className="mt-1.5 flex items-center gap-1 text-[0.7rem] font-medium text-clay">
                    <CalendarClock className="size-3" /> {d.unresolvedFrom}
                  </p>
                )}
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {d.comparable ? (
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={onCompare}
                      data-testid={`compare-${d.id}-button`}
                    >
                      <Scale className="size-3" /> Compare
                    </Button>
                  ) : null}
                  {d.options.slice(0, 2).map((o) => (
                    <Button
                      key={o}
                      size="xs"
                      variant="ghost"
                      onClick={() => onResolve(d.id)}
                      data-testid={`decide-${d.id}-${o.slice(0, 10).toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {o}
                    </Button>
                  ))}
                </div>
              </li>
            ))}
            {plan.decisions.length === 0 && (
              <li className="rounded-xl border border-dashed border-hairline p-4 text-sm text-muted-foreground">
                Nothing open right now.
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
