// Free "quick answers" for Flexi when no ANTHROPIC_API_KEY is configured.
// Matches the traveller's question against BookingFlex's own destinations,
// trains and help topics, so the chat works with no paid service.

const DESTINATIONS = {
  tokyo: {
    name: "Tokyo", aliases: ["japan", "haneda"], from: 2140, flight: "about 7 hours from KUL",
    best: "March to May (cherry blossom) and October to November (autumn colours)",
    highlights: ["Shibuya crossing", "Senso-ji temple in Asakusa", "a day trip to Mount Fuji or Hakone", "Tsukiji outer market"],
  },
  london: {
    name: "London", aliases: ["uk", "england", "heathrow"], from: 3439, flight: "about 14 hours from KUL",
    best: "May to September, when days are long and mild",
    highlights: ["Westminster and Big Ben", "Tower Bridge", "the British Museum (free)", "Borough Market"],
  },
  bali: {
    name: "Bali", aliases: ["indonesia", "denpasar", "ubud"], from: 1180, flight: "about 3 hours from KUL",
    best: "April to October (dry season)",
    highlights: ["Ubud rice terraces", "Uluwatu temple at sunset", "Seminyak beaches", "Mount Batur sunrise trek"],
  },
  sabah: {
    name: "Sabah", aliases: ["kota kinabalu", "kk", "borneo", "kinabalu"], from: 320, flight: "about 2.5 hours from KUL",
    best: "March to September, outside the heaviest rain",
    highlights: ["island hopping in Tunku Abdul Rahman Park", "Mount Kinabalu", "Kinabatangan river wildlife", "the Filipino night market"],
  },
  paris: {
    name: "Paris", aliases: ["france", "charles de gaulle"], from: 3600, flight: "about 13 hours from KUL",
    best: "April to June and September to October",
    highlights: ["the Eiffel Tower", "the Louvre", "Montmartre", "a Seine river cruise"],
  },
  singapore: {
    name: "Singapore", aliases: ["changi"], from: 250, flight: "about 1 hour from KUL",
    best: "February to April, the driest months",
    highlights: ["Gardens by the Bay", "Marina Bay", "hawker food at Lau Pa Sat", "Sentosa"],
  },
  bangkok: {
    name: "Bangkok", aliases: ["thailand"], from: 380, flight: "about 2 hours from KUL",
    best: "November to February (cool season)",
    highlights: ["the Grand Palace", "Wat Arun", "Chatuchak weekend market", "a canal boat ride"],
  },
  dubai: {
    name: "Dubai", aliases: ["uae", "emirates"], from: 1900, flight: "about 7 hours from KUL",
    best: "November to March",
    highlights: ["Burj Khalifa", "a desert safari", "Dubai Marina", "the old souks"],
  },
  seoul: {
    name: "Seoul", aliases: ["korea", "incheon"], from: 1500, flight: "about 6.5 hours from KUL",
    best: "April to May and September to November",
    highlights: ["Gyeongbokgung Palace", "Bukchon Hanok Village", "Myeongdong street food", "N Seoul Tower"],
  },
  sydney: {
    name: "Sydney", aliases: ["australia"], from: 1800, flight: "about 8 hours from KUL",
    best: "September to November and March to May",
    highlights: ["the Opera House", "Bondi to Coogee walk", "Harbour Bridge", "the Blue Mountains"],
  },
};

const TRAIN_INFO =
  "BookingFlex sells these trains (sample timetables):\n" +
  "• KTM ETS from KL Sentral to Ipoh (about 2.5 h), Butterworth for Penang (about 4–4.5 h) and Padang Besar (about 6 h)\n" +
  "• KLIA Ekspres, non-stop KL Sentral to KLIA (28 min) and KLIA2 (33 min)\n" +
  "• KLIA Transit, stopping at TBS on the way to the airports\n" +
  "Open the Trains tab on the home page, choose your stations and dates, and you'll see times and fares. You can also watch KTM trains live on the Track page.";

const PAYMENT_INFO =
  "You can pay by card (Visa, Mastercard, Amex), PayPal, FPX online banking (Maybank, CIMB, Public Bank and more), e-wallets (Touch 'n Go, GrabPay, Boost) or Apple Pay. " +
  "For FPX, choose FPX at checkout, pick your bank, and approve the payment in your bank's app. Your e-ticket or voucher is emailed as soon as payment goes through.";

