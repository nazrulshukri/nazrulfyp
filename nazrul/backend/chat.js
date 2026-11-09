// BookingFlex AI travel assistant: POST /chat streams Claude's reply as
// Server-Sent Events. Needs ANTHROPIC_API_KEY in backend/.env (local) or in
// the Vercel project's environment variables (live site).
const express = require("express");
const AnthropicModule = require("@anthropic-ai/sdk");

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

router.post("/", async (req, res) => {
  const messages = cleanHistory(req.body && req.body.messages);
  if (!messages) {
    return res.status(400).json({ error: "Send a messages array ending with a user message." });
  }
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    return res.status(503).json({ error: "The assistant isn't set up yet. Add ANTHROPIC_API_KEY to the server settings." });
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

  let stream;
  // Stop generating (and paying for) a reply if the browser disconnects.
  res.on("close", () => {
    if (stream && !res.writableFinished) stream.abort();
  });

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
    stream.on("text", (text) => send({ type: "text", text }));
    const final = await stream.finalMessage();
    if (final.stop_reason === "refusal") {
      send({ type: "refusal", text: "Sorry, I can't help with that. Try asking me about flights, hotels, trains or your trip." });
    }
    send({ type: "done" });
  } catch (error) {
    let message = "The assistant is unavailable right now. Please try again shortly.";
    if (error instanceof Anthropic.AuthenticationError) {
      message = "The assistant isn't set up yet (missing or invalid ANTHROPIC_API_KEY).";
    } else if (error instanceof Anthropic.RateLimitError) {
      message = "The assistant is busy right now. Please try again in a moment.";
    } else if (error instanceof Anthropic.APIUserAbortError) {
      return res.end();
    }
    if (!(error instanceof Anthropic.APIError)) console.error("Chat error:", error);
    else console.error(`Chat API error ${error.status}:`, error.message);
    send({ type: "error", message });
  }
  res.end();
});

module.exports = router;
