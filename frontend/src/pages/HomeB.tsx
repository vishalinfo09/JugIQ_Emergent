import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ChatMessage, TypingIndicator } from "@/components/jugiq/ChatMessage";
import { BookingComparison } from "@/components/jugiq/BookingComparison";
import { MarkBookedDialog } from "@/components/jugiq/MarkBookedDialog";
import { WorkspacePanel, type GroupStance } from "@/components/jugiq-b/WorkspacePanel";
import { SketchTimeline } from "@/components/jugiq-b/SketchTimeline";
import { ChangeImpact } from "@/components/jugiq-b/ChangeImpact";
import { GroupProposal } from "@/components/jugiq-b/GroupProposal";
import {
  AGREED_SLOW_DAY,
  CHANGE_MESSAGES,
  FIRST_SKETCH_MESSAGES,
  GROUP_MEMBERS,
  GROUP_MESSAGES,
  GROUP_OPEN_DECISIONS,
  GROUP_REVISED_DECISIONS,
  makeFreshPlan,
  makeGroupPlan,
  makeMaturePlan,
  MATURE_MESSAGES,
  NEW_TRIP_MESSAGES,
  NEW_TRIP_PROMPT,
  PROTOTYPE_STATES,
  STARTER_CHIPS,
  type Artifact,
  type BookingDetails,
  type ChatMsg,
  type MarkTarget,
  type Plan,
  type StateId,
} from "@/lib/jugiq-data";
import { ChevronRight, LayoutPanelLeft, Send, Sparkle, UserPlus, Users, Wand2 } from "lucide-react";

const SCRIPT: Record<StateId, ChatMsg[]> = {
  "new-trip": NEW_TRIP_MESSAGES,
  "first-sketch": FIRST_SKETCH_MESSAGES,
  "mature-solo": MATURE_MESSAGES,
  "material-change": CHANGE_MESSAGES,
  "group-room": GROUP_MESSAGES,
  "booking-comparison": MATURE_MESSAGES,
};

const PLAN_EXISTS: Record<StateId, boolean> = {
  "new-trip": false,
  "first-sketch": false,
  "mature-solo": true,
  "material-change": true,
  "group-room": true,
  "booking-comparison": true,
};

function planForState(id: StateId): Plan {
  if (id === "group-room") return makeGroupPlan();
  if (id === "mature-solo" || id === "material-change" || id === "booking-comparison")
    return makeMaturePlan();
  return makeFreshPlan();
}

let counter = 0;
const nextId = () => `b-${++counter}`;

function scriptedReply(text: string, hasPlan: boolean): { text: string; artifact: Artifact } {
  const t = text.toLowerCase();
  if (/macau first|reverse|other way|swap the order|macau before/.test(t))
    return {
      text: "That reverses the whole route, and it runs into a hotel you've already booked. Here's the impact laid out — adopt it only if it still works for you.",
      artifact: "diff",
    };
  if (!hasPlan && /\bdays?\b|december|bangalore|hong kong|macau|nights?|thinking/.test(t))
    return {
      text: "Eight days suits those two well, and pairing them saves a second long-haul. Here's a route to react to.",
      artifact: "sketch",
    };
  if (/ferry|bridge|cross/.test(t))
    return {
      text: "Ferry is quicker from Tsim Sha Tsui; the bridge coach is cheaper and steadier in wind. I've left it in the workspace as an open decision — it's a genuine trade-off.",
      artifact: null,
    };
  if (/price|cost|book|cheap|compare|ticket/.test(t))
    return {
      text: "Open Compare on the Peak Tram decision in the workspace and I'll lay the sources side by side — ranked on real traveller value, not who pays us.",
      artifact: null,
    };
  return {
    text: "Noted. I've kept the workspace in sync — nothing moves until a change is big enough to be worth showing you side by side first.",
    artifact: null,
  };
}

