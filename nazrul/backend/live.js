// Live travel data for the Track page.
//   GET /live/trains         KTM trains now (data.gov.my GTFS-Realtime, no key)
//   GET /live/flights        aircraft over Malaysia now (OpenSky, or adsb.lol as backup; no key)
//   GET /live/flight-status  ?flight=MH370 (AviationStack, needs AVIATIONSTACK_KEY)
const express = require("express");
const GtfsRealtime = require("gtfs-realtime-bindings");

const router = express.Router();
const KTMB_URL = "https://api.data.gov.my/gtfs-realtime/vehicle-position/ktmb/";
// Peninsular + East Malaysia. OpenSky charges 2 credits per call for this box,
// so results are cached to stay inside the anonymous daily allowance.
const MALAYSIA_BOX = { lamin: 0.8, lomin: 99.5, lamax: 7.5, lomax: 119.5 };
const OPENSKY_URL = `https://opensky-network.org/api/states/all?${new URLSearchParams(MALAYSIA_BOX)}`;

function cached(ttlMs, load) {
  let value = null;
  let at = 0;
  let pending = null;
  return async () => {
    if (value && Date.now() - at < ttlMs) return value;
    if (!pending) {
      pending = load()
        .then((v) => {
          value = v;
          at = Date.now();
          return v;
        })
        .finally(() => {
          pending = null;
        });
    }
    try {
      return await pending;
    } catch (error) {
      if (value) return { ...value, stale: true }; // serve the last good data
      throw error;
    }
  };
}

