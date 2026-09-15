import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, CircleHelp, Undo2 } from "lucide-react";

const PROPOSED = [
  {
    change: "Keep Hong Kong at 5 nights",
    why: "Priya's shorter-stay worry eased once the islands and hikes came up.",
    who: "Priya, Arjun",
    intoPlan: false,
  },
  {
    change: "Add a slow, unstructured day in Hong Kong",
    why: "Priya wanted one slow day rather than a third big outing.",
    who: "Priya",
    intoPlan: true,
  },
  {
    change: "Keep Macau at 3 nights",
    why: "Nobody argued for more or less.",
    who: "Everyone",
    intoPlan: false,
  },
];

export function GroupProposal({
  applied,
  onApply,
  onUndo,
}: {
  applied: boolean;
  onApply: () => void;
  onUndo: () => void;
}) {
  return (
    <article className="rounded-xl border border-hairline bg-card" data-testid="group-proposal">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline px-5 py-3">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-clay">
          {applied ? "Adopted from your discussion" : "Proposed from your discussion"}
        </p>
        {applied && (
          <span
            className="flex items-center gap-1 rounded-full bg-pine px-2 py-0.5 text-[0.68rem] font-medium text-white"
            data-testid="group-applied-badge"
          >
            <Check className="size-3" /> Applied
          </span>
        )}
      </div>

      <div className="px-5 py-4">
        <p className="text-[0.95rem] leading-relaxed text-foreground/90">
          I read back through the recent messages. Here's what I'd propose — nothing changes for the
          group until someone adopts it.
        </p>

        <h4 className="mb-2 mt-4 flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-pine">
          <Check className="size-3.5" /> Broadly agreed
        </h4>
        <ul className="space-y-2.5">
          {PROPOSED.map((p) => (
            <li key={p.change} className="flex gap-2.5">
              <Check className="mt-0.5 size-4 shrink-0 text-pine" />
              <div>
                <p className="text-sm font-medium">
                  {p.change}
                  {p.intoPlan && (
                    <span
                      className={cn(
                        "ml-2 rounded-full px-1.5 py-0.5 text-[0.62rem] font-medium",
                        applied ? "bg-pine/12 text-pine" : "bg-clay/12 text-clay",
                      )}
                    >
                      {applied ? "added to Current Plan" : "will be added on Apply"}
                    </span>
                  )}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {p.why} <span className="text-foreground/50">— {p.who}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div
          className="mt-4 rounded-lg border border-clay/25 bg-clay/[0.04] p-3.5"
          data-testid="group-unresolved"
        >
          <h4 className="mb-1 flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-clay">
            <CircleHelp className="size-3.5" /> Staying unresolved
          </h4>
          <p className="text-sm font-medium">Keep the Saturday show, or take the early Sunday flight?</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Rohan wants the show; Arjun wants to be home for Monday. I won't force this — it goes to
            Open Decisions so the group can settle it.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-hairline px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {applied
            ? "Current Plan updated for everyone in the room."
            : "This is a proposal — adopt it to update the shared plan."}
        </p>
        {applied ? (
          <Button variant="outline" onClick={onUndo} data-testid="undo-group-button">
            <Undo2 className="size-4" /> Undo
          </Button>
        ) : (
          <Button onClick={onApply} data-testid="apply-group-button">
            <Check className="size-4" /> Apply to Current Plan
          </Button>
        )}
      </div>
    </article>
  );
}
