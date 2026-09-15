import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IMAGES } from "@/lib/jugiq-data";
import { ArrowRight, TriangleAlert, Scale, CircleHelp } from "lucide-react";

const LEGS = [
  {
    id: "hk",
    city: "Hong Kong",
    nights: "5 nights",
    image: IMAGES.hongKong,
    line: "Land, settle, and give the big days somewhere to spread out.",
  },
  {
    id: "macau",
    city: "Macau",
    nights: "3 nights",
    image: IMAGES.macau,
    line: "Slower, walkable, and a soft landing before the flight home.",
  },
];

const TRADEOFFS = [
  "Five nights in Hong Kong is generous. If you'd rather have a beach day or Shenzhen, this is the night to borrow.",
  "Three nights in Macau is right for heritage plus one resort day — it would feel thin if you also want a day trip.",
];

const FEASIBILITY = [
  "Late December is peak for both. Attraction slots and the better family rooms in Cotai tend to close out four to six weeks ahead.",
  "Macau and Hong Kong are separate entry points. It's straightforward on an Indian passport, but it is two crossings, not one.",
];

const DECISIONS = [
  "Ferry or the sea bridge for the crossing",
  "Ocean Park or Disneyland for the big kid day",
  "Whether the last night is Macau or back in Hong Kong",
];

export function FirstSketchCard({
  onUsePlan,
  onOpenDecision,
}: {
  onUsePlan: () => void;
  onOpenDecision: () => void;
}) {
  return (
    <article
      className="overflow-hidden rounded-2xl border border-hairline bg-card shadow-[0_2px_8px_rgba(28,25,23,0.04),0_12px_24px_rgba(28,25,23,0.03)]"
      data-testid="first-sketch-card"
    >
      <div className="flex items-start justify-between gap-4 border-b border-hairline px-5 py-4 sm:px-6">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-clay">
            First sketch
          </p>
          <h3 className="mt-1 font-heading text-xl leading-tight sm:text-[1.45rem]">
            Hong Kong first, then wind down in Macau
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            8 days · 20–27 December · from Bangalore
          </p>
        </div>
        <Badge variant="secondary" className="hidden shrink-0 sm:inline-flex">
          Draft — nothing booked
        </Badge>
      </div>

      <div className="grid gap-px bg-hairline sm:grid-cols-2">
        {LEGS.map((leg, i) => (
          <div key={leg.id} className="bg-card" data-testid={`sketch-leg-${leg.id}`}>
            <div className="relative h-32 overflow-hidden sm:h-36">
              <img
                src={leg.image}
                alt={leg.city}
                className="size-full object-cover transition-transform duration-500 hover:scale-[1.04]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[rgba(28,25,23,0.15)] to-[rgba(28,25,23,0.72)]" />
              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                <div>
                  <div className="text-[0.68rem] uppercase tracking-[0.16em] text-white/75">
                    Stop {i + 1}
                  </div>
                  <div className="font-heading text-lg leading-tight">{leg.city}</div>
                </div>
                <div className="font-mono text-xs text-white/90">{leg.nights}</div>
              </div>
            </div>
            <p className="px-5 py-3 text-sm leading-relaxed text-muted-foreground">{leg.line}</p>
          </div>
        ))}
      </div>

      <div className="space-y-5 px-5 py-5 sm:px-6">
        <section>
          <h4 className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Why this order
          </h4>
          <p className="text-[0.95rem] leading-relaxed text-foreground/90">
            Your flight lands in Hong Kong, so starting there costs you nothing on day one. It also
            keeps the busiest days early, while everyone still has energy, and leaves Macau — smaller,
            slower, mostly walkable — for the tail end when a ten-year-old is running out of patience.
            The crossing happens once, mid-trip, instead of twice.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-hairline bg-linen/60 p-4">
            <h4 className="mb-2 flex items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <Scale className="size-3.5" /> Trade-offs
            </h4>
            <ul className="space-y-2">
              {TRADEOFFS.map((t) => (
                <li key={t} className="text-sm leading-relaxed text-foreground/85">
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-clay/20 bg-clay/[0.04] p-4">
            <h4 className="mb-2 flex items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-clay">
              <TriangleAlert className="size-3.5" /> Worth knowing now
            </h4>
            <ul className="space-y-2">
              {FEASIBILITY.map((t) => (
                <li key={t} className="text-sm leading-relaxed text-foreground/85">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <h4 className="mb-2 flex items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <CircleHelp className="size-3.5" /> Open decisions
          </h4>
          <ul className="flex flex-wrap gap-2">
            {DECISIONS.map((d) => (
              <li key={d}>
                <button
                  type="button"
                  onClick={onOpenDecision}
                  className="rounded-full border border-hairline bg-card px-3 py-1.5 text-sm text-foreground/85 transition-[border-color,background-color,transform] hover:-translate-y-px hover:border-clay/40 hover:bg-clay/[0.06]"
                  data-testid={`sketch-decision-${d.slice(0, 12).toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {d}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="flex flex-col gap-2 border-t border-hairline bg-linen/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-xs text-muted-foreground">
          Nothing here is locked. Change anything by saying so.
        </p>
        <Button onClick={onUsePlan} data-testid="use-this-plan-button" className="group">
          Use this plan
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Button>
      </div>
    </article>
  );
}
