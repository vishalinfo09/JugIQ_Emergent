// Mock fixtures for the JugIQ UX prototype. No backend — everything here is
// scripted sample data for a family trip Bangalore -> Hong Kong + Macau.

export type StateId =
  | "new-trip"
  | "first-sketch"
  | "mature-solo"
  | "material-change"
  | "group-room"
  | "booking-comparison";

export interface PrototypeState {
  id: StateId;
  index: number;
  label: string;
  blurb: string;
}

export const PROTOTYPE_STATES: PrototypeState[] = [
  { id: "new-trip", index: 1, label: "New Trip", blurb: "Start the conversation" },
  { id: "first-sketch", index: 2, label: "First Sketch", blurb: "JugIQ's opening idea" },
  { id: "mature-solo", index: 3, label: "Mature Trip", blurb: "Plan alongside chat" },
  { id: "material-change", index: 4, label: "Plan Change", blurb: "Reverse the route" },
  { id: "group-room", index: 5, label: "Group Room", blurb: "Plan with family" },
  { id: "booking-comparison", index: 6, label: "Compare", blurb: "Neutral booking options" },
];

export type BookStatus = "booked" | "held" | "not-booked";

export interface PlanHighlight {
  label: string;
  status: BookStatus;
  /** id of the Open Decision that must be settled before this can be booked */
  blockedBy?: string;
  /** subtle contextual prompt shown while that decision is still open */
  nudge?: string;
}

export interface PlanStop {
  id: string;
  city: string;
  country: string;
  nights: number;
  stay: string;
  stayStatus: BookStatus;
  /** an Open Decision that becomes relevant to this leg's stay booking */
  stayBlockedBy?: string;
  stayNudge?: string;
  highlights: PlanHighlight[];
  note: string;
}

export interface OpenDecision {
  id: string;
  question: string;
  context: string;
  options: string[];
  comparable?: boolean;
  unresolvedFrom?: string;
}

export interface Plan {
  title: string;
  travellers: string;
  window: string;
  origin: string;
  stops: PlanStop[];
  decisions: OpenDecision[];
}

export const HK_STOP: PlanStop = {
  id: "hk",
  city: "Hong Kong",
  country: "Hong Kong SAR",
  nights: 5,
  stay: "Harbour-side apartment hotel, Tsim Sha Tsui",
  stayStatus: "booked",
  highlights: [
    { label: "Peak Tram + Sky Terrace", status: "not-booked" },
    { label: "Ocean Park full day", status: "held" },
    { label: "Symphony of Lights harbour walk", status: "not-booked" },
  ],
  note: "Airport express and Octopus cards make this the easy landing point with a 10-year-old.",
};

export const MACAU_STOP: PlanStop = {
  id: "macau",
  city: "Macau",
  country: "Macau SAR",
  nights: 3,
  stay: "Cotai family resort, twin queen room",
  stayStatus: "not-booked",
  // Solo demonstration: the crossing choice resurfaces here, because when you
  // arrive decides which night the resort is booked from.
  stayBlockedBy: "d-crossing",
  stayNudge: "Settle ferry or bridge first — the arrival time decides this booking.",
  highlights: [
    { label: "Senado Square & Ruins of St. Paul's", status: "not-booked" },
    { label: "Taipa Village food walk", status: "not-booked" },
    // Group demonstration: only surfaces once the show-vs-flight decision is open.
    {
      label: "House of Dancing Water matinee",
      status: "not-booked",
      blockedBy: "d-group-night",
      nudge: "Rests on the show-vs-flight call the group left open.",
    },
  ],
  note: "Compact and walkable; the resort pools are a good decompression before the long flight back.",
};

export const BASE_DECISIONS: OpenDecision[] = [
  {
    id: "d-crossing",
    question: "Ferry or the sea bridge between the two cities?",
    context: "The ferry is faster door-to-door from Tsim Sha Tsui; the bridge coach is cheaper and steadier in wind.",
    options: ["TurboJET ferry", "HZM bridge coach"],
  },
  {
    id: "d-oceanpark",
    question: "Ocean Park or Disneyland for the big kid day?",
    context: "Both are full days. December weekday crowds are lighter at Ocean Park.",
    options: ["Ocean Park", "Hong Kong Disneyland", "Neither — harbour day instead"],
    comparable: true,
  },
  {
    id: "d-peaktram",
    question: "Which Peak Tram pass to take?",
    context: "Passes differ on queue priority, Sky Terrace entry and cancellation terms.",
    options: ["Compare options"],
    comparable: true,
  },
];

export const INITIAL_PLAN: Plan = {
  title: "December family trip",
  travellers: "2 adults + 1 child (10)",
  window: "8 days · 20–27 December",
  origin: "Bangalore (BLR)",
  stops: [HK_STOP, MACAU_STOP],
  decisions: BASE_DECISIONS,
};

