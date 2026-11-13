// Free "quick answers" for Flexi when no ANTHROPIC_API_KEY is configured.
// A small rule-based assistant: it introduces itself, asks what the traveller
// wants to book, remembers the conversation (mode and destination), compares
// destinations or flight vs train, and recommends trips from a budget, a
// month, a trip length and interests. Every reply comes with suggested next
// questions, shown as tappable chips. Fares are BookingFlex sample fares.

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const MONTH_SHORT = MONTHS.map((m) => m.slice(0, 3));

// from: return flight from KUL (MYR, sample). hotel: mid-range night (MYR).
// daily: food, transport and activities per person per day (MYR).
const DESTINATIONS = {
  tokyo: {
    name: "Tokyo", aliases: ["japan", "haneda", "narita"], from: 2140, hours: 7, hotel: 420, daily: 260,
    months: [3, 4, 5, 10, 11], best: "March to May (cherry blossom) and October to November (autumn colours)",
    tags: ["city", "food", "culture", "shopping", "snow", "family"], snow: [12, 1, 2],
    highlights: ["Shibuya crossing", "Senso-ji temple in Asakusa", "a day trip to Mount Fuji or Hakone", "Tsukiji outer market"],
  },
  seoul: {
    name: "Seoul", aliases: ["korea", "incheon"], from: 1500, hours: 6.5, hotel: 330, daily: 220,
    months: [4, 5, 9, 10, 11], best: "April to May and September to November",
    tags: ["city", "food", "shopping", "culture", "snow"], snow: [12, 1, 2],
    highlights: ["Gyeongbokgung Palace", "Bukchon Hanok Village", "Myeongdong street food", "N Seoul Tower"],
  },
  bali: {
    name: "Bali", aliases: ["indonesia", "denpasar", "ubud"], from: 1180, hours: 3, hotel: 260, daily: 150,
    months: [4, 5, 6, 7, 8, 9, 10], best: "April to October (dry season)",
    tags: ["beach", "nature", "culture", "romance", "relax"],
    highlights: ["Ubud rice terraces", "Uluwatu temple at sunset", "Seminyak beaches", "Mount Batur sunrise trek"],
  },
  bangkok: {
    name: "Bangkok", aliases: ["thailand"], from: 380, hours: 2, hotel: 220, daily: 140,
    months: [11, 12, 1, 2], best: "November to February (cool season)",
    tags: ["city", "food", "shopping", "culture", "nightlife", "budget"],
    highlights: ["the Grand Palace", "Wat Arun", "Chatuchak weekend market", "a canal boat ride"],
  },
  phuket: {
    name: "Phuket", aliases: [], from: 420, hours: 1.5, hotel: 240, daily: 150,
    months: [11, 12, 1, 2, 3, 4], best: "November to April (dry season)",
    tags: ["beach", "relax", "nightlife", "romance", "family", "budget"],
    highlights: ["Phi Phi islands by boat", "Patong beach", "Old Phuket Town", "the Big Buddha viewpoint"],
  },
  singapore: {
    name: "Singapore", aliases: ["changi"], from: 250, hours: 1, hotel: 480, daily: 220,
    months: [2, 3, 4, 7, 8], best: "February to April, the driest months",
    tags: ["city", "food", "family", "shopping", "budget"],
    highlights: ["Gardens by the Bay", "Marina Bay", "hawker food at Lau Pa Sat", "Sentosa and Universal Studios"],
  },
  langkawi: {
    name: "Langkawi", aliases: [], from: 180, hours: 1, hotel: 230, daily: 120,
    months: [11, 12, 1, 2, 3, 4], best: "November to April",
    tags: ["beach", "nature", "relax", "family", "romance", "budget", "local"],
    highlights: ["the SkyCab and Sky Bridge", "Pantai Cenang", "mangrove kayaking in Kilim", "duty-free shopping"],
  },
  penang: {
    name: "Penang", aliases: ["pulau pinang", "george town", "georgetown", "butterworth"], from: 160, hours: 1, hotel: 200, daily: 110,
    months: [12, 1, 2, 3, 6, 7], best: "December to March",
    tags: ["food", "culture", "city", "budget", "local", "family"],
    highlights: ["George Town street art", "char kway teow and laksa", "Penang Hill", "Kek Lok Si temple"],
    train: true,
  },
  ipoh: {
    name: "Ipoh", aliases: [], from: null, hours: null, hotel: 160, daily: 90,
    months: [12, 1, 2, 3, 6, 7], best: "December to March",
    tags: ["food", "culture", "nature", "budget", "local"],
    highlights: ["Old Town and Concubine Lane", "white coffee and bean sprout chicken", "cave temples like Sam Poh Tong", "Gunung Lang"],
    train: true, trainOnly: true,
  },
  sabah: {
    name: "Sabah", aliases: ["kota kinabalu", "kk", "borneo", "kinabalu"], from: 320, hours: 2.5, hotel: 210, daily: 130,
    months: [3, 4, 5, 6, 7, 8, 9], best: "March to September, outside the heaviest rain",
    tags: ["nature", "beach", "adventure", "local", "family"],
    highlights: ["island hopping in Tunku Abdul Rahman Park", "Mount Kinabalu", "Kinabatangan river wildlife", "the Filipino night market"],
  },
  hongkong: {
    name: "Hong Kong", aliases: ["hong kong", "hk"], from: 900, hours: 4, hotel: 450, daily: 230,
    months: [10, 11, 12, 3, 4], best: "October to December",
    tags: ["city", "food", "shopping", "family", "nightlife"],
    highlights: ["Victoria Peak", "dim sum in Central", "the Star Ferry", "Disneyland"],
  },
  taipei: {
    name: "Taipei", aliases: ["taiwan"], from: 1050, hours: 4.5, hotel: 300, daily: 180,
    months: [10, 11, 12, 3, 4, 5], best: "October to December and March to May",
    tags: ["food", "city", "culture", "nature", "shopping"],
    highlights: ["Shilin night market", "Taipei 101", "Jiufen old street", "Beitou hot springs"],
  },
  dubai: {
    name: "Dubai", aliases: ["uae", "emirates"], from: 1900, hours: 7, hotel: 520, daily: 280,
    months: [11, 12, 1, 2, 3], best: "November to March",
    tags: ["city", "shopping", "luxury", "adventure", "family"],
    highlights: ["Burj Khalifa", "a desert safari", "Dubai Marina", "the old souks"],
  },
  istanbul: {
    name: "Istanbul", aliases: ["turkey", "turkiye"], from: 2600, hours: 11, hotel: 350, daily: 200,
    months: [4, 5, 9, 10], best: "April to May and September to October",
    tags: ["culture", "food", "city", "romance", "history"],
    highlights: ["Hagia Sophia", "the Blue Mosque", "the Grand Bazaar", "a Bosphorus cruise"],
  },
  london: {
    name: "London", aliases: ["uk", "england", "heathrow"], from: 3439, hours: 14, hotel: 700, daily: 350,
    months: [5, 6, 7, 8, 9], best: "May to September, when days are long and mild",
    tags: ["city", "culture", "history", "shopping"],
    highlights: ["Westminster and Big Ben", "Tower Bridge", "the British Museum (free)", "Borough Market"],
  },
  paris: {
    name: "Paris", aliases: ["france", "charles de gaulle"], from: 3600, hours: 13, hotel: 680, daily: 340,
    months: [4, 5, 6, 9, 10], best: "April to June and September to October",
    tags: ["city", "romance", "culture", "food", "history"],
    highlights: ["the Eiffel Tower", "the Louvre", "Montmartre", "a Seine river cruise"],
  },
  sydney: {
    name: "Sydney", aliases: ["australia"], from: 1800, hours: 8, hotel: 520, daily: 300,
    months: [9, 10, 11, 3, 4, 5], best: "September to November and March to May",
    tags: ["beach", "city", "nature", "family"],
    highlights: ["the Opera House", "Bondi to Coogee walk", "Harbour Bridge", "the Blue Mountains"],
  },
};
const ALL = Object.values(DESTINATIONS);

