import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Check, ShieldCheck, TriangleAlert, Undo2 } from "lucide-react";

const EFFECTS = [
  { k: "Last day", v: "Easier — you end in Hong Kong, so airport express and a shorter buffer." },
  { k: "First day", v: "Harder — a morning arrival then straight onto the ferry with a tired 10-year-old." },
  { k: "Crossing", v: "Still just once, now on day 4 instead of day 6." },
  { k: "Hong Kong nights", v: "Shift later in the trip — which is what clashes with the confirmed booking." },
];

function MiniRoute({ order, tone }: { order: string[]; tone: "muted" | "accent" }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {order.map((c, i) => (
        <span key={c} className="flex items-center gap-1.5">
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-sm font-medium",
              tone === "accent"
                ? "bg-clay/12 text-clay ring-1 ring-clay/25"
                : "bg-secondary text-secondary-foreground",
            )}
          >
            {c}
          </span>
          {i < order.length - 1 && <ArrowRight className="size-3.5 text-muted-foreground" />}
        </span>
      ))}
    </div>
  );
}

export function ChangeImpact({
  applied,
  hasConfirmedBooking,
  onApply,
  onUndo,
  onKeep,
}: {
  applied: boolean;
  hasConfirmedBooking: boolean;
  onApply: () => void;
  onUndo: () => void;
  onKeep: () => void;
}) {
  return (
    <article
      className="rounded-xl border border-clay/25 bg-card"
      data-testid="change-impact"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline px-5 py-3">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-clay">
          Route change — see the impact before you adopt it
        </p>
        {applied && (
          <span
            className="flex items-center gap-1 rounded-full bg-pine px-2 py-0.5 text-[0.68rem] font-medium text-white"
            data-testid="change-applied-badge"
          >
            <Check className="size-3" /> Applied
          </span>
        )}
      </div>

      {/* adopted vs proposed */}
      <div className="grid gap-3 px-5 py-4 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {applied ? "Previous" : "Adopted now"}
          </p>
          <MiniRoute order={["Hong Kong", "Macau"]} tone="muted" />
        </div>
        <div data-testid="change-proposed">
          <p className="mb-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-clay">
            {applied ? "Now adopted" : "Proposed"}
          </p>
          <MiniRoute order={["Macau", "Hong Kong"]} tone="accent" />
        </div>
      </div>

      {/* downstream effects */}
      <div className="border-t border-hairline px-5 py-4">
        <h4 className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Downstream effects
        </h4>
        <dl className="space-y-2">
          {EFFECTS.map((e) => (
            <div key={e.k} className="grid grid-cols-[6.5rem_1fr] gap-2">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">{e.k}</dt>
              <dd className="text-sm leading-relaxed text-foreground/90">{e.v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {hasConfirmedBooking && (
        <div
          className="flex gap-2.5 border-t border-hairline bg-amber-500/[0.07] px-5 py-4"
          data-testid="change-booking-conflict"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-700" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Your Hong Kong hotel stays booked (20–25 Dec)
            </p>
            <p className="mt-1 flex items-start gap-1.5 text-sm leading-relaxed text-foreground/85">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-pine" />
              Adopting this moves your <span className="font-medium">planned</span> dates only. The
              reservation is a real-world fact — JugIQ won't cancel, move or rebook it, and will flag
              it as needing attention if the new dates no longer match.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 border-t border-hairline px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {applied
            ? hasConfirmedBooking
              ? "Adopted — booked hotel preserved and flagged in the workspace."
              : "Adopted — you can put it back."
            : "Nothing changes until you adopt it."}
        </p>
        <div className="flex gap-2">
          {applied ? (
            <Button variant="outline" onClick={onUndo} data-testid="undo-change-button">
              <Undo2 className="size-4" /> Undo
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
