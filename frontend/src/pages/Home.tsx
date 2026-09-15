import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ChatMessage, TypingIndicator } from "@/components/jugiq/ChatMessage";
import { FirstSketchCard } from "@/components/jugiq/FirstSketchCard";
import { MaterialChangeDiff } from "@/components/jugiq/MaterialChangeDiff";
import { CurrentPlanPanel } from "@/components/jugiq/CurrentPlanPanel";
import { BookingComparison } from "@/components/jugiq/BookingComparison";
import { ReviseSynthesisCard } from "@/components/jugiq/ReviseSynthesisCard";
import {
  BASE_DECISIONS,
  CHANGE_MESSAGES,
  FIRST_SKETCH_MESSAGES,
  GROUP_MEMBERS,
  GROUP_MESSAGES,
  GROUP_OPEN_DECISIONS,
  GROUP_REVISED_DECISIONS,
  HK_STOP,
  INITIAL_PLAN,
  MACAU_STOP,
  MATURE_MESSAGES,
  NEW_TRIP_MESSAGES,
  NEW_TRIP_PROMPT,
  PROTOTYPE_STATES,
  STARTER_CHIPS,
  type Artifact,
  type ChatMsg,
  type Plan,
  type StateId,
} from "@/lib/jugiq-data";
import {
  ArrowRight,
  ChevronRight,
  ListChecks,
  PanelRightClose,
  PanelRightOpen,
  Send,
  Sparkle,
  UserPlus,
  Users,
  Wand2,
} from "lucide-react";

const SCRIPT: Record<StateId, ChatMsg[]> = {
  "new-trip": NEW_TRIP_MESSAGES,
  "first-sketch": FIRST_SKETCH_MESSAGES,
  "mature-solo": MATURE_MESSAGES,
  "material-change": CHANGE_MESSAGES,
  "group-room": GROUP_MESSAGES,
  "booking-comparison": MATURE_MESSAGES,
};

const PLAN_VISIBLE_BY_DEFAULT: Record<StateId, boolean> = {
  "new-trip": false,
  "first-sketch": false,
  "mature-solo": true,
  "material-change": true,
  "group-room": true,
  "booking-comparison": true,
};

let counter = 0;
const nextId = () => `gen-${++counter}`;

function scriptedReply(text: string, hasPlan: boolean): { text: string; artifact: Artifact } {
  const t = text.toLowerCase();
  if (/macau first|reverse|other way|swap the order|macau before/.test(t)) {
    return {
      text: "That's a real change rather than a tweak — it moves your stays, the crossing and the last day. Here's the difference side by side.",
      artifact: "diff",
    };
  }
  // A trip brief always wins over the narrower topic rules below, but only
  // before a Current Plan exists — afterwards the topic rules are the useful ones.
  if (!hasPlan && /\bdays?\b|december|bangalore|hong kong|macau|nights?|thinking/.test(t)) {
    return {
      text: "Eight days is a comfortable amount for those two, and pairing them saves you a second long-haul. Here's where I'd start.",
      artifact: "sketch",
    };
  }
  if (/ferry|bridge|cross/.test(t)) {
    return {
      text: "The ferry is about an hour and leaves close to where you're staying. The bridge coach is cheaper and steadier when December wind picks up, but adds a transfer at each end. I've kept it in Open Decisions — it's a genuine trade-off.",
      artifact: null,
    };
  }
  if (/price|cost|book|cheap|compare|ticket/.test(t)) {
    return {
      text: "I can lay the options side by side — verified price, what's actually included, and how cancellable each one is. Open Compare on the Peak Tram decision in the Current Plan and you'll see how I rank them.",
      artifact: null,
    };
  }
  if (/kid|child|10|ten|son|daughter/.test(t)) {
    return {
      text: "With a ten-year-old I'd protect the mornings and keep one unplanned afternoon per city. Both cities are easy to move around in, so a day that collapses isn't a disaster.",
      artifact: null,
    };
  }
  return {
    text: "Got it — I've taken that in. Nothing in the Current Plan moves until a change is big enough to be worth showing you, and then I'll put the before and after next to each other first.",
    artifact: null,
  };
}

