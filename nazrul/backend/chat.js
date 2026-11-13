// BookingFlex travel assistant: POST /chat streams a reply as
// Server-Sent Events. With ANTHROPIC_API_KEY (backend/.env locally, or the
// Vercel env vars live) Claude answers; without it, free built-in answers.
const express = require("express");
const AnthropicModule = require("@anthropic-ai/sdk");
const { quickReply } = require("./quickAnswers");

const Anthropic = AnthropicModule.default || AnthropicModule;
const router = express.Router();

const MODEL = "claude-opus-5-5";
const MAX_HISTORY = 20; // messages kept per request
const MAX_CHARS = 2000; // per user message
const RATE_LIMIT = { windowMs: 60_000, max: 12 }; // per IP, best effort

// Stable text first so it can be cached between requests.
const SYSTEM_PROMPT = `You are Flexi, the friendly travel assistant on BookingFlex, a Malaysian travel booking website for flights, hotels, vacation packages (flight + hotel) and trains.

What BookingFlex offers (sample inventory, prices in MYR):
- Flights from Kuala Lumpur (KUL) and other airports to London (LHR), Tokyo (HND), Bali (DPS), Singapore (SIN), Bangkok (BKK), Paris (CDG), Dubai (DXB), Seoul (ICN), Sydney (SYD) and Kota Kinabalu (BKI). Airlines include Malaysia Airlines, British Airways, Emirates, Singapore Airlines, Qatar Airways and Turkish Airlines. Results can be sorted by Cheapest, Fastest or Earliest and filtered by stops, departure time, journey time and airline.
- Hotels in London, Kuala Lumpur, Bali, Tokyo, Paris and Singapore, with room choices, guest reviews and free cancellation on many rooms.
- Vacations: one search books return flights and shows hotels for the same dates.
- Trains: KTM ETS (Platinum and Gold) from KL Sentral to Ipoh, Butterworth and Padang Besar; KLIA Ekspres and KLIA Transit between KL Sentral, TBS, KLIA and KLIA2. Trips across both networks change at KL Sentral.
- Payment: card (Visa, Mastercard, Amex), PayPal, FPX online banking, e-wallets (Touch 'n Go, GrabPay, Boost) and Apple Pay. After paying, the e-ticket, train ticket or hotel voucher is emailed as a PDF and can be downloaded or added to a calendar.
- "My trips" lists past bookings; "Flight status" and "Help centre" are in the top menu.

How to talk:
- When someone just says hi (or asks who you are), introduce yourself as Flexi, BookingFlex's AI travel assistant, and ask whether they want to book a flight, a hotel, a train, or a full trip (flight + hotel).
- Ask one short question at a time to fill in what's missing: where to, when, how many days, budget, who's travelling.
- When asked to compare (destinations, or flight vs train), give a short side-by-side for each option: travel time from KL, sample flight fare, hotel per night, rough total for the trip, best season, what it's good for. Then say clearly which one you'd pick and why.
- When asked for the best trip, recommend 2–3 places that fit their budget, month and interests, with one line on why each fits, and name your top pick.
- Plain text only (no Markdown tables or headings); short bullet lines with "•" are fine.

How to help:
- Help travellers choose destinations, compare options, plan itineraries and understand how to book on BookingFlex. Point them to the right search tab (Flights, Hotels, Vacations or Trains) on the home page.
- You cannot see live availability, make or change bookings, or take payments. Fares shown on the site are sample prices; say so if asked about exact prices or availability.
- For a booking problem you can't solve, suggest the Help centre page.
- Keep replies short and friendly: a few sentences or a short list. Reply in the language the traveller writes in (for example English or Malay).
- Never ask for card numbers, CVVs, passwords or passport numbers.`;

let client = null;
const getClient = () => {
  if (!client) client = new Anthropic({ maxRetries: 2, timeout: 60_000 });
  return client;
};

const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_LIMIT.windowMs);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT.max;
}

// Accept only well-formed user/assistant turns from the browser.
function cleanHistory(raw) {
  if (!Array.isArray(raw)) return null;
  const messages = raw
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim(),
    )
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") return null;
  return messages;
}

// Sends a built-in answer a few words at a time so it types out like the AI,
// then the suggested next questions (shown as tappable chips).
async function streamQuickAnswer(messages, send, res) {
  const reply = quickReply(messages);
  const words = reply.text.split(/(?<=\s)/);
  send({ type: "mode", mode: "quick" });
  for (let i = 0; i < words.length && !res.writableEnded && !res.destroyed; i += 4) {
    send({ type: "text", text: words.slice(i, i + 4).join("") });
    await new Promise((resolve) => setTimeout(resolve, 18));
  }
  if (reply.suggestions && reply.suggestions.length) send({ type: "suggestions", items: reply.suggestions });
  send({ type: "done" });
}

router.post("/", async (req, res) => {
  const messages = cleanHistory(req.body && req.body.messages);
  if (!messages) {
    return res.status(400).json({ error: "Send a messages array ending with a user message." });
  }
  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
  if (rateLimited(ip)) {
    return res.status(429).json({ error: "You're sending messages quickly. Please wait a minute and try again." });
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  const send = (event) => res.write(`data: ${JSON.stringify(event)}\n\n`);

  // No API key: answer for free from BookingFlex's built-in travel answers.
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    await streamQuickAnswer(messages, send, res);
    return res.end();
  }

  let stream;
  // Stop generating (and paying for) a reply if the browser disconnects.
  res.on("close", () => {
    if (stream && !res.writableFinished) stream.abort();
  });

  let sentText = false;
  try {
    stream = getClient().beta.messages.stream({
      model: MODEL,
      max_tokens: 4096, // short chat replies; caps cost on a public site
      output_config: { effort: "low" }, // chat is latency-sensitive
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default", // re-run a declined request on Anthropic's recommended fallback model
      cache_control: { type: "ephemeral" },
      system: SYSTEM_PROMPT,
      messages,
    });
    stream.on("text", (text) => {
      sentText = true;
      send({ type: "text", text });
    });
    const final = await stream.finalMessage();
    if (final.stop_reason === "refusal") {
      send({ type: "refusal", text: "Sorry, I can't help with that. Try asking me about flights, hotels, trains or your trip." });
    }
    send({ type: "done" });
  } catch (error) {
    if (error instanceof Anthropic.APIUserAbortError) return res.end();
    if (error instanceof Anthropic.APIError) console.error(`Chat API error ${error.status}:`, error.message);
    else console.error("Chat error:", error);
    // Bad key, no credit or Claude unreachable: fall back to the free answers.
    if (!sentText) {
      await streamQuickAnswer(messages, send, res);
      return res.end();
    }
    let message = "The assistant is unavailable right now. Please try again shortly.";
    if (error instanceof Anthropic.RateLimitError) {
      message = "The assistant is busy right now. Please try again in a moment.";
    }
    send({ type: "error", message });
  }
  res.end();
});

module.exports = router;
