import { Button } from "@/components/ui/button";
import { IMAGES } from "@/lib/jugiq-data";
import { ArrowRight, ChevronRight } from "lucide-react";

const LEGS = [
  { id: "hk", city: "Hong Kong", nights: "5 nights", dates: "20–25 Dec", image: IMAGES.hongKong },
  { id: "macau", city: "Macau", nights: "3 nights", dates: "25–28 Dec", image: IMAGES.macau },
];

const RATIONALE = [
  "Your flight lands in Hong Kong, so the busy days come first while everyone's fresh.",
  "Macau is smaller and walkable — a softer end before the long flight home.",
  "The cross-border trip happens once, mid-trip, instead of twice.",
];

const FEASIBILITY = [
  "Late December is peak — family rooms in Cotai and attraction slots close out weeks ahead.",
  "Two separate entry points, but straightforward on an Indian passport.",
];

const DECISIONS = [
  "Ferry or the sea bridge for the crossing",
  "Ocean Park or Disneyland for the big kid day",
  "Whether the last night is Macau or back in Hong Kong",
];

export function SketchTimeline({
  onUsePlan,
  onAdjust,
}: {
  onUsePlan: () => void;
  onAdjust: () => void;
}) {
  return (
    <article
      className="rounded-xl border border-hairline bg-card"
      data-testid="sketch-timeline"
    >
      <div className="px-5 pt-4">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-clay">
          Suggested route · 8 days
        </p>
        <h3 className="mt-1 font-heading text-xl leading-tight">
          Hong Kong first, wind down in Macau
        </h3>
      </div>

      {/* concise route timeline */}
      <div className="mt-4 flex items-center gap-2 px-5 sm:gap-3" data-testid="sketch-route">
        {LEGS.map((leg, i) => (
          <div key={leg.id} className="flex flex-1 items-center gap-2 sm:gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg bg-linen/70 p-2.5">
              <img
                src={leg.image}
                alt={leg.city}
                loading="lazy"
                className="size-11 shrink-0 rounded-md object-cover"
              />
              <div className="min-w-0">
                <div className="truncate font-heading text-[0.98rem] leading-tight">{leg.city}</div>
                <div className="font-mono text-[0.7rem] text-muted-foreground">
                  {leg.nights} · {leg.dates}
                </div>
              </div>
            </div>
            {i < LEGS.length - 1 && (
              <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-5 px-5 py-5 sm:grid-cols-2">
        <section>
          <h4 className="mb-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Why this sequence
          </h4>
          <ul className="space-y-1.5">
            {RATIONALE.map((r) => (
              <li key={r} className="text-sm leading-relaxed text-foreground/85">
                {r}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h4 className="mb-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-amber-700">
            Worth knowing now
          </h4>
          <ul className="space-y-1.5">
            {FEASIBILITY.map((f) => (
              <li key={f} className="text-sm leading-relaxed text-foreground/85">
                {f}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="border-t border-hairline px-5 py-3">
        <h4 className="mb-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Still to decide
        </h4>
        <ul>
          {DECISIONS.map((d) => (
            <li key={d}>
              <button
                type="button"
                onClick={onAdjust}
                className="flex w-full items-center justify-between gap-2 py-1.5 text-left text-sm text-foreground/85 transition-colors hover:text-clay"
                data-testid={`sketch-decision-${d.slice(0, 10).toLowerCase().replace(/\s+/g, "-")}`}
              >
                {d}
                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2 border-t border-hairline px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">Nothing's locked. Say the word to change it.</p>
        <Button onClick={onUsePlan} className="group" data-testid="use-this-plan-button">
          Use this plan
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Button>
      </div>
    </article>
  );
}