const INTERESTS = {
  beach: /\b(beach(es)?|island|sea|snorkel|diving|pantai|pulau)\b/,
  food: /\b(food|eat|makan|street food|foodie|cuisine|hawker)\b/,
  city: /\b(city|cities|urban|skyline)\b/,
  shopping: /\b(shop|shopping|mall|beli-?belah)\b/,
  nature: /\b(nature|hiking|hike|mountain|jungle|wildlife|waterfall|trek)\b/,
  culture: /\b(culture|temple|history|historic|museum|heritage)\b/,
  romance: /\b(honeymoon|romantic|couple|anniversary|bulan madu)\b/,
  family: /\b(family|kids|children|keluarga|anak)\b/,
  snow: /\b(snow|salji|winter)\b/,
  relax: /\b(relax|chill|rest|quiet|spa)\b/,
  adventure: /\b(adventure|extreme|safari|climb)\b/,
  nightlife: /\b(nightlife|party|clubbing|bars?)\b/,
};
const INTEREST_LABEL = {
  beach: "beaches", food: "food", city: "city life", shopping: "shopping", nature: "nature", culture: "culture",
  romance: "a romantic trip", family: "families", snow: "cooler weather and snow", relax: "relaxing", adventure: "adventure",
  nightlife: "nightlife", luxury: "luxury", budget: "a small budget", local: "staying in Malaysia", history: "history",
};