const RULES = [
  {
    name: "greeting", test: /\b(hi|hello|hey|salam|assalamualaikum|good (morning|afternoon|evening))\b/,
    answer: () =>
      "Hi! I can help you pick a destination, plan a trip, find trains, or explain how booking and payment work on BookingFlex. Where are you thinking of going?",
  },
  { name: "train", test: /\b(trains?|ets|ktm|komuter|rail(way)?s?|klia ekspres|klia transit|penang|butterworth|ipoh|padang besar)\b/, answer: () => TRAIN_INFO },
  { name: "payment", test: /\b(pay|payment|fpx|paypal|card|e-?wallet|touch ?'?n ?go|grabpay|boost|apple pay)\b/, answer: () => PAYMENT_INFO },
  {
    name: "track", test: /\b(track|status|delay|delayed|gate|live|where is (my|the) (flight|train))\b/,
    answer: () =>
      "Open Track in the top menu. You can follow your own bookings, check any flight's status by number (for example MH1), and watch KTM trains and planes over Malaysia on a live map.",
  },
  {
    name: "ticket", test: /\b(tickets?|e-?tickets?|vouchers?|e-?mail|pdf|boarding pass|confirmation)\b/,
    answer: () =>
      "After you pay, your e-ticket (or hotel voucher) is emailed as a PDF and shown on the confirmation page, where you can download it, print it or add it to your calendar. Find it again any time under My trips or Track. Didn't get the email? Check spam, then use \"Email my e-ticket\" on the confirmation page.",
  },
  {
    name: "cancel", test: /\b(cancel|refund|change|reschedule|amend)\b/,
    answer: () =>
      "BookingFlex can't change or cancel bookings from the chat. Many hotel rooms have free cancellation until 3 days before check-in; for flights and trains, the airline or operator's rules apply. Contact us through the Help centre with your 6-letter booking reference and we'll help.",
  },
  {
    name: "account", test: /\b(sign ?in|log ?in|sign ?up|register|account|password)\b/,
    answer: () =>
      "Use Sign in at the top right, or Create an account (it's free). Forgot your password? Choose \"Forgot password?\" on the sign-in page and we'll email you a reset link. You can also continue with Google.",
  },
  {
    name: "hotel", test: /\b(hotels?|stays?|rooms?|resorts?|accommodations?)\b/,
    answer: (q) => {
      const d = findDestination(q);
      return `Use the Hotels tab on the home page: enter ${d ? d.name : "a city"}, your dates and guests. You'll see guest ratings, room options and the total price for your stay, and many rooms have free cancellation. Planning flights too? The Vacations tab books return flights and shows hotels for the same dates.`;
    },
  },
  {
    name: "thanks", test: /\b(thanks?|thank you|terima kasih|tq|ok(ay)?|great|cool)\b/,
    answer: () => "You're welcome! Anything else I can help with for your trip?",
  },
  {
    name: "baggage", test: /\b(baggage|luggage|bags?|kg)\b/,
    answer: () => "Our sample fares include a 7 kg cabin bag and 30 kg checked baggage. The airline's own rules apply on the day, so check your airline before you fly.",
  },
];

function findDestination(q) {
  return Object.entries(DESTINATIONS).map(([, d]) => d).find((d) =>
    [d.name.toLowerCase(), ...d.aliases].some((name) => new RegExp(`\\b${name}\\b`).test(q)),
  );
}

function destinationAnswer(q, d) {
  const days = Number((/(\d+)\s*-?\s*(day|night)/.exec(q) || [])[1]);
  if (/\b(plan|itinerary|trip|days?|nights?)\b/.test(q) && days > 0) {
    const n = Math.min(days, 7);
    const plan = Array.from({ length: n }, (_, i) => {
      if (i === 0) return `Day 1: arrive, check in and take an easy first evening`;
      if (i === n - 1) return `Day ${n}: last breakfast, souvenirs and head to the airport`;
      return `Day ${i + 1}: ${d.highlights[(i - 1) % d.highlights.length]}`;
    });
    return `Here's a simple ${days}-day ${d.name} plan:\n${plan.join("\n")}\n\nBest time to go: ${d.best}. Flights from MYR ${d.from.toLocaleString("en-MY")} (sample fare), ${d.flight}. Use the Vacations tab to book flights and a hotel together.`;
  }
  if (/\b(best time|when|season|weather|month)\b/.test(q)) {
    return `The best time to visit ${d.name} is ${d.best}. Flights from MYR ${d.from.toLocaleString("en-MY")} (sample fare), ${d.flight}.`;
  }
  return `${d.name} is a great pick! Don't miss ${d.highlights.slice(0, 3).join(", ")}. The best time to go is ${d.best}. Flights from MYR ${d.from.toLocaleString("en-MY")} (sample fare), ${d.flight}. Search Flights, or use Vacations for flight + hotel together.`;
}

const rule = (name) => RULES.find((r) => r.name === name);

/** Returns a reply for the latest user message. */
function quickAnswer(messages) {
  const last = messages[messages.length - 1];
  const q = String(last.content || "").toLowerCase();
  // Most specific topics first; a destination mention alone comes later
  // ("trains to Penang" is about trains, "hotels in Bali" about hotels).
  for (const name of ["train", "payment", "hotel", "track", "cancel", "account", "baggage"]) {
    if (rule(name).test.test(q)) return rule(name).answer(q);
  }
  const destination = findDestination(q);
  if (destination) return destinationAnswer(q, destination);
  for (const name of ["ticket", "greeting", "thanks"]) {
    if (rule(name).test.test(q)) return rule(name).answer(q);
  }
  if (/\b(where|recommend|suggest|idea|cheap|budget|holiday|vacation|go)\b/.test(q)) {
    const cheap = Object.values(DESTINATIONS).sort((a, b) => a.from - b.from).slice(0, 4);
    return `Some ideas from Kuala Lumpur:\n${cheap
      .map((d) => `• ${d.name}: flights from MYR ${d.from.toLocaleString("en-MY")}, ${d.flight}`)
      .join("\n")}\nFor something further, Tokyo, Seoul and London are popular. Ask me about any of them!`;
  }
  return "I can help with destinations (try \"best time to visit Bali\" or \"plan a 4-day trip to Tokyo\"), trains, hotels, payments, tickets and tracking your trip. What would you like to know?";
}

module.exports = { quickAnswer };
