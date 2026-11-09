// GET /rates: exchange rates from MYR (free, no key) plus the visitor's
// country, which Vercel adds to every request as x-vercel-ip-country.
// Sources: open.er-api.com (ExchangeRate-API, all currencies), then
// Frankfurter (European Central Bank) as a backup. Cached for 6 hours.
const express = require("express");

const router = express.Router();
const TTL = 6 * 60 * 60 * 1000;
let cache = null;
let pending = null;

async function getJson(url, ms = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`${url} returned ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function loadRates() {
  try {
    const data = await getJson("https://open.er-api.com/v6/latest/MYR");
    if (data.result !== "success") throw new Error("ExchangeRate-API error");
    return {
      rates: data.rates,
      updated: data.time_last_update_unix * 1000,
      source: "ExchangeRate-API",
    };
  } catch (error) {
    console.warn("Rates: ExchangeRate-API failed, trying Frankfurter:", error.message);
    const data = await getJson("https://api.frankfurter.app/latest?from=MYR");
    return { rates: { ...data.rates, MYR: 1 }, updated: Date.parse(data.date), source: "European Central Bank" };
  }
}

router.get("/", async (req, res) => {
  const country = (req.headers["x-vercel-ip-country"] || "").toString().toUpperCase() || null;
  try {
    if (!cache || Date.now() - cache.at > TTL) {
      pending = pending || loadRates().finally(() => (pending = null));
      cache = { ...(await pending), at: Date.now() };
    }
    // The country differs per visitor, so only the browser may cache this.
    res.set("Cache-Control", "private, max-age=3600");
    res.json({ base: "MYR", rates: cache.rates, updated: cache.updated, source: cache.source, country });
  } catch (error) {
    console.error("Rates error:", error.message);
    if (cache) return res.json({ base: "MYR", rates: cache.rates, updated: cache.updated, source: cache.source, country, stale: true });
    res.status(502).json({ message: "Exchange rates are unavailable right now.", country });
  }
});

module.exports = router;