const RM = (n) => `RM ${Math.round(n).toLocaleString("en-MY")}`;
const hoursText = (h) => (h == null ? "no direct flight" : h < 1.5 ? "about 1 hour" : `about ${String(h).replace(".5", "½")} hours`);
const flightText = (d) => (d.trainOnly ? "by ETS train from KL Sentral (about 2.5 h)" : `${hoursText(d.hours)} from KUL`);
const pick = (list, n) => list.slice(0, n);
const fmtList = (items) => (items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`);

const MODE_CHIPS = ["✈️ Book a flight", "🏨 Find a hotel", "🚆 Train tickets", "🧳 Flight + hotel"];

/* ---------- Reading the question ---------- */

function findDestinations(q) {
  const found = [];
  for (const d of ALL) {
    const names = [d.name.toLowerCase(), ...d.aliases];
    let at = -1;
    for (const n of names) {
      const m = new RegExp(`\\b${n.replace(/\s+/g, "\\s+")}\\b`).exec(q);
      if (m && (at < 0 || m.index < at)) at = m.index;
    }
    if (at >= 0) found.push({ d, at });
  }
  return found.sort((a, b) => a.at - b.at).map((x) => x.d);
}

const modeOf = (q) => {
  const flight = /\b(flights?|fly|flying|plane|air ?tickets?|airlines?|penerbangan|tiket kapal terbang)\b|✈/.test(q);
  const hotel = /\b(hotels?|stays?|rooms?|resorts?|accommodations?|homestay|penginapan)\b|🏨/.test(q);
  const train = /\b(trains?|ets|ktm|komuter|rail(way)?s?|klia ekspres|klia transit|kereta ?api)\b|🚆/.test(q);
  const both = /\b(both|package|vacation|holiday package|flight\s*\+\s*hotel|flight and hotel|semua)\b|🧳/.test(q);
  if (both || (flight && hotel)) return "package";
  if (flight && train) return "compare-transport";
  if (train) return "train";
  if (flight) return "flight";
  if (hotel) return "hotel";
  return null;
};

function budgetOf(q) {
  const m = /(?:rm|myr)\s?(\d[\d,.]*)\s*(k)?|(\d[\d,.]*)\s*(k)?\s*(?:rm|myr|ringgit)/.exec(q);
  if (!m) return null;
  let n = parseFloat((m[1] || m[3]).replace(/,/g, ""));
  if (m[2] || m[4]) n *= 1000;
  return n > 50 ? n : null;
}
const daysOf = (q) => {
  const m = /(\d+)\s*-?\s*(days?|nights?|d\d?n|hari|malam)\b/.exec(q);
  if (m) return Math.min(30, Number(m[1]));
  if (/\bweekend\b/.test(q)) return 3;
  if (/\b(a|one) week\b|\bseminggu\b/.test(q)) return 7;
  return null;
};
function monthOf(q) {
  const now = new Date().getMonth() + 1;
  if (/\bnext month\b|bulan depan/.test(q)) return (now % 12) + 1;
  if (/\bthis month\b|bulan ini/.test(q)) return now;
  if (/school holiday|cuti sekolah/.test(q)) return 12;
  for (let i = 0; i < 12; i += 1) {
    if (new RegExp(`\\b(${MONTHS[i]}|${MONTH_SHORT[i]})\\b`).test(q)) return i + 1;
  }
  return null;
}
const interestsOf = (q) => Object.keys(INTERESTS).filter((k) => INTERESTS[k].test(q));

/* ---------- Building answers ---------- */

const tripCost = (d, days) => {
  const nights = Math.max(1, days - 1);
  const fare = d.trainOnly ? 120 : d.from || 0;
  return { fare, nights, total: fare + nights * d.hotel + days * d.daily };
};

function bookingSteps(mode, d) {
  const where = d ? d.name : "your destination";
  if (mode === "flight") return `To book: on the home page choose Flights, enter Kuala Lumpur (KUL) to ${where}, pick dates and travellers, then Search. Sort by Cheapest or Fastest and choose your fare.`;
  if (mode === "hotel") return `To book: open the Hotels tab, type ${where}, add your dates and guests, then pick a room. Many rooms have free cancellation.`;
  if (mode === "package") return `To book both at once: open the Vacations tab, enter ${where} and your dates. You'll get return flights plus hotels for the same nights.`;
  return "";
}

function modeAnswer(mode, d, q) {
  const days = daysOf(q) || 4;
  if (mode === "train" || (d && d.trainOnly)) return trainAnswer(d);
  if (mode === "compare-transport") return transportCompare(d);
  if (!d) {
    const what = { flight: "a flight", hotel: "a hotel", package: "a flight + hotel trip" }[mode];
    return {
      text: `Great, let's find ${what}! Where would you like to go, and when? For example "Bali in June" or "Tokyo for 5 days".`,
      suggestions: ["Bali", "Tokyo", "Langkawi", "Bangkok", "Not sure, suggest a trip"],
    };
  }
  if (mode === "flight") {
    return {
      text: `Flights to ${d.name}: return fares from ${RM(d.from)} (sample), ${flightText(d)}. Best time to go: ${d.best}.\n\n${bookingSteps("flight", d)}`,
      suggestions: [`Hotels in ${d.name}`, `${days}-day ${d.name} plan`, `Budget for ${d.name}`, "Compare with another place"],
    };
  }
  if (mode === "hotel") {
    return {
      text: `Hotels in ${d.name}: comfortable mid-range rooms from about ${RM(d.hotel)} a night (sample). Good areas are near ${d.highlights[0]} and ${d.highlights[1]}.\n\n${bookingSteps("hotel", d)}`,
      suggestions: [`Flights to ${d.name}`, `Flight + hotel to ${d.name}`, `${days}-day ${d.name} plan`],
    };
  }
  const c = tripCost(d, days);
  return {
    text: `Flight + hotel to ${d.name} for ${days} days: about ${RM(c.fare + c.nights * d.hotel)} per person (return flight ${RM(c.fare)} + ${c.nights} nights × ${RM(d.hotel)}), or about ${RM(c.total)} with food and activities.\n\n${bookingSteps("package", d)}`,
    suggestions: [`${days}-day ${d.name} plan`, `Best time to visit ${d.name}`, "Compare with another place"],
  };
}