export default function Home() {
  const [stateId, setStateId] = useState<StateId>("new-trip");
  const [messages, setMessages] = useState<ChatMsg[]>(SCRIPT["new-trip"]);
  const [plan, setPlan] = useState<Plan>(INITIAL_PLAN);
  const [planOpen, setPlanOpen] = useState(false);
  const [mobilePlanOpen, setMobilePlanOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [changeApplied, setChangeApplied] = useState(false);
  const [reviseApplied, setReviseApplied] = useState(false);
  const [routeGlow, setRouteGlow] = useState(false);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const current = useMemo(
    () => PROTOTYPE_STATES.find((s) => s.id === stateId) ?? PROTOTYPE_STATES[0],
    [stateId],
  );
  const isGroup = stateId === "group-room";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  function goToState(id: StateId) {
    setStateId(id);
    setMessages(SCRIPT[id]);
    setPlanOpen(PLAN_VISIBLE_BY_DEFAULT[id]);
    setMobilePlanOpen(false);
    setChangeApplied(false);
    setReviseApplied(false);
    setTyping(false);
    setDraft("");
    setPlan({
      ...INITIAL_PLAN,
      stops: [HK_STOP, MACAU_STOP],
      decisions: id === "group-room" ? GROUP_OPEN_DECISIONS : BASE_DECISIONS,
    });
    setBookingOpen(id === "booking-comparison");
  }

  function pushJugiq(text: string, artifact: Artifact = null) {
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { id: nextId(), kind: "jugiq", time: "now", text, artifact }]);
    }, 650);
  }

  function send() {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    setMessages((m) => [
      ...m,
      {
        id: nextId(),
        kind: "user",
        time: "now",
        text,
        ...(isGroup ? { author: "You", initials: "YO" } : {}),
      },
    ]);

    if (isGroup && !/@jugiq/i.test(text)) return;
    const reply = scriptedReply(text, stateId !== "new-trip");
    if (reply.artifact === "sketch") setPlanOpen(false);
    pushJugiq(reply.text, reply.artifact);
  }

  function usePlan() {
    setPlanOpen(true);
    setStateId("mature-solo");
    setMessages([
      ...SCRIPT["first-sketch"],
      {
        id: nextId(),
        kind: "user",
        time: "now",
        text: "Let's go with this.",
      },
      {
        id: nextId(),
        kind: "jugiq",
        time: "now",
        text: "Done — that's your Current Plan now, on the right. Three things are still open, and nothing is booked yet.",
      },
    ]);
    toast.success("Current Plan created", {
      description: "Hong Kong 5 nights, then Macau 3 nights.",
    });
  }

  function applyRouteChange() {
    setPlan((p) => ({ ...p, stops: [...p.stops].reverse() }));
    setChangeApplied(true);
    setPlanOpen(true);
    setRouteGlow(true);
    window.setTimeout(() => setRouteGlow(false), 1500);
    toast.success("Current Plan updated — Macau first", {
      description: "Stays and the last day shifted with it.",
      action: { label: "Undo", onClick: undoRouteChange },
    });
  }

  function undoRouteChange() {
    setPlan((p) => ({ ...p, stops: [HK_STOP, MACAU_STOP] }));
    setChangeApplied(false);
    setRouteGlow(true);
    window.setTimeout(() => setRouteGlow(false), 1500);
    toast("Back to Hong Kong first");
  }

  function reviseTrip() {
    setMessages((m) => [
      ...m,
      { id: nextId(), kind: "user", author: "You", initials: "YO", time: "now", text: "Revise Trip" },
    ]);
    pushJugiq(
      "I read back through the discussion. Here's what settled, and the one thing that didn't.",
      "revise",
    );
  }

  function askJugiq() {
    setDraft("@JugIQ ");
  }

  function applyRevise() {
    setPlan((p) => ({ ...p, decisions: GROUP_REVISED_DECISIONS }));
    setReviseApplied(true);
    setPlanOpen(true);
    toast.success("Current Plan updated for the room", {
      description: "One disagreement kept as an Open Decision.",
      action: { label: "Undo", onClick: undoRevise },
    });
  }

  function undoRevise() {
    setPlan((p) => ({ ...p, decisions: GROUP_OPEN_DECISIONS }));
    setReviseApplied(false);
    toast("Revision undone");
  }

  function resolveDecision(id: string) {
    const removed = plan.decisions.find((d) => d.id === id);
    setPlan((p) => ({ ...p, decisions: p.decisions.filter((d) => d.id !== id) }));
    toast.success("Decision settled", {
      description: removed?.question,
      action: {
        label: "Undo",
        onClick: () =>
          setPlan((p) => ({
            ...p,
            decisions: removed ? [removed, ...p.decisions] : p.decisions,
          })),
      },
    });
  }

  function renderArtifact(msg: ChatMsg) {
    if (msg.artifact === "sketch")
      return <FirstSketchCard onUsePlan={usePlan} onOpenDecision={() => setPlanOpen(true)} />;
    if (msg.artifact === "diff")
      return (
        <MaterialChangeDiff
          applied={changeApplied}
          onApply={applyRouteChange}
          onUndo={undoRouteChange}
          onKeep={() => toast("Keeping Hong Kong first")}
        />
      );
    if (msg.artifact === "revise")
      return (
        <ReviseSynthesisCard applied={reviseApplied} onApply={applyRevise} onUndo={undoRevise} />
      );
    return null;
  }

  const nextState = PROTOTYPE_STATES[current.index] ?? null;
  const showHero = stateId === "new-trip";

  const planPanel = (
    <CurrentPlanPanel
      plan={plan}
      onCompare={() => setBookingOpen(true)}
      onResolve={resolveDecision}
      highlightRoute={routeGlow}
      className="h-full"
    />
  );

  return (
    <div className="flex h-dvh flex-col bg-background">
      <Toaster richColors />

      <header className="sticky top-0 z-30 border-b border-hairline bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[92rem] items-center gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-foreground text-background">
              <Sparkle className="size-3.5" />
            </span>
            <span className="font-heading text-lg font-semibold tracking-tight">JugIQ</span>
          </div>
          <span className="hidden h-4 w-px bg-hairline sm:block" />
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-medium">{plan.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {plan.window} · {plan.travellers}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toast("Invite link copied — anyone with it can join this trip")}
              data-testid="invite-button"
            >
              <UserPlus className="size-4" />
              <span className="hidden sm:inline">Invite</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobilePlanOpen(true)}
              data-testid="mobile-current-plan-button"
            >
              <ListChecks className="size-4" />
              Plan
              <span className="rounded-full bg-clay px-1.5 font-mono text-[0.65rem] text-white">
                {plan.decisions.length}
              </span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="hidden lg:inline-flex"
              onClick={() => setPlanOpen((v) => !v)}
              aria-expanded={planOpen}
              data-testid="toggle-current-plan-button"
            >
              {planOpen ? (
                <PanelRightClose className="size-4" />
              ) : (
                <PanelRightOpen className="size-4" />
              )}
              Current Plan
            </Button>
          </div>
        </div>

        <div className="border-t border-hairline bg-linen/50">
          <div className="mx-auto flex max-w-[92rem] items-center gap-1 overflow-x-auto px-4 py-2 sm:px-6">
            <span className="mr-1 hidden shrink-0 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground md:inline">
              Prototype
            </span>
            {PROTOTYPE_STATES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goToState(s.id)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-[0.8rem] font-medium transition-[background-color,color,border-color]",
                  s.id === stateId
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
                data-testid={`state-switcher-${s.id}`}
              >
                <span className="mr-1.5 font-mono text-[0.7rem] opacity-60">{s.index}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[92rem] flex-1 overflow-hidden">
        <main className="flex min-w-0 flex-1 flex-col">
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            <div className="mx-auto w-full max-w-3xl space-y-6">
              {showHero && (
                <div className="pb-2 pt-6 sm:pt-12" data-testid="new-trip-hero">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-clay">
                    New trip
                  </p>
                  <h1 className="mt-2 max-w-xl font-heading text-3xl leading-[1.15] sm:text-[2.6rem]">
                    Where are you thinking of going?
                  </h1>
                  <p className="mt-3 max-w-lg text-[0.98rem] leading-relaxed text-muted-foreground">
                    Describe it the way you'd say it out loud. Rough is fine — dates, who's coming,
                    anywhere you're curious about.
                  </p>
                </div>
              )}

              {isGroup && (
                <div
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-hairline bg-card px-4 py-3"
                  data-testid="group-room-header"
                >
                  <Users className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Trip room</span>
                  <div className="flex -space-x-1.5">
                    {GROUP_MEMBERS.map((m) => (
                      <span
                        key={m.name}
                        title={m.name}
                        className="flex size-6 items-center justify-center rounded-full bg-secondary text-[0.6rem] font-semibold text-secondary-foreground ring-2 ring-card"
                      >
                        {m.initials}
                      </span>
                    ))}
                  </div>
                  <Badge variant="secondary" className="text-[0.68rem] font-normal">
                    JugIQ replies only when you ask
                  </Badge>
                </div>
              )}

              {messages.map((m) => (
                <ChatMessage key={m.id} msg={m}>
                  {renderArtifact(m)}
                </ChatMessage>
              ))}

              {typing && <TypingIndicator />}
            </div>
          </div>

          <div className="border-t border-hairline bg-background/90 px-4 py-3 backdrop-blur sm:px-6">
            <div className="mx-auto w-full max-w-3xl">
              {showHero && (
                <div className="mb-2.5 flex flex-wrap gap-1.5" data-testid="starter-chips">
                  {STARTER_CHIPS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setDraft((d) => (d ? `${d} ${c}.` : `${c}. `))}
                      className="rounded-full border border-hairline bg-card px-3 py-1 text-[0.8rem] text-muted-foreground transition-[border-color,color,transform] hover:-translate-y-px hover:border-clay/40 hover:text-foreground"
                      data-testid={`chip-${c.slice(0, 8).toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {c}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setDraft(NEW_TRIP_PROMPT)}
                    className="rounded-full border border-clay/30 bg-clay/[0.06] px-3 py-1 text-[0.8rem] text-clay transition-transform hover:-translate-y-px"
                    data-testid="chip-example-prompt"
                  >
                    Use the example
                  </button>
                </div>
              )}

              {stateId === "mature-solo" && (
                <div className="mb-2.5 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDraft("Actually, let's do Macau first.")}
                    className="rounded-full border border-hairline bg-card px-3 py-1 text-[0.8rem] text-muted-foreground transition-[border-color,color] hover:border-clay/40 hover:text-foreground"
                    data-testid="chip-macau-first"
                  >
                    Actually, let's do Macau first.
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingOpen(true)}
                    className="rounded-full border border-hairline bg-card px-3 py-1 text-[0.8rem] text-muted-foreground transition-[border-color,color] hover:border-clay/40 hover:text-foreground"
                    data-testid="chip-compare-peak-tram"
                  >
                    Compare Peak Tram options
                  </button>
                </div>
              )}

              {isGroup && (
                <div className="mb-2.5 flex flex-wrap gap-1.5">
                  <Button size="xs" variant="outline" onClick={askJugiq} data-testid="ask-jugiq-button">
                    <Sparkle className="size-3" /> Ask JugIQ
                  </Button>
                  <Button size="xs" variant="outline" onClick={reviseTrip} data-testid="revise-trip-button">
                    <Wand2 className="size-3" /> Revise Trip
                  </Button>
                  <span className="self-center text-[0.72rem] text-muted-foreground">
                    Or mention @JugIQ in a message
                  </span>
                </div>
              )}

              <div className="flex items-end gap-2 rounded-2xl border border-hairline bg-card p-2 transition-[border-color] focus-within:border-clay/45">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  rows={1}
                  placeholder={
                    isGroup
                      ? "Message the room — mention @JugIQ to bring it in…"
                      : "Tell JugIQ what you're thinking…"
                  }
                  className="max-h-40 min-h-10 resize-none border-0 bg-transparent px-2 py-2 shadow-none focus-visible:ring-0"
                  data-testid="chat-input"
                />
                <Button
                  size="icon"
                  onClick={send}
                  disabled={!draft.trim()}
                  aria-label="Send message"
                  data-testid="send-message-button"
                >
                  <Send className="size-4" />
                </Button>
              </div>

              {nextState && (
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="truncate text-[0.72rem] text-muted-foreground">
                    Step {current.index} of 6 · {current.blurb}
                  </p>
                  <button
                    type="button"
                    onClick={() => goToState(nextState.id)}
                    className="flex shrink-0 items-center gap-1 text-[0.75rem] font-medium text-clay transition-transform hover:translate-x-0.5"
                    data-testid="next-state-button"
                  >
                    Next: {nextState.label}
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>

        <aside
          className={cn(
            "hidden shrink-0 border-l border-hairline bg-card lg:block",
            planOpen ? "w-[23rem]" : "w-0 overflow-hidden border-l-0",
          )}
          data-testid="current-plan-aside"
        >
          {planOpen && planPanel}
        </aside>
      </div>

      <Sheet open={mobilePlanOpen} onOpenChange={setMobilePlanOpen}>
        <SheetContent
          side="bottom"
          className="h-[85dvh] p-0"
          data-testid="mobile-current-plan-sheet"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Current Plan</SheetTitle>
          </SheetHeader>
          <div className="h-full overflow-y-auto">{planPanel}</div>
        </SheetContent>
      </Sheet>

      <BookingComparison open={bookingOpen} onOpenChange={setBookingOpen} />

      {stateId === "booking-comparison" && !bookingOpen && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 flex justify-center">
          <Button
            className="pointer-events-auto shadow-lg"
            onClick={() => setBookingOpen(true)}
            data-testid="reopen-comparison-button"
          >
            Reopen comparison <ArrowRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