export const GROUP_DECISION: OpenDecision = {
  id: "d-group-night",
  question: "Keep the show night, or swap it for an early flight home?",
  context: "Rohan wants the Saturday show; Arjun wants the 08:10 departure to be back for Monday.",
  options: ["Keep show, fly Sunday evening", "Skip show, fly Sunday morning"],
  unresolvedFrom: "Group discussion — still split",
};

// Group room starts without the crossing decision, so the crossing nudge stays a
// purely solo demonstration; the show-vs-flight decision only joins after Revise.
export const GROUP_OPEN_DECISIONS: OpenDecision[] = BASE_DECISIONS.slice(1);
export const GROUP_REVISED_DECISIONS: OpenDecision[] = [GROUP_DECISION, ...BASE_DECISIONS.slice(1)];

export const IMAGES = {
  hongKong:
    "https://images.unsplash.com/photo-1716706711056-510d49962eea?crop=entropy&cs=srgb&fm=jpg&w=900&q=70",
  macau:
    "https://images.unsplash.com/photo-1553660148-d3ffd5cfe5a8?crop=entropy&cs=srgb&fm=jpg&w=900&q=70",
};

/* ---------------------------------- chat --------------------------------- */

export type Artifact = "sketch" | "diff" | "revise" | null;

export interface ChatMsg {
  id: string;
  kind: "user" | "jugiq" | "person";
  author?: string;
  initials?: string;
  time: string;
  text: string;
  artifact?: Artifact;
}

export const NEW_TRIP_PROMPT =
  "We have about 8 days in December from Bangalore. Couple plus a 10-year-old. Thinking Hong Kong and Macau but open.";

export const STARTER_CHIPS = [
  "From Bangalore",
  "Mid-December, 8 days",
  "2 adults + 1 child",
  "Cities, not beaches",
];

export const NEW_TRIP_MESSAGES: ChatMsg[] = [
  {
    id: "m-welcome",
    kind: "jugiq",
    time: "now",
    text: "Tell me about the trip in your own words — where you're starting from, roughly when, and who's coming. I'll sketch something and we can argue about it from there.",
  },
];

export const FIRST_SKETCH_MESSAGES: ChatMsg[] = [
  { id: "fs-1", kind: "user", time: "09:41", text: NEW_TRIP_PROMPT },
  {
    id: "fs-2",
    kind: "jugiq",
    time: "09:41",
    text: "Eight days is a comfortable amount for those two, and pairing them saves you a second long-haul. Here's where I'd start.",
    artifact: "sketch",
  },
];

export const MATURE_MESSAGES: ChatMsg[] = [
  { id: "ms-1", kind: "user", time: "Mon", text: "Booked the Tsim Sha Tsui place. Harbour view was worth it." },
  {
    id: "ms-2",
    kind: "jugiq",
    time: "Mon",
    text: "Noted — that stay is marked booked in the Current Plan. It puts you ten minutes from the Star Ferry, so I've kept the Symphony of Lights evening on night two rather than night four.",
  },
  { id: "ms-3", kind: "user", time: "Tue", text: "Is Ocean Park going to be a nightmare that week?" },
  {
    id: "ms-4",
    kind: "jugiq",
    time: "Tue",
    text: "Weekdays before the 24th are usually manageable; the 25th and 26th are the crunch. I've pencilled it for Monday the 22nd and left it as held rather than booked, since it's still one of your open decisions.",
  },
  { id: "ms-5", kind: "user", time: "Tue", text: "And getting across to Macau — ferry or the bridge?" },
  {
    id: "ms-6",
    kind: "jugiq",
    time: "Tue",
    text: "Ferry is quicker from where you're staying, roughly an hour on the water. The bridge coach costs less and handles rough December wind better. I've left it open — it's a real trade-off, not an obvious call.",
  },
];

export const CHANGE_MESSAGES: ChatMsg[] = [
  ...MATURE_MESSAGES.slice(2),
  { id: "mc-1", kind: "user", time: "Wed", text: "Actually, let's do Macau first." },
  {
    id: "mc-2",
    kind: "jugiq",
    time: "Wed",
    text: "That's a real change rather than a tweak — it moves your stays, the crossing and the last day. Here's the difference side by side.",
    artifact: "diff",
  },
];