function trainAnswer(d) {
  const lines = [
    "Trains you can book on BookingFlex (sample timetables):",
    "• KTM ETS from KL Sentral to Ipoh (about 2.5 h, from RM 47), Butterworth for Penang (about 4–4.5 h, from RM 79) and Padang Besar (about 6 h, from RM 99)",
    "• KLIA Ekspres: KL Sentral to KLIA in 28 min, KLIA2 in 33 min (RM 55)",
    "• KLIA Transit: stops at TBS on the way to the airports",
    "",
    "Open the Trains tab, choose your stations and date to see times and fares. You can watch KTM trains live on the Track page.",
  ];
  if (d && d.train) lines.unshift(`Yes, you can take the train to ${d.name}!`);
  return { text: lines.join("\n"), suggestions: ["Flight or train to Penang?", "Hotels in Penang", "Trains to Ipoh"] };
}

function transportCompare(d) {
  const dest = d && d.train ? d : DESTINATIONS.penang;
  if (dest.trainOnly) {
    return {
      text: `${dest.name} has no direct flights from KL, so the ETS train is the best way: about 2.5 hours from KL Sentral, from RM 47, straight into the city centre.`,
      suggestions: [`Hotels in ${dest.name}`, `Things to do in ${dest.name}`],
    };
  }
  return {
    text: [
      `Flight vs train to ${dest.name}:`,
      `• ✈️ Flight: about 1 hour in the air, from ${RM(dest.from)} return (sample). Add about 2 hours for the airport, so roughly 3–3.5 hours door to door.`,
      "• 🚆 ETS train: about 4–4.5 hours KL Sentral to Butterworth, from RM 79 one way, then a 20-minute ferry to George Town. City centre to city centre, bigger seats, no baggage fees.",
      "",
      "Best pick: the train if you like a relaxed, cheaper trip from the city centre; the flight if you're short on time or flying from KLIA anyway.",
    ].join("\n"),
    suggestions: ["Train tickets to Penang", "Flights to Penang", "Hotels in Penang"],
  };
}

function compareDestinations(list, q) {
  const days = daysOf(q) || 5;
  const items = list.slice(0, 4);
  const lines = [`Here's how ${fmtList(items.map((d) => d.name))} compare for ${days} days from KL (sample prices, per person):`];
  for (const d of items) {
    const c = tripCost(d, days);
    lines.push(
      "",
      `${d.name}`,
      `• Getting there: ${flightText(d)}${d.trainOnly ? "" : `, flights from ${RM(d.from)}`}`,
      `• Hotel: about ${RM(d.hotel)}/night · daily spend about ${RM(d.daily)}`,
      `• Total estimate: about ${RM(c.total)}`,
      `• Best time: ${d.best}`,
      `• Great for: ${fmtList(pick(d.tags, 3).map((t) => INTEREST_LABEL[t] || t))}`,
    );
  }
  const interests = interestsOf(q);
  const month = monthOf(q);
  const score = (d) => tripCost(d, days).total / 1000 - (month && d.months.includes(month) ? 3 : 0) - interests.filter((i) => d.tags.includes(i)).length * 2;
  const best = [...items].sort((a, b) => score(a) - score(b))[0];
  const why = [];
  if (month && best.months.includes(month)) why.push(`${MONTHS[month - 1][0].toUpperCase()}${MONTHS[month - 1].slice(1)} is a good month there`);
  const matched = interests.filter((i) => best.tags.includes(i));
  if (matched.length) why.push(`it's great for ${fmtList(matched.map((i) => INTEREST_LABEL[i]))}`);
  const cheapest = [...items].sort((a, b) => tripCost(a, days).total - tripCost(b, days).total)[0];
  if (best === cheapest) why.push("it's the cheapest of these");
  lines.push("", `My pick: ${best.name}${why.length ? `, because ${fmtList(why)}` : ""}.`);
  return {
    text: lines.join("\n"),
    suggestions: [`${days}-day ${best.name} plan`, `Flight + hotel to ${best.name}`, ...items.filter((d) => d !== best).map((d) => `Why not ${d.name}?`)].slice(0, 4),
  };
}