async function fetchWithTimeout(url, options = {}, ms = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Vehicle labels in the KTMB feed start with the service type.
const KTM_SERVICES = [
  [/^ETS/i, "KTM ETS", "Intercity electric train"],
  [/^EG|^EP/i, "KTM ETS", "Intercity electric train"],
  [/^SCS|^SCK|^KTM|^EMU/i, "KTM Komuter", "Commuter train, Klang Valley"],
  [/^DMU/i, "Shuttle Timur", "East Coast diesel train"],
  [/^INT|^ER/i, "KTM Intercity", "Intercity train"],
];
const describeTrain = (label = "") => {
  const match = KTM_SERVICES.find(([pattern]) => pattern.test(label));
  return match ? { service: match[1], description: match[2] } : { service: "KTM", description: "KTM train" };
};

const loadTrains = cached(20_000, async () => {
  const res = await fetchWithTimeout(KTMB_URL);
  if (!res.ok) throw new Error(`KTMB feed returned ${res.status}`);
  const feed = GtfsRealtime.transit_realtime.FeedMessage.decode(new Uint8Array(await res.arrayBuffer()));
  const trains = feed.entity
    .filter((e) => e.vehicle && e.vehicle.position)
    .map((e) => {
      const v = e.vehicle;
      const label = (v.vehicle && v.vehicle.label) || (v.vehicle && v.vehicle.id) || e.id;
      return {
        id: e.id,
        label,
        trip: v.trip && v.trip.tripId,
        lat: v.position.latitude,
        lng: v.position.longitude,
        bearing: v.position.bearing || 0,
        speedKmh: v.position.speed != null ? Math.round(v.position.speed) : null,
        updatedAt: v.timestamp ? Number(v.timestamp) * 1000 : null,
        ...describeTrain(label),
      };
    });
  return {
    source: "KTMB GTFS-Realtime · data.gov.my",
    fetchedAt: Date.now(),
    feedTime: feed.header && feed.header.timestamp ? Number(feed.header.timestamp) * 1000 : null,
    trains,
  };
});

// adsb.lol is a free, keyless community ADS-B feed (ODbL). It is the backup
// when OpenSky is slow or blocks the server (OpenSky refuses many cloud hosts,
// including Vercel). Three 250 nm circles cover Peninsular and East Malaysia.
const ADSB_POINTS = ["3.5/102/250", "2.5/110.5/250", "5.8/116.5/250"];
const AIRLINES = {
  MAS: "Malaysia Airlines", AXM: "AirAsia", XAX: "AirAsia X", MXD: "Batik Air Malaysia", FFM: "Firefly",
  SIA: "Singapore Airlines", TGW: "Scoot", UAE: "Emirates", QTR: "Qatar Airways", ETD: "Etihad",
  THA: "Thai Airways", AIQ: "Thai AirAsia", CPA: "Cathay Pacific", GIA: "Garuda Indonesia",
  AWQ: "Indonesia AirAsia", BTK: "Batik Air", LNI: "Lion Air", VJC: "VietJet", HVN: "Vietnam Airlines",
  CES: "China Eastern", CSN: "China Southern", CCA: "Air China", CXA: "Xiamen Air", KLM: "KLM",
  BAW: "British Airways", THY: "Turkish Airlines", SVA: "Saudia", JAL: "Japan Airlines", ANA: "ANA",
  KAL: "Korean Air", AAR: "Asiana", QFA: "Qantas", JST: "Jetstar", CEB: "Cebu Pacific",
  PAL: "Philippine Airlines", AIC: "Air India", IGO: "IndiGo", ALK: "SriLankan", RBA: "Royal Brunei",
  EVA: "EVA Air", CAL: "China Airlines", DLH: "Lufthansa", AFR: "Air France", FDX: "FedEx", UPS: "UPS",
};
const REG_COUNTRY = [
  ["9M", "Malaysia"], ["9V", "Singapore"], ["PK", "Indonesia"], ["HS", "Thailand"], ["VH", "Australia"],
  ["A6", "United Arab Emirates"], ["A7", "Qatar"], ["V8", "Brunei"], ["VN", "Vietnam"], ["RP", "Philippines"],
  ["JA", "Japan"], ["HL", "South Korea"], ["VT", "India"], ["TC", "Turkey"], ["G-", "United Kingdom"],
  ["B-", "China / Taiwan / Hong Kong"], ["N", "United States"],
];
function operatorFor(callsign, registration) {
  const airline = AIRLINES[(callsign || "").slice(0, 3).toUpperCase()];
  if (airline) return airline;
  const reg = (registration || "").toUpperCase();
  const hit = REG_COUNTRY.find(([prefix]) => reg.startsWith(prefix));
  return hit ? hit[1] : "Aircraft";
}

async function loadOpenSky(ms) {
  const headers = {};
  if (process.env.OPENSKY_TOKEN) headers.Authorization = `Bearer ${process.env.OPENSKY_TOKEN}`;
  const res = await fetchWithTimeout(OPENSKY_URL, { headers }, ms);
  if (res.status === 429) throw Object.assign(new Error("OpenSky rate limit reached"), { status: 429 });
  if (!res.ok) throw new Error(`OpenSky returned ${res.status}`);
  const data = await res.json();
  // Field order is fixed by the OpenSky API: https://openskynetwork.github.io/opensky-api/rest.html
  const flights = (data.states || [])
    .filter((s) => s[5] != null && s[6] != null && !s[8])
    .map((s) => ({
      icao24: s[0],
      callsign: (s[1] || "").trim(),
      country: AIRLINES[(s[1] || "").slice(0, 3)] || s[2],
      lng: s[5],
      lat: s[6],
      altitudeM: s[13] != null ? Math.round(s[13]) : s[7] != null ? Math.round(s[7]) : null,
      speedKmh: s[9] != null ? Math.round(s[9] * 3.6) : null,
      heading: s[10] || 0,
      climbing: s[11] > 1 ? "up" : s[11] < -1 ? "down" : "level",
    }));
  return { source: "OpenSky Network", fetchedAt: Date.now(), dataTime: data.time * 1000, flights };
}

async function loadAdsbLol(ms) {
  const results = await Promise.allSettled(
    ADSB_POINTS.map(async (point) => {
      const res = await fetchWithTimeout(`https://api.adsb.lol/v2/point/${point}`, {}, ms);
      if (!res.ok) throw new Error(`adsb.lol returned ${res.status}`);
      return res.json();
    }),
  );
  const ok = results.filter((r) => r.status === "fulfilled").map((r) => r.value);
  if (!ok.length) throw new Error("adsb.lol unavailable");
  const byHex = new Map();
  for (const data of ok) {
    for (const a of data.ac || []) {
      if (a.lat == null || a.lon == null || a.alt_baro === "ground") continue;
      const callsign = (a.flight || "").trim();
      const rate = a.baro_rate ?? a.geom_rate ?? 0;
      byHex.set(a.hex, {
        icao24: a.hex,
        callsign,
        country: operatorFor(callsign, a.r),
        lng: a.lon,
        lat: a.lat,
        altitudeM: typeof a.alt_baro === "number" ? Math.round(a.alt_baro * 0.3048) : null,
        speedKmh: a.gs != null ? Math.round(a.gs * 1.852) : null,
        heading: a.track ?? a.true_heading ?? 0,
        climbing: rate > 200 ? "up" : rate < -200 ? "down" : "level",
      });
    }
  }
  const now = Math.max(...ok.map((d) => d.now || 0));
  return { source: "adsb.lol", fetchedAt: Date.now(), dataTime: now || Date.now(), flights: [...byHex.values()] };
}

// Ask both at once: OpenSky if it answers quickly (it has the most aircraft),
// otherwise adsb.lol. Keeps the whole request inside Vercel's 10 s limit.
const loadFlights = cached(120_000, async () => {
  const backup = loadAdsbLol(6000);
  backup.catch(() => {}); // handled below; avoid an unhandled rejection
  try {
    const primary = await loadOpenSky(4500);
    if (primary.flights.length) return primary;
  } catch (error) {
    console.warn("OpenSky unavailable, using adsb.lol:", error.message);
  }
  return backup;
});

router.get("/trains", async (req, res) => {
  try {
    res.set("Cache-Control", "public, max-age=15");
    res.json(await loadTrains());
  } catch (error) {
    console.error("Live trains error:", error.message);
    res.status(502).json({ message: "Live train data is unavailable right now. Please try again shortly." });
  }
});

router.get("/flights", async (req, res) => {
  try {
    res.set("Cache-Control", "public, max-age=60");
    res.json(await loadFlights());
  } catch (error) {
    console.error("Live flights error:", error.message);
    res.status(error.status === 429 ? 429 : 502).json({
      message:
        error.status === 429
          ? "The free live-flight allowance is used up for now. Please try again later."
          : "Live flight data is unavailable right now. Please try again shortly.",
    });
  }
});

const STATUS_LABELS = {
  scheduled: "Scheduled",
  active: "In the air",
  landed: "Landed",
  cancelled: "Cancelled",
  incident: "Incident",
  diverted: "Diverted",
};

router.get("/flight-status", async (req, res) => {
  const flight = String(req.query.flight || "").replace(/\s+/g, "").toUpperCase();
  if (!/^[A-Z0-9]{2}\d{1,4}[A-Z]?$/.test(flight)) {
    return res.status(400).json({ message: "Enter a flight number like MH370 or AK6100." });
  }
  const key = process.env.AVIATIONSTACK_KEY;
  if (!key) {
    return res.status(503).json({ message: "Flight status isn't set up yet (add AVIATIONSTACK_KEY to the server)." });
  }
  try {
    // AviationStack's free plan only allows plain HTTP; the call is made server-side.
    const url = `http://api.aviationstack.com/v1/flights?${new URLSearchParams({ access_key: key, flight_iata: flight })}`;
    const response = await fetchWithTimeout(url, {}, 10000);
    const data = await response.json();
    if (data.error) {
      console.error("AviationStack error:", data.error.code || data.error.type, data.error.message || data.error.info);
      return res.status(502).json({ message: "The flight status service returned an error. Please try again later." });
    }
    const results = (data.data || []).map((f) => ({
      flight: f.flight && f.flight.iata,
      airline: f.airline && f.airline.name,
      airlineIata: f.airline && f.airline.iata,
      status: STATUS_LABELS[f.flight_status] || f.flight_status || "Unknown",
      rawStatus: f.flight_status,
      date: f.flight_date,
      departure: {
        airport: f.departure && f.departure.airport,
        iata: f.departure && f.departure.iata,
        terminal: f.departure && f.departure.terminal,
        gate: f.departure && f.departure.gate,
        scheduled: f.departure && f.departure.scheduled,
        estimated: f.departure && f.departure.estimated,
        actual: f.departure && f.departure.actual,
        delay: f.departure && f.departure.delay,
      },
      arrival: {
        airport: f.arrival && f.arrival.airport,
        iata: f.arrival && f.arrival.iata,
        terminal: f.arrival && f.arrival.terminal,
        gate: f.arrival && f.arrival.gate,
        baggage: f.arrival && f.arrival.baggage,
        scheduled: f.arrival && f.arrival.scheduled,
        estimated: f.arrival && f.arrival.estimated,
        actual: f.arrival && f.arrival.actual,
        delay: f.arrival && f.arrival.delay,
      },
      live:
        f.live && f.live.latitude != null
          ? { lat: f.live.latitude, lng: f.live.longitude, altitudeM: Math.round(f.live.altitude || 0), heading: f.live.direction }
          : null,
    }));
    // Codeshare flights come back too; show the exact flight number first.
    results.sort((a, b) => (b.flight === flight) - (a.flight === flight));
    res.json({ flight, source: "AviationStack", results });
  } catch (error) {
    console.error("Flight status error:", error.message);
    res.status(502).json({ message: "Flight status is unavailable right now. Please try again shortly." });
  }
});

module.exports = router;
