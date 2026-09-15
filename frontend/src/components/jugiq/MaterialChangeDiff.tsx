import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowRight, Check, Undo2 } from "lucide-react";

interface Column {
  label: string;
  route: string[];
  rows: { k: string; v: string }[];
}

const CURRENT: Column = {
  label: "Current plan",
  route: ["Hong Kong · 5 nights", "Macau · 3 nights"],
  rows: [
    { k: "Arrival day", v: "Straight to the Tsim Sha Tsui stay, already booked" },
    { k: "Crossing", v: "Once, mid-trip, on day 6" },
    { k: "Last day", v: "Macau → Hong Kong airport, 4h buffer needed" },
    { k: "Energy curve", v: "Big days early, slow days late" },
  ],
};

const PROPOSED: Column = {
  label: "If Macau goes first",
  route: ["Macau · 3 nights", "Hong Kong · 5 nights"],
  rows: [
    { k: "Arrival day", v: "Land in HK, then transfer straight on to Macau — a long first day" },
    { k: "Crossing", v: "Still once, but on day 4 instead" },
    { k: "Last day", v: "You're already in Hong Kong — airport express, 2h buffer" },
    { k: "Energy curve", v: "Gentle start, busiest days at the end" },
  ],
};

const IMPACTS = [
  "Your Tsim Sha Tsui stay is booked for the 20th. Reversing the order means moving those dates.",
  "The last day gets easier — no cross-border transfer with luggage before an international flight.",
  "Day one gets harder: a morning arrival plus a ferry with a tired ten-year-old.",
];

function RouteChain({ route, tone }: { route: string[]; tone: "muted" | "accent" }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {route.map((r, i) => (
        <span key={r} className="flex items-center gap-1.5">
          <span
            className={cn(
              "rounded-lg px-2.5 py-1 text-sm font-medium",
              tone === "accent"
                ? "bg-clay/12 text-clay ring-1 ring-clay/25"
                : "bg-secondary text-secondary-foreground",
            )}
          >
            {r}
          </span>
          {i < route.length - 1 && <ArrowRight className="size-3.5 text-muted-foreground" />}
        </span>
      ))}
    </div>
  );
}

export function MaterialChangeDiff({
  applied,
  onApply,
  onUndo,
  onKeep,
}: {
  applied: boolean;
  onApply: () => void;
  onUndo: () => void;
  onKeep: () => void;
}) {
  return (
    <article
      className="overflow-hidden rounded-2xl border border-clay/25 bg-card shadow-[0_2px_8px_rgba(28,25,23,0.04),0_12px_24px_rgba(28,25,23,0.03)]"
      data-testid="material-change-diff"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline bg-clay/[0.05] px-5 py-3">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-clay">
          Route change · affects stays and the last day
        </p>
        {applied && (
          <Badge className="bg-pine text-white" data-testid="change-applied-badge">
            <Check className="size-3" /> Applied
          </Badge>
        )}
      </div>

      <div className="grid gap-px bg-hairline md:grid-cols-2">
        {[CURRENT, PROPOSED].map((col, idx) => {
          const isProposed = idx === 1;
          return (
            <div
              key={col.label}
              className={cn("bg-card px-5 py-4", isProposed && "bg-clay/[0.025]")}
              data-testid={isProposed ? "diff-column-proposed" : "diff-column-current"}
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {applied && !isProposed ? "Previous plan" : col.label}
                </span>
              </div>
              <RouteChain route={col.route} tone={isProposed ? "accent" : "muted"} />
              <dl className="mt-4 space-y-2.5">
                {col.rows.map((r) => (
                  <div key={r.k} className="grid grid-cols-[7.5rem_1fr] gap-2">
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">{r.k}</dt>
                    <dd className="text-sm leading-relaxed text-foreground/90">{r.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          );
        })}
      </div>

      <div className="border-t border-hairline px-5 py-4">
        <h4 className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Why sequence matters here
        </h4>
        <ul className="space-y-2">
          {IMPACTS.map((i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed text-foreground/85">
              <span className="mt-2 size-1 shrink-0 rounded-full bg-clay" />
              {i}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2 border-t border-hairline bg-linen/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {applied
            ? "Current Plan now starts in Macau. You can put it back."
            : "Nothing changes until you say so."}
        </p>
        <div className="flex gap-2">
          {applied ? (
            <Button variant="outline" onClick={onUndo} data-testid="undo-change-button">
              <Undo2 className="size-4" /> Undo this change
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={onKeep} data-testid="keep-current-order-button">
                Keep current order
              </Button>
              <Button onClick={onApply} data-testid="apply-change-button">
                <Check className="size-4" /> Apply — Macau first
              </Button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