// "Why not Bali?" after Flexi picked somewhere else.
function whyNot(d, picked, contextDays) {
  const days = contextDays || 5;
  const a = tripCost(d, days).total;
  const b = tripCost(picked, days).total;
  const month = new Date().getMonth() + 1;
  const points = [];
  if (a > b) points.push(`it costs about ${RM(a - b)} more than ${picked.name} for ${days} days (${RM(a)} vs ${RM(b)})`);
  else points.push(`it's actually about ${RM(b - a)} cheaper than ${picked.name}, so it's a great choice too`);
  if ((d.hours || 0) > (picked.hours || 0) + 1) points.push(`the flight is longer (${hoursText(d.hours)} vs ${hoursText(picked.hours)})`);
  if (!d.months.includes(month) && picked.months.includes(month)) points.push(`now isn't its best season (${d.best})`);
  const own = d.tags.filter((t) => !picked.tags.includes(t)).slice(0, 2);
  return {
    text: `${d.name} is still a lovely choice! I ranked it below ${picked.name} because ${fmtList(points)}.${own.length ? ` Pick ${d.name} if you want more ${fmtList(own.map((t) => INTEREST_LABEL[t] || t))}.` : ""}`,
    suggestions: [`Flight + hotel to ${d.name}`, `Flight + hotel to ${picked.name}`, `${days}-day ${d.name} plan`],
  };
}

function recommend(q, contextDays) {
  const budget = budgetOf(q);
  const days = daysOf(q) || contextDays || 5;
  const month = monthOf(q);
  const interests = interestsOf(q);
  const local = /\b(malaysia|local|domestic|dalam negara|cuti-cuti malaysia)\b/.test(q);
  let pool = ALL.filter((d) => !local || d.tags.includes("local"));
  // Asked for something specific (snow, beaches…): only places that have it.
  if (interests.length) {
    const matching = pool.filter((d) => interests.some((i) => d.tags.includes(i)));
    if (matching.length >= 2) pool = matching;
  }
  const scored = pool
    .map((d) => {
      const cost = tripCost(d, days).total;
      let s = 0;
      const why = [];
      if (month && interests.includes("snow") && (d.snow || []).includes(month)) {
        s += 4;
        why.push(`${MONTHS[month - 1].slice(0, 1).toUpperCase()}${MONTHS[month - 1].slice(1)} is snow season`);
      } else if (month) {
        if (d.months.includes(month)) {
          s += 3;
          why.push(`${MONTHS[month - 1].slice(0, 1).toUpperCase()}${MONTHS[month - 1].slice(1)} is one of the best months`);
        } else s -= 2;
      }
      const hit = interests.filter((i) => d.tags.includes(i));
      s += hit.length * 3.5;
      if (hit.length) why.push(`great for ${fmtList(hit.map((i) => INTEREST_LABEL[i]))}`);
      if (budget) {
        if (cost <= budget) {
          s += 2 + Math.min(2, (budget - cost) / budget);
          why.push(`about ${RM(cost)} for ${days} days, within your budget`);
        } else {
          s -= 4 + (cost - budget) / budget;
          why.push(`about ${RM(cost)} for ${days} days, a little over your budget`);
        }
      } else {
        s -= cost / 4000; // gentle preference for good value
      }
      if (!why.length) why.push(`known for ${fmtList(pick(d.highlights, 2))}`);
      return { d, s, cost, why };
    })
    .sort((a, b) => b.s - a.s);
  const top = scored.slice(0, 3);
  const asked = [budget && `${RM(budget)}`, `${days} days`, month && MONTHS[month - 1].replace(/^\w/, (c) => c.toUpperCase()), interests.length && fmtList(interests.map((i) => INTEREST_LABEL[i]))].filter(Boolean);
  const lines = [`Best trips for ${fmtList(asked)}${local ? " in Malaysia" : ""} from KL:`];
  top.forEach(({ d, cost, why }, i) => {
    lines.push("", `${i + 1}. ${d.name}: ${fmtList(why)}.`, `   ${flightText(d)}, total about ${RM(cost)} per person. Don't miss ${fmtList(pick(d.highlights, 2))}.`);
  });
  if (budget && top[0].cost > budget) lines.push("", `These are the closest to ${RM(budget)}. A shorter trip or a Malaysian destination would fit better.`);
  if (!budget && !month && !interests.length) lines.push("", "Tell me your budget, month or what you enjoy (beaches, food, shopping, nature) and I'll narrow it down.");
  return {
    text: lines.join("\n"),
    suggestions: [`Compare ${top[0].d.name} vs ${top[1].d.name}`, `${days}-day ${top[0].d.name} plan`, `Flight + hotel to ${top[0].d.name}`, "Beach trip under RM 2,000"],
  };
}

