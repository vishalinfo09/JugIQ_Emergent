import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, CircleHelp, Undo2, Users } from "lucide-react";

const AGREED = [
  {
    who: "Priya, then Arjun",
    change: "Hong Kong stays at 5 nights",
    why: "Priya withdrew the objection once the islands and hikes came up.",
    intoPlan: false,
  },
  {
    who: "Priya",
    change: "A slow, unstructured day added in Hong Kong",
    why: "She asked for one slow day rather than a third big outing.",
    intoPlan: true,
  },
  {
    who: "Everyone",
    change: "Macau stays at 3 nights",
    why: "Nobody argued for more or less.",
    intoPlan: false,
  },
];

export function ReviseSynthesisCard({
  applied,
  onApply,
  onUndo,
}: {
  applied: boolean;
  onApply: () => void;
  onUndo: () => void;
}) {
  return (
    <article
      className="overflow-hidden rounded-2xl border border-hairline bg-card shadow-[0_2px_8px_rgba(28,25,23,0.04)]"
      data-testid="revise-synthesis-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline px-5 py-3">
        <p className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-clay">
          <Users className="size-3.5" /> Revised from your discussion
        </p>
        {applied && (
          <Badge className="bg-pine text-white" data-testid="revise-applied-badge">
            <Check className="size-3" /> Applied
          </Badge>
        )}
      </div>

      <div className="px-5 py-4">
        <p className="text-[0.95rem] leading-relaxed text-foreground/90">
          I read back through the discussion. Most of it settled on its own — I've folded that into
          the plan. One thing stayed split, so I've left it open rather than picking a side.
        </p>

        <h4 className="mb-2 mt-4 flex items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-pine">
          <Check className="size-3.5" /> Incorporated into the plan
        </h4>
        <ul className="space-y-2.5">
          {AGREED.map((a) => (
            <li key={a.change} className="flex gap-2.5">
              <Check className="mt-0.5 size-4 shrink-0 text-pine" />
              <div>
                <p className="text-sm font-medium">
                  {a.change}
                  {a.intoPlan && (
                    <span className="ml-2 rounded-full bg-pine/12 px-1.5 py-0.5 text-[0.62rem] font-medium text-pine">
                      added to Current Plan
                    </span>
                  )}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {a.why} <span className="text-foreground/50">— {a.who}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div
          className="mt-4 rounded-xl border border-clay/25 bg-clay/[0.04] p-4"
          data-testid="unresolved-open-decision"
        >
          <h4 className="mb-1.5 flex items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-clay">
            <CircleHelp className="size-3.5" /> Left unresolved — kept as an Open Decision
          </h4>
          <p className="text-sm font-medium">
            Keep the Saturday show, or take the early Sunday flight home?
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Rohan wants the show; Arjun wants to be back for Monday. Both are reasonable, and it
            isn't mine to settle — so it goes to Open Decisions rather than being forced either way.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-hairline bg-linen/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {applied
            ? "Current Plan updated for everyone in this room."
            : "Nothing is applied until someone here says so."}
        </p>
        {applied ? (
          <Button variant="outline" onClick={onUndo} data-testid="undo-revise-button">
            <Undo2 className="size-4" /> Undo
          </Button>
        ) : (
          <Button onClick={onApply} data-testid="apply-revise-button">
            <Check className="size-4" /> Apply to Current Plan
          </Button>
        )}
      </div>
    </article>
  );
}
