import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BookingDetails, MarkTarget } from "@/lib/jugiq-data";
import { CheckCircle2 } from "lucide-react";

export function MarkBookedDialog({
  target,
  onOpenChange,
  onConfirm,
}: {
  target: MarkTarget | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (details: BookingDetails) => void;
}) {
  const [details, setDetails] = useState<BookingDetails>({});

  useEffect(() => {
    if (target) setDetails({ ...target.prefill });
  }, [target]);

  const set = (k: keyof BookingDetails) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setDetails((d) => ({ ...d, [k]: e.target.value }));

  return (
    <Dialog open={!!target} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="mark-booked-dialog">
        <DialogHeader className="text-left">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-clay">
            Mark as booked
          </p>
          <DialogTitle className="font-heading text-lg leading-tight">
            {target?.title}
          </DialogTitle>
          <DialogDescription>
            Only confirmation is needed. Everything below is optional — and it's fine if you booked
            this somewhere other than a JugIQ link.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="mb-provider">Where did you book it?</Label>
            <Input
              id="mb-provider"
              value={details.provider ?? ""}
              onChange={set("provider")}
              placeholder="e.g. Klook, hotel direct, Booking.com"
              data-testid="mark-booked-provider"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="mb-dates">Dates / times</Label>
              <Input
                id="mb-dates"
                value={details.dates ?? ""}
                onChange={set("dates")}
                placeholder="20–25 Dec"
                data-testid="mark-booked-dates"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mb-amount">Amount paid</Label>
              <Input
                id="mb-amount"
                value={details.amount ?? ""}
                onChange={set("amount")}
                placeholder="₹ / HK$"
                data-testid="mark-booked-amount"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mb-cancel">Cancellation deadline</Label>
            <Input
              id="mb-cancel"
              value={details.cancellation ?? ""}
              onChange={set("cancellation")}
              placeholder="e.g. Free until 13 Dec"
              data-testid="mark-booked-cancellation"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mb-note">Note</Label>
            <Textarea
              id="mb-note"
              rows={2}
              value={details.note ?? ""}
              onChange={set("note")}
              placeholder="Anything useful to remember"
              className="resize-none"
              data-testid="mark-booked-note"
            />
          </div>
          <p className="text-[0.72rem] leading-relaxed text-muted-foreground">
            We don't ask for passport, card details or confirmation numbers in this prototype.
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} data-testid="mark-booked-cancel">
            Cancel
          </Button>
          <Button onClick={() => onConfirm(details)} data-testid="mark-booked-confirm">
            <CheckCircle2 className="size-4" /> Confirm booked
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
