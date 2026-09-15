import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, CircleHelp, Undo2, Users } from "lucide-react";

const AGREED = [
  {
    who: "Priya, then Arjun",
    change: "Hong Kong stays at 5 nights",
    why: "Priya withdrew the objection once the islands and hikes came up.",
  },
  {
    who: "Priya",
    change: "One unstructured day added in Hong Kong",
    why: "Asked for a slow day rather than a third big outing. Slotted on day 4.",
  },
  {
    who: "Everyone",
    change: "Macau stays at 3 nights",
    why: "Nobody argued for more or less.",
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
        <p className="font-heading text-[1rem] leading-[1.7] text-foreground/90">
          I read back through the last twenty messages. Three things settled on their own, and one
          didn't — so I've left that one open rather than picking a side.
        </p>

        <h4 className="mb-2 mt-4 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Settled in conversation
        </h4>
        <ul className="space-y-2.5">
          {AGREED.map((a) => (
            <li key={a.change} className="flex gap-2.5">
              <Check className="mt-0.5 size-4 shrink-0 text-pine" />
              <div>
                <p className="text-sm font-medium">{a.change}</p>
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
            <CircleHelp className="size-3.5" /> Still open — kept as a decision
          </h4>
          <p className="text-sm font-medium">
            Keep the Saturday show, or take the early Sunday flight home?
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Rohan wants the show; Arjun wants to be back for Monday. Both are reasonable, and it
            isn't mine to settle. It's now in Open Decisions so it doesn't get lost in the thread.
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