export default function HomeB() {
  const [stateId, setStateId] = useState<StateId>("new-trip");
  const [messages, setMessages] = useState<ChatMsg[]>(SCRIPT["new-trip"]);
  const [plan, setPlan] = useState<Plan>(makeFreshPlan());
  const [planActive, setPlanActive] = useState(false);
  const [mobileWsOpen, setMobileWsOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [changeApplied, setChangeApplied] = useState(false);
  const [groupApplied, setGroupApplied] = useState(false);
  const [routeGlow, setRouteGlow] = useState(false);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const [markTarget, setMarkTarget] = useState<MarkTarget | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const current = useMemo(
    () => PROTOTYPE_STATES.find((s) => s.id === stateId) ?? PROTOTYPE_STATES[0],
    [stateId],
  );
  const isGroup = stateId === "group-room";
  const nextState = PROTOTYPE_STATES[current.index] ?? null;
  const showHero = stateId === "new-trip";
  const hkBooked = plan.stops.some((s) => s.id === "hk" && s.stayStatus === "booked");

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const groupStance: GroupStance | undefined = isGroup
    ? {
        agreed: groupApplied
          ? ["Hong Kong 5 nights", "Macau 3 nights", "A slow, unstructured day in Hong Kong"]
          : ["Hong Kong 5 nights", "Macau 3 nights"],
        unresolved: groupApplied
          ? ["Saturday show vs early Sunday flight"]
          : ["Big-day outings vs a slower pace", "Saturday show vs early Sunday flight"],
      }
    : undefined;

  function goToState(id: StateId) {
    setStateId(id);
    setMessages(SCRIPT[id]);
    setPlanActive(PLAN_EXISTS[id]);
    setMobileWsOpen(false);
    setChangeApplied(false);
    setGroupApplied(false);
    setTyping(false);
    setDraft("");
    setMarkTarget(null);
    setPlan(planForState(id));
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
      { id: nextId(), kind: "user", time: "now", text, ...(isGroup ? { author: "You", initials: "YO" } : {}) },
    ]);
    if (isGroup && !/@jugiq/i.test(text)) return;
    const reply = scriptedReply(text, stateId !== "new-trip");
    pushJugiq(reply.text, reply.artifact);
  }

  function usePlan() {
    setPlan(makeFreshPlan());
    setPlanActive(true);
    setStateId("mature-solo");
    setMessages([
      ...SCRIPT["first-sketch"],
      { id: nextId(), kind: "user", time: "now", text: "Let's go with this." },
      {
        id: nextId(),
        kind: "jugiq",
        time: "now",
        text: "Adopted — it's your Current Plan now, in the workspace on the right. Everything's planned, nothing's booked. Hit Mark as booked whenever you actually lock something in.",
      },
    ]);
    toast.success("Plan adopted into the workspace", {
      description: "Hong Kong 5 nights, then Macau 3 — nothing booked yet.",
    });
  }

  function applyRouteChange() {
    setPlan((p) => {
      const stops = [...p.stops].reverse();
      return {
        ...p,
        stops: stops.map((s) =>
          s.id === "hk" && s.stayStatus === "booked" ? { ...s, bookingConflict: true } : s,
        ),
      };
    });
    setChangeApplied(true);
    setRouteGlow(true);
    window.setTimeout(() => setRouteGlow(false), 1500);
    toast.success("Adopted — Macau first", {
      description: hkBooked
        ? "Planned dates shifted. Your confirmed hotel is preserved and flagged."
        : "Route reversed in the workspace.",
      action: { label: "Undo", onClick: undoRouteChange },
    });
  }

  function undoRouteChange() {
    setPlan((p) => {
      const stops = [...p.stops].reverse();
      return { ...p, stops: stops.map((s) => ({ ...s, bookingConflict: false })) };
    });
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
    pushJugiq("Here's what I'd propose from the discussion — adopt it to update the shared plan.", "revise");
  }

  function applyGroup() {
    setPlan((p) => ({
      ...p,
      stops: p.stops.map((s) =>
        s.id === "hk" && !s.highlights.some((h) => h.label === AGREED_SLOW_DAY.label)
          ? { ...s, highlights: [...s.highlights, { ...AGREED_SLOW_DAY }] }
          : s,
      ),
      decisions: GROUP_REVISED_DECISIONS,
    }));
    setGroupApplied(true);
    toast.success("Adopted into the shared plan", {
      description: "Slow day added; show-vs-flight kept as an Open Decision.",
      action: { label: "Undo", onClick: undoGroup },
    });
  }

  function undoGroup() {
    setPlan((p) => ({
      ...p,
      stops: p.stops.map((s) =>
        s.id === "hk"
          ? { ...s, highlights: s.highlights.filter((h) => h.label !== AGREED_SLOW_DAY.label) }
          : s,
      ),
      decisions: GROUP_OPEN_DECISIONS,
    }));
    setGroupApplied(false);
    toast("Proposal undone");
  }

  function resolveDecision(id: string) {
    const removed = plan.decisions.find((d) => d.id === id);
    setPlan((p) => ({ ...p, decisions: p.decisions.filter((d) => d.id !== id) }));
    toast.success("Decision settled", {
      description: removed?.question,
      action: {
        label: "Undo",
        onClick: () =>
          setPlan((p) => ({ ...p, decisions: removed ? [removed, ...p.decisions] : p.decisions })),
      },
    });
  }

  function confirmBooked(details: BookingDetails) {
    const t = markTarget;
    if (!t) return;
    setPlan((p) => ({
      ...p,
      stops: p.stops.map((s) => {
        if (s.id !== t.stopId) return s;
        if (t.kind === "stay")
          return { ...s, stayStatus: "booked", stayBooking: details, bookingConflict: false };
        return {
          ...s,
          highlights: s.highlights.map((h) =>
            h.label === t.label ? { ...h, status: "booked", booking: details } : h,
          ),
        };
      }),
    }));
    setMarkTarget(null);
    toast.success("Marked as booked", {
      description: `${t.label}${details.provider ? ` · ${details.provider}` : ""}`,
    });
  }

  function markBookedFromCompare(provider: string) {
    setBookingOpen(false);
    setPlanActive(true);
    setMarkTarget({
      stopId: "hk",
      kind: "highlight",
      label: "Peak Tram + Sky Terrace",
      title: "Peak Tram + Sky Terrace",
      prefill: { provider },
    });
  }

  function renderArtifact(msg: ChatMsg) {
    if (msg.artifact === "sketch")
      return <SketchTimeline onUsePlan={usePlan} onAdjust={() => setMobileWsOpen(true)} />;
    if (msg.artifact === "diff")
      return (
        <ChangeImpact
          applied={changeApplied}
          hasConfirmedBooking={hkBooked}
          onApply={applyRouteChange}
          onUndo={undoRouteChange}
          onKeep={() => toast("Keeping Hong Kong first")}
        />
      );
    if (msg.artifact === "revise")
      return <GroupProposal applied={groupApplied} onApply={applyGroup} onUndo={undoGroup} />;
    return null;
  }

  const workspace = (
    <WorkspacePanel
      plan={plan}
      groupStance={groupStance}
      onCompare={() => setBookingOpen(true)}
      onResolve={resolveDecision}
      onMarkBooked={setMarkTarget}
      highlightRoute={routeGlow}
      className="h-full"
    />
  );

  const attentionCount = plan.decisions.length + plan.stops.filter((s) => s.bookingConflict).length;

  return (
    <div className="flex h-dvh flex-col bg-background">
      <Toaster richColors />

      <header className="sticky top-0 z-30 border-b border-hairline bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[96rem] items-center gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-foreground text-background">
              <Sparkle className="size-3.5" />
            </span>
            <span className="font-heading text-lg font-semibold tracking-tight">JugIQ</span>
            <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-muted-foreground">
              Workspace
            </span>
          </div>
          <span className="hidden h-4 w-px bg-hairline sm:block" />
          {planActive ? (
            <div className="hidden min-w-0 sm:block" data-testid="header-trip-facts">
              <p className="truncate text-sm font-medium">{plan.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {plan.window} · {plan.travellers}
              </p>
            </div>
          ) : (
            <span className="hidden text-sm text-muted-foreground sm:block" data-testid="header-new-trip">
              New trip
            </span>
          )}

          {planActive && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => toast("Invite link copied — anyone with it can join this trip")}
              data-testid="invite-button"
            >
              <UserPlus className="size-4" />
              <span className="hidden sm:inline">Invite</span>
            </Button>
          )}
        </div>

        <div className="border-t border-hairline bg-linen/50">
          <div className="mx-auto flex max-w-[96rem] items-center gap-1 overflow-x-auto px-4 py-2 sm:px-6">
            <span className="mr-1 hidden shrink-0 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground md:inline">
              Prototype
            </span>
            {PROTOTYPE_STATES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goToState(s.id)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-[0.8rem] font-medium transition-colors",
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

      {/* mobile workspace summary bar (progressive disclosure) */}
      {planActive && (
        <button
          type="button"
          onClick={() => setMobileWsOpen(true)}
          className="flex items-center justify-between gap-2 border-b border-hairline bg-parchment px-4 py-2 text-left lg:hidden"
          data-testid="mobile-workspace-bar"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <LayoutPanelLeft className="size-4 text-clay" /> Trip workspace
          </span>
          <span className="flex items-center gap-1 text-[0.72rem] text-muted-foreground">
            {attentionCount} need attention
            <ChevronRight className="size-3.5" />
          </span>
        </button>
      )}

      <div className="mx-auto flex w-full max-w-[96rem] min-h-0 flex-1">
        <main className="flex min-w-0 flex-1 flex-col">
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            <div className="mx-auto w-full max-w-2xl space-y-6">
              {showHero && (
                <div className="pb-2 pt-6 sm:pt-12" data-testid="new-trip-hero">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-clay">
                    New trip
                  </p>
                  <h1 className="mt-2 max-w-xl font-heading text-3xl leading-[1.15] sm:text-[2.5rem]">
                    Tell me the trip, I'll build the workspace around it.
                  </h1>
                  <p className="mt-3 max-w-lg text-[0.98rem] leading-relaxed text-muted-foreground">
                    Say it however feels natural — rough dates, who's coming, anywhere you're curious
                    about. The plan and decisions take shape as we talk.
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
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[0.68rem] text-muted-foreground">
                    JugIQ replies only when you ask
                  </span>
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
            <div className="mx-auto w-full max-w-2xl">
              {showHero && (
                <div className="mb-2.5 flex flex-wrap gap-1.5" data-testid="starter-chips">
                  {STARTER_CHIPS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setDraft((d) => (d ? `${d} ${c}.` : `${c}. `))}
                      className="rounded-full border border-hairline bg-card px-3 py-1 text-[0.8rem] text-muted-foreground transition-colors hover:border-clay/40 hover:text-foreground"
                      data-testid={`chip-${c.slice(0, 8).toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {c}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setDraft(NEW_TRIP_PROMPT)}
                    className="rounded-full border border-clay/30 bg-clay/[0.06] px-3 py-1 text-[0.8rem] text-clay"
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
                    className="rounded-full border border-hairline bg-card px-3 py-1 text-[0.8rem] text-muted-foreground transition-colors hover:border-clay/40 hover:text-foreground"
                    data-testid="chip-macau-first"
                  >
                    Actually, let's do Macau first.
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingOpen(true)}
                    className="rounded-full border border-hairline bg-card px-3 py-1 text-[0.8rem] text-muted-foreground transition-colors hover:border-clay/40 hover:text-foreground"
                    data-testid="chip-compare-peak-tram"
                  >
                    Compare Peak Tram options
                  </button>
                </div>
              )}

              {isGroup && (
                <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
                  <Button size="xs" variant="outline" onClick={() => setDraft("@JugIQ ")} data-testid="ask-jugiq-button">
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

              <div className="flex items-end gap-2 rounded-2xl border border-hairline bg-card p-2 transition-colors focus-within:border-clay/45">
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

        {planActive && (
          <aside
            className="hidden shrink-0 border-l border-hairline lg:flex lg:w-[38%] xl:w-[36%]"
            data-testid="workspace-aside"
          >
            {workspace}
          </aside>
        )}
      </div>

      <Sheet open={mobileWsOpen} onOpenChange={setMobileWsOpen}>
        <SheetContent side="bottom" className="h-[88dvh] p-0" data-testid="mobile-workspace-sheet">
          <SheetHeader className="sr-only">
            <SheetTitle>Trip workspace</SheetTitle>
          </SheetHeader>
          <div className="h-full overflow-y-auto">{workspace}</div>
        </SheetContent>
      </Sheet>

      <BookingComparison
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        onOpenProvider={(p) =>
          toast(`Opening ${p} in a new tab`, {
            description: "This is just a handoff — it won't mark anything as booked.",
          })
        }
        onMarkBooked={markBookedFromCompare}
      />

      <MarkBookedDialog
        target={markTarget}
        onOpenChange={(o) => !o && setMarkTarget(null)}
        onConfirm={confirmBooked}
      />
    </div>
  );
}