function itinerary(d, days) {
  const n = Math.min(days, 7);
  const plan = Array.from({ length: n }, (_, i) => {
    if (i === 0) return `Day 1: arrive, check in and take an easy first evening`;
    if (i === n - 1) return `Day ${n}: last breakfast, souvenirs and head home`;
    return `Day ${i + 1}: ${d.highlights[(i - 1) % d.highlights.length]}`;
  });
  const c = tripCost(d, days);
  return {
    text: `Here's a simple ${days}-day ${d.name} plan:\n${plan.join("\n")}\n\nEstimated cost: about ${RM(c.total)} per person (getting there, ${c.nights} nights' hotel, food and activities). Best time: ${d.best}.`,
    suggestions: [`Flight + hotel to ${d.name}`, `Hotels in ${d.name}`, "Compare with another place"],
  };
}

function destinationAnswer(q, d) {
  const days = daysOf(q);
  if (/\b(cost|price|how much|budget|expensive|cheap|murah|berapa)\b/.test(q)) {
    const n = days || 5;
    const c = tripCost(d, n);
    return {
      text: `A ${n}-day trip to ${d.name} costs about ${RM(c.total)} per person:\n• Getting there: ${d.trainOnly ? "ETS train about RM 120 return" : `${RM(c.fare)} return flight (sample)`}\n• Hotel: ${c.nights} nights × ${RM(d.hotel)}\n• Food, transport and activities: ${n} days × ${RM(d.daily)}\nBudget hotels and street food can bring this down by about a third.`,
      suggestions: [`${n}-day ${d.name} plan`, `Flight + hotel to ${d.name}`, "Cheaper ideas"],
    };
  }
  if (/\b(plan|itinerary|trip|days?|nights?)\b/.test(q) && days) return itinerary(d, days);
  if (/\b(best time|when|season|weather|month|musim|bila)\b/.test(q)) {
    return { text: `The best time to visit ${d.name} is ${d.best}. Getting there: ${flightText(d)}${d.from ? `, flights from ${RM(d.from)} (sample)` : ""}.`, suggestions: [`5-day ${d.name} plan`, `Flights to ${d.name}`] };
  }
  return {
    text: `${d.name} is a great pick! Don't miss ${fmtList(pick(d.highlights, 3))}. Best time to go: ${d.best}. Getting there: ${flightText(d)}${d.from ? `, flights from ${RM(d.from)} (sample)` : ""}.\n\nWould you like a flight, a hotel, or both?`,
    suggestions: d.trainOnly ? [`Trains to ${d.name}`, `Hotels in ${d.name}`, `3-day ${d.name} plan`] : [`Flights to ${d.name}`, `Hotels in ${d.name}`, `Flight + hotel to ${d.name}`, `5-day ${d.name} plan`],
  };
}

/* ---------- Help topics ---------- */