export const GROUP_MESSAGES: ChatMsg[] = [
  {
    id: "g-1",
    kind: "person",
    author: "Priya",
    initials: "PR",
    time: "10:02",
    text: "Ok so I've been looking at the sketch. Five nights in Hong Kong feels like a lot? We did three in Singapore and that was plenty.",
  },
  {
    id: "g-2",
    kind: "person",
    author: "Arjun",
    initials: "AR",
    time: "10:04",
    text: "Disagree. Hong Kong has the hikes, the islands, the food. Macau we'll exhaust in two days honestly.",
  },
  {
    id: "g-3",
    kind: "person",
    author: "Rohan",
    initials: "RO",
    time: "10:06",
    text: "Can we please keep the Saturday show though. I've wanted to see that for years.",
  },
  {
    id: "g-4",
    kind: "person",
    author: "Arjun",
    initials: "AR",
    time: "10:07",
    text: "The show is Saturday night and then we'd be flying Sunday evening. I'd rather take the 08:10 and be home for Monday.",
  },
  {
    id: "g-5",
    kind: "person",
    author: "Priya",
    initials: "PR",
    time: "10:09",
    text: "Fine on Hong Kong nights, I'll drop it. But I do want one slow day, not three theme parks.",
  },
];

export const GROUP_MEMBERS = [
  { name: "You", initials: "YO" },
  { name: "Priya", initials: "PR" },
  { name: "Arjun", initials: "AR" },
  { name: "Rohan", initials: "RO" },
];

/* --------------------------- booking comparison --------------------------- */

export interface BookingOption {
  id: string;
  provider: string;
  headline: string;
  price: string;
  priceNote: string;
  cancellation: string;
  cancellationTone: "good" | "fair" | "poor";
  inclusions: string[];
  availability: string;
  availabilityTone: "good" | "fair" | "poor";
  convenience: string;
  monetised: boolean;
  whyRanked: string;
}

export const BOOKING_SUBJECT = {
  title: "Peak Tram + Sky Terrace 428",
  subtitle: "Hong Kong · 2 adults + 1 child · flexible date",
  checkedAt: "Prices checked 12 minutes ago against each provider's public listing.",
};

export const BOOKING_OPTIONS: BookingOption[] = [
  {
    id: "b-klook",
    provider: "Klook",
    headline: "Fast-track combo with Sky Terrace",
    price: "HK$ 148 / adult",
    priceNote: "verified",
    cancellation: "Free cancellation up to 24h before",
    cancellationTone: "good",
    inclusions: ["Return tram", "Sky Terrace 428", "Separate boarding queue"],
    availability: "Confirmed instantly",
    availabilityTone: "good",
    convenience: "QR pass, no counter pickup",
    monetised: false,
    whyRanked: "Lowest verified price with the most forgiving cancellation and instant confirmation.",
  },
  {
    id: "b-direct",
    provider: "Official operator direct",
    headline: "Standard return + Sky Terrace",
    price: "HK$ 148 / adult",
    priceNote: "verified",
    cancellation: "Free cancellation up to 24h before",
    cancellationTone: "good",
    inclusions: ["Return tram", "Sky Terrace 428"],
    availability: "Confirmed instantly",
    availabilityTone: "good",
    convenience: "Standard queue at the lower terminus",
    monetised: false,
    whyRanked: "Same verified price and terms, but no queue priority on a December afternoon.",
  },
  {
    id: "b-viator",
    provider: "Viator",
    headline: "Tram, terrace and a guided Peak walk",
    price: "HK$ 214 / adult",
    priceNote: "verified",
    cancellation: "Free cancellation up to 24h before",
    cancellationTone: "good",
    inclusions: ["Return tram", "Sky Terrace 428", "90-min guided circle walk"],
    availability: "Confirmed instantly",
    availabilityTone: "good",
    convenience: "Meet a guide at the terminus at a fixed time",
    monetised: true,
    whyRanked:
      "Costs more and adds a fixed meeting time, which is harder with a 10-year-old — worth it only if you want the guided walk.",
  },
  {
    id: "b-gyg",
    provider: "GetYourGuide",
    headline: "Return tram only",
    price: "HK$ 132 / adult",
    priceNote: "verified",
    cancellation: "Non-refundable once the date is chosen",
    cancellationTone: "poor",
    inclusions: ["Return tram"],
    availability: "Subject to reconfirmation",
    availabilityTone: "fair",
    convenience: "Date locked at purchase",
    monetised: false,
    whyRanked:
      "Cheapest headline figure, but it excludes Sky Terrace, can't be cancelled and needs reconfirming.",
  },
];

export const NEUTRALITY_NOTE =
  "JugIQ ranks options strictly on traveller value — verified price, cancellation terms, what's included, availability confidence and convenience. JugIQ may earn a commission from some booking links. That never affects ranking or what you see here.";

export const COVERAGE_NOTE =
  "These are the sources JugIQ checked for this activity. It isn't a complete view of the market, and prices can move after the time shown.";
