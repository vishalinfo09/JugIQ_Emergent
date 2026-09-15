import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  BOOKING_OPTIONS,
  BOOKING_SUBJECT,
  COVERAGE_NOTE,
  NEUTRALITY_NOTE,
  type BookingOption,
} from "@/lib/jugiq-data";
import { Check, Clock, ExternalLink, Info, ShieldCheck } from "lucide-react";

const TONE: Record<"good" | "fair" | "poor", string> = {
  good: "text-pine",
  fair: "text-muted-foreground",
  poor: "text-destructive",
};

function OptionRow({ opt, rank }: { opt: BookingOption; rank: number }) {
  return (
    <li
      className={cn(
        "rounded-xl border border-hairline bg-card p-4 transition-[border-color,transform] hover:-translate-y-px hover:border-clay/35",
        rank === 1 && "border-clay/30 bg-clay/[0.03]",
      )}
      data-testid={`booking-option-${opt.id}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-[0.7rem] font-semibold text-secondary-foreground">
            {rank}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-heading text-base font-semibold">{opt.provider}</span>
              {opt.monetised && (
                <Badge
                  variant="outline"
                  className="text-[0.62rem] font-normal text-muted-foreground"
                  data-testid={`commission-tag-${opt.id}`}
                >
                  JugIQ may earn a commission
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{opt.headline}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-base font-semibold">{opt.price}</div>
          <div className="flex items-center justify-end gap-1 text-[0.68rem] text-pine">
            <ShieldCheck className="size-3" /> {opt.priceNote}
          </div>
        </div>
      </div>

      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-[0.66rem] uppercase tracking-wide text-muted-foreground">
            Cancellation
          </dt>
          <dd className={cn("leading-snug", TONE[opt.cancellationTone])}>{opt.cancellation}</dd>
        </div>
        <div>
          <dt className="text-[0.66rem] uppercase tracking-wide text-muted-foreground">
            Availability
          </dt>
          <dd className={cn("leading-snug", TONE[opt.availabilityTone])}>{opt.availability}</dd>
        </div>
        <div>
          <dt className="text-[0.66rem] uppercase tracking-wide text-muted-foreground">
            Convenience
          </dt>
          <dd className="leading-snug text-foreground/85">{opt.convenience}</dd>
        </div>
      </dl>

      <ul className="mt-3 flex flex-wrap gap-1.5">
        {opt.inclusions.map((inc) => (
          <li
            key={inc}
            className="flex items-center gap-1 rounded-full bg-linen px-2 py-0.5 text-[0.72rem] text-foreground/80"
          >
            <Check className="size-3 text-pine" /> {inc}
          </li>
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-hairline pt-3">
        <p className="max-w-[34rem] text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground/70">Why here: </span>
          {opt.whyRanked}
        </p>
        <Button size="sm" variant="outline" data-testid={`open-${opt.id}-button`}>
          Open on {opt.provider.split(" ")[0]}
          <ExternalLink className="size-3.5" />
        </Button>
      </div>
    </li>
  );
}

export function BookingComparison({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-3xl"
        data-testid="booking-comparison-dialog"
      >
        <DialogHeader className="border-b border-hairline px-5 py-4 text-left sm:px-6">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-clay">
            Compare
          </p>
          <DialogTitle className="font-heading text-xl">{BOOKING_SUBJECT.title}</DialogTitle>
          <DialogDescription>{BOOKING_SUBJECT.subtitle}</DialogDescription>
          <p
            className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"
            data-testid="price-checked-note"
          >
            <Clock className="size-3.5" /> {BOOKING_SUBJECT.checkedAt}
          </p>
        </DialogHeader>

        <div
          className="flex gap-2.5 border-b border-hairline bg-linen/60 px-5 py-3 sm:px-6"
          data-testid="neutrality-disclosure"
        >
          <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p className="text-xs leading-relaxed text-muted-foreground">{NEUTRALITY_NOTE}</p>
        </div>

        <ul className="space-y-3 px-5 py-5 sm:px-6">
          {BOOKING_OPTIONS.map((o, i) => (
            <OptionRow key={o.id} opt={o} rank={i + 1} />
          ))}
        </ul>

        <p
          className="border-t border-hairline px-5 py-4 text-xs leading-relaxed text-muted-foreground sm:px-6"
          data-testid="coverage-disclosure"
        >
          {COVERAGE_NOTE}
        </p>
      </DialogContent>
    </Dialog>
  );
}