const HELP = [
  {
    test: /\b(pay|payment|fpx|paypal|card|e-?wallet|touch ?'?n ?go|grabpay|boost|apple pay|bayar)\b/,
    text: "You can pay by card (Visa, Mastercard, Amex), PayPal, FPX online banking (Maybank, CIMB, Public Bank and more), e-wallets (Touch 'n Go, GrabPay, Boost) or Apple Pay. For FPX, choose FPX at checkout, pick your bank and approve in your bank's app. Your e-ticket is emailed as soon as payment goes through.",
    suggestions: ["Where's my e-ticket?", "Can I cancel?"],
  },
  {
    test: /\b(track|status|delay|delayed|gate|where is (my|the) (flight|train))\b/,
    text: "Open Track in the top menu. You can follow your bookings, check any flight's status by number (for example MH1), and watch KTM trains and planes over Malaysia on a live map.",
    suggestions: ["Where's my e-ticket?", "Train tickets"],
  },
  {
    test: /\b(e-?tickets?|vouchers? (email|pdf)|e-?mail|pdf|boarding pass|confirmation|tiket saya)\b/,
    text: "After you pay, your e-ticket (or hotel voucher) is emailed as a PDF and shown on the confirmation page, where you can download it or add it to your calendar. Find it again under My trips. No email? Check spam, then use \"Email my e-ticket\" on the confirmation page.",
    suggestions: ["Can I cancel?", "Track my trip"],
  },
  {
    test: /\b(cancel|refund|reschedule|amend|batal)\b/,
    text: "I can't change or cancel bookings from the chat. Many hotel rooms have free cancellation until 3 days before check-in; for flights and trains the airline's or operator's rules apply. Contact us through the Help centre with your 6-letter booking reference and we'll help.",
    suggestions: ["Where's my e-ticket?", "How do I pay?"],
  },
  {
    test: /\b(sign ?in|log ?in|sign ?up|register|account|password|daftar)\b/,
    text: "Use Sign in at the top right, or Create an account (free). You can sign in with Google or with a code sent to any email. Forgot your password? Choose \"Forgot password?\" and we'll email a reset link.",
    suggestions: ["Book a flight", "Find a hotel"],
  },
  {
    test: /\b(baggage|luggage|bags?|\d+ ?kg|bagasi)\b/,
    text: "Our sample fares include a 7 kg cabin bag and 30 kg checked baggage. The airline's own rules apply on the day, so check with your airline before you fly.",
    suggestions: ["Book a flight", "Track my trip"],
  },
  {
    test: /\b(vouchers?|promo|discount|deals?|coupon|diskaun)\b/,
    text: "Current vouchers and deals are on the News & deals page (top menu → News & deals → Vouchers). Copy a code there and use it when you book.",
    suggestions: ["Best trip under RM 2,000", "Book a flight"],
  },
];

/* ---------- Malay and Chinese ---------- */

// Adds the English words the rules look for, so "kereta api ke Pulau Pinang"
// or "槟城的火车" still match.
const HINTS = [
  [/kereta ?api|keretapi|komuter|火车|列车|高铁|铁路/, "train"],
  [/kapal terbang|penerbangan|机票|航班|飞机/, "flight"],
  [/pulau pinang|槟城/, "penang"],
  [/怡保/, "ipoh"],
  [/兰卡威/, "langkawi"],
  [/普吉/, "phuket"],
  [/香港/, "hong kong"],
  [/台北|台湾/, "taipei"],
  [/bayar|pembayaran|付款|支付|付钱/, "payment"],
  [/masa terbaik|最佳|什么时候|何时/, "best time"],
  [/rancang|jadual perjalanan|规划|行程|计划/, "plan trip"],
  [/hotel|penginapan|menginap|酒店|住宿|旅馆/, "hotel"],
  [/batal|bayaran balik|取消|退款|改期/, "cancel"],
  [/jejak|状态|追踪|延误|登机口/, "track status"],
  [/tiket|baucar|电子票|凭证|登机牌/, "ticket"],
  [/log masuk|daftar akaun|kata laluan|登录|注册|密码|账户/, "sign in account"],
  [/bagasi|行李/, "baggage"],
  [/\b(hai|helo|salam)\b|apa khabar|你好|您好|嗨/, "hello"],
  [/terima kasih|谢谢|多谢/, "thanks"],
  [/bandingkan|banding|比较|对比|哪个好/, "compare"],
  [/murah|bajet|percutian|cadang|ke mana|terbaik|便宜|预算|推荐|建议|去哪|最好/, "suggest best trip"],
  [/pantai|海滩|海边/, "beach"],
  [/makanan|美食/, "food"],
  [/keluarga|家庭|孩子/, "family"],
  [/东京|日本/, "tokyo"],
  [/巴厘|峇里/, "bali"],
  [/伦敦|英国/, "london"],
  [/沙巴|亚庇|神山/, "sabah"],
  [/巴黎|法国/, "paris"],
  [/新加坡/, "singapore"],
  [/曼谷|泰国/, "bangkok"],
  [/迪拜/, "dubai"],
  [/首尔|韩国/, "seoul"],
  [/悉尼|澳洲|澳大利亚/, "sydney"],
  [/伊斯坦布尔|土耳其/, "istanbul"],
];
function normalise(text) {
  let q = String(text || "").toLowerCase().replace(/[’']/g, "'");
  for (const [rx, words] of HINTS) if (rx.test(q)) q += ` ${words}`;
  const days = /(\d+)\s*(?:hari|天|日)/.exec(q);
  if (days) q += ` ${days[1]} day trip`;
  return q;
}
const isMalay = (t) => /\b(saya|nak|mahu|ke|boleh|tak|apa|hai|salam|terima kasih|bila|berapa|percutian|tiket)\b/i.test(t);

/* ---------- Conversation ---------- */

// Mode and destination mentioned earlier in the chat, newest first.
function context(messages) {
  let mode = null;
  let dest = null;
  let days = null;
  for (let i = messages.length - 2; i >= 0 && (!mode || !dest); i -= 1) {
    const q = normalise(messages[i].content);
    if (messages[i].role === "user") {
      mode = mode || modeOf(q);
      dest = dest || findDestinations(q)[0] || null;
      days = days || daysOf(q);
    }
  }
  return { mode, dest, days };
}
const lastAssistant = (messages) => {
  for (let i = messages.length - 2; i >= 0; i -= 1) if (messages[i].role === "assistant") return String(messages[i].content || "");
  return "";
};

const GREETING_EN =
  "Hi! I'm Flexi, BookingFlex's AI travel assistant. 👋 How can I help you today?\n\nAre you looking to book a flight, a hotel, a train, or a full trip (flight + hotel)? I can also compare destinations and suggest the best trip for your budget.";
const GREETING_MS =
  "Hai! Saya Flexi, pembantu perjalanan AI BookingFlex. 👋 Apa yang boleh saya bantu?\n\nAnda nak tempah penerbangan, hotel, kereta api, atau pakej penuh (penerbangan + hotel)? Saya juga boleh bandingkan destinasi dan cadangkan percutian terbaik ikut bajet anda.";

/** Returns { text, suggestions } for the latest user message. */
function quickReply(messages) {
  const raw = String(messages[messages.length - 1].content || "");
  const q = normalise(raw);
  const ctx = context(messages);
  const prev = lastAssistant(messages).toLowerCase();
  const dests = findDestinations(q);
  const mode = modeOf(q);
  const there = /\b(there|it|that place|sana|situ)\b/.test(q);
  const dest = dests[0] || ((there || mode || /\b(plan|cost|budget|when|best time|how much|hotels?|flights?)\b/.test(q)) && ctx.dest) || null;

  // Who are you / hello
  if (/\b(who are you|what are you|are you (an? )?(ai|bot|robot|human)|your name|siapa (awak|kamu))\b/.test(q)) {
    return { text: GREETING_EN, suggestions: MODE_CHIPS };
  }
  const greetingOnly = /^\s*(hi+|hello|hey|hai|helo|salam|assalamualaikum|yo|good (morning|afternoon|evening)|apa khabar|你好|您好|嗨)[\s!.,]*$/i.test(raw.trim()) || (/\bhello\b/.test(q) && raw.trim().split(/\s+/).length <= 3);
  if (greetingOnly) return { text: isMalay(raw) ? GREETING_MS : GREETING_EN, suggestions: MODE_CHIPS };

  // Comparisons: two or more places, or flight vs train.
  const comparing = /\b(compare|comparison|vs\.?|versus|or|better|difference|which (one|is)|banding)\b/.test(q);
  if (comparing && dests.length >= 2) return compareDestinations(dests, q);
  if (comparing && dests.length === 1 && ctx.dest && ctx.dest !== dests[0] && /\bvs|versus|compare|or\b/.test(q)) return compareDestinations([ctx.dest, dests[0]], q);
  if (mode === "compare-transport" || (/\b(flight|fly)\b.*\b(or|vs|versus)\b.*\btrain\b|\btrain\b.*\b(or|vs|versus)\b.*\b(flight|fly)\b/.test(q))) return transportCompare(dest);
  if (/^why not\b/.test(q) && dests[0]) {
    const pickName = (/my pick: ([^,.]+)/.exec(prev) || [])[1];
    const picked = pickName ? findDestinations(pickName)[0] : ctx.dest;
    if (picked && picked !== dests[0]) return whyNot(dests[0], picked, ctx.days);
    return destinationAnswer(q, dests[0]);
  }
  if (/compare with another place/.test(q) && ctx.dest) {
    const alt = ALL.filter((d) => d !== ctx.dest && d.tags.some((t) => ctx.dest.tags.includes(t)))[0];
    return compareDestinations([ctx.dest, alt], q);
  }

  // Recommendations: best trip, ideas, budget.
  if (/\b(suggest|recommend|best (trip|place|destination|holiday)|where (should|to|can) (i|we) go|ideas?|not sure|cheaper ideas|honeymoon|holiday|vacation|getaway|trip under|under rm)\b/.test(q) && dests.length === 0) {
    return recommend(q, ctx.days);
  }
  if (!dests.length && !mode && (budgetOf(q) || (interestsOf(q).length && /\b(trip|go|travel|visit|place)\b/.test(q)))) return recommend(q, ctx.days);

  // Help topics (payment, tickets, cancelling…).
  for (const h of HELP) if (h.test.test(q) && !(mode && dests.length)) return { text: h.text, suggestions: h.suggestions };

  // Booking: flight, hotel, train or both, with or without a place yet.
  if (mode) return modeAnswer(mode, dest, q);
  // A place after Flexi asked "where would you like to go?" keeps the earlier mode.
  if (dests.length && ctx.mode && /where would you like to go|ke mana/.test(prev)) return modeAnswer(ctx.mode, dests[0], q);

  if (dest) return destinationAnswer(q, dest);

  if (/\b(thanks?|thank you|terima kasih|tq|ok(ay)?|great|cool|nice)\b/.test(q)) {
    return { text: "You're welcome! Anything else for your trip? I can find flights, hotels or trains, or compare places for you.", suggestions: MODE_CHIPS };
  }
  if (/\b(bye|goodbye|see you)\b/.test(q)) return { text: "Have a great trip! Come back any time. ✈️", suggestions: [] };

  return {
    text: "Sorry, I didn't quite get that. I can help you:\n• book a flight, hotel, train, or flight + hotel\n• compare destinations (\"Bali vs Phuket\") or flight vs train\n• suggest the best trip for your budget (\"beach trip in December under RM 2,000\")\n• with payments, e-tickets and tracking\nWhat would you like to do?",
    suggestions: [...MODE_CHIPS, "Compare Bali vs Phuket", "Best trip under RM 2,000"],
  };
}

// Never suggest the question that was just asked.
const _reply = quickReply;
function quickReplyClean(messages) {
  const r = _reply(messages);
  const asked = String(messages[messages.length - 1].content || "").trim().toLowerCase();
  return { ...r, suggestions: (r.suggestions || []).filter((x) => x.toLowerCase() !== asked).slice(0, 5) };
}

/** Text only (older callers). */
const quickAnswer = (messages) => quickReplyClean(messages).text;

module.exports = { quickReply: quickReplyClean, quickAnswer };
