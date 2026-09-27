// Sample Malaysian rail network used to build illustrative timetables.
// Distances, times and fares are approximations for the prototype only.

export const STATIONS = {
  "KL Sentral": { code: "KLS", coords: [3.134, 101.6865] },
  "Terminal Bersepadu Selatan(TBS)": { code: "TBS", short: "TBS", coords: [3.0761, 101.7106] },
  KLIA: { code: "KLIA", short: "KLIA T1", coords: [2.756, 101.705] },
  KLIA2: { code: "KLIA2", short: "KLIA T2", coords: [2.7441, 101.6856] },
  Ipoh: { code: "IPH", coords: [4.5975, 101.0747] },
  Butterworth: { code: "BTW", coords: [5.3937, 100.365] },
  "Padang Besar": { code: "PDB", coords: [6.6626, 100.3217] },
};

// Each line lists stations in order with the cumulative km and the shape between them.
const LINES = {
  airport: {
    stations: [
      ["KL Sentral", 0],
      ["Terminal Bersepadu Selatan(TBS)", 8],
      ["KLIA", 57],
      ["KLIA2", 59],
    ],
    shape: [
      [3.134, 101.6865],
      [3.0761, 101.7106],
      [2.9887, 101.7187],
      [2.9168, 101.6553],
      [2.8317, 101.6689],
      [2.756, 101.705],
      [2.7441, 101.6856],
    ],
  },
  north: {
    stations: [
      ["KL Sentral", 0],
      ["Ipoh", 205],
      ["Butterworth", 365],
      ["Padang Besar", 535],
    ],
    via: {
      "KL Sentral|Ipoh": ["Kuala Kubu Bharu", "Tanjung Malim", "Slim River", "Tapah Road", "Kampar", "Batu Gajah"],
      "Ipoh|Butterworth": ["Sungai Siput", "Kuala Kangsar", "Taiping", "Parit Buntar", "Bukit Mertajam"],
      "Butterworth|Padang Besar": ["Bukit Mertajam", "Sungai Petani", "Gurun", "Alor Setar", "Arau"],
    },
    shape: [
      [3.134, 101.6865],
      [3.567, 101.638],
      [3.685, 101.519],
      [4.021, 101.19],
      [4.315, 101.155],
      [4.5975, 101.0747],
      [4.768, 100.94],
      [4.851, 100.74],
      [5.363, 100.456],
      [5.3937, 100.365],
      [5.647, 100.487],
      [6.117, 100.369],
      [6.429, 100.27],
      [6.6626, 100.3217],
    ],
  },
};

const lineOf = (station) =>
  Object.keys(LINES).filter((key) =>
    LINES[key].stations.some(([name]) => name === station),
  );

const kmBetween = (line, a, b) => {
  const km = (name) => LINES[line].stations.find(([n]) => n === name)[1];
  return Math.abs(km(a) - km(b));
};

// Shape points between two stations on one line (inclusive).
function shapeBetween(line, a, b) {
  const shape = LINES[line].shape;
  const nearest = ([lat, lng]) =>
    shape.reduce(
      (best, p, i) => {
        const d = (p[0] - lat) ** 2 + (p[1] - lng) ** 2;
        return d < best.d ? { d, i } : best;
      },
      { d: Infinity, i: 0 },
    ).i;
  const i = nearest(STATIONS[a].coords);
  const j = nearest(STATIONS[b].coords);
  const part = shape.slice(Math.min(i, j), Math.max(i, j) + 1);
  return i <= j ? part : part.reverse();
}

function stationsBetween(line, a, b) {
  const list = LINES[line].stations.map(([n]) => n);
  const i = list.indexOf(a);
  const j = list.indexOf(b);
  const main = i <= j ? list.slice(i, j + 1) : list.slice(j, i + 1).reverse();
  if (!LINES[line].via) return main;
  const out = [main[0]];
  for (let k = 1; k < main.length; k += 1) {
    const forward = LINES[line].via[`${main[k - 1]}|${main[k]}`];
    const back = LINES[line].via[`${main[k]}|${main[k - 1]}`];
    out.push(...(forward || (back ? [...back].reverse() : [])), main[k]);
  }
  return out;
}

const SERVICES = {
  north: [
    {
      brand: "ETS Platinum",
      operator: "KTM ETS",
      color: "#1c3f94",
      kmh: 88,
      perKm: 0.21,
      base: 4,
      prefix: "EP",
      departures: ["06:00", "08:30", "11:00", "14:20", "17:45", "20:15"],
      stopEvery: 2,
      amenities: ["Café car", "Power sockets", "Wi-Fi"],
    },
    {
      brand: "ETS Gold",
      operator: "KTM ETS",
      color: "#b5892b",
      kmh: 76,
      perKm: 0.17,
      base: 3,
      prefix: "EG",
      departures: ["07:15", "10:05", "13:10", "16:30", "19:40"],
      stopEvery: 1,
      amenities: ["Café car", "Power sockets"],
    },
  ],
  airport: [
    {
      brand: "KLIA Ekspres",
      operator: "ERL",
      color: "#7b2d8e",
      express: true,
      fixed: { KLIA: 28, KLIA2: 33 },
      fare: 55,
      prefix: "XP",
      departures: ["05:00", "06:30", "08:00", "10:00", "12:20", "15:00", "18:10", "21:30"],
      amenities: ["Non-stop", "Luggage racks", "Wi-Fi"],
    },
    {
      brand: "KLIA Transit",
      operator: "ERL",
      color: "#0d8a8a",
      kmh: 95,
      perKm: 0.9,
      base: 2,
      maxFare: 55,
      prefix: "TR",
      departures: ["05:30", "07:00", "09:10", "11:40", "14:00", "16:50", "19:30", "22:45"],
      stopEvery: 1,
      amenities: ["Luggage racks", "Step-free access"],
    },
  ],
};

const toMin = (hhmm) => {
  const [h, m] = hhmm.split(/[:.]/).map(Number);
  return h * 60 + m;
};
export const toHHMM = (mins) => {
  const m = ((mins % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

function legServices(line, from, to) {
  const km = kmBetween(line, from, to);
  const stops = stationsBetween(line, from, to);
  return SERVICES[line]
    .filter((s) => {
      if (!s.express) return true;
      const pair = [from, to];
      return pair.includes("KL Sentral") && pair.some((p) => s.fixed[p]);
    })
    .map((s) => {
      const minutes = s.express
        ? s.fixed[from === "KL Sentral" ? to : from]
        : Math.round((km / s.kmh) * 60) + 4;
      const fare = s.express
        ? s.fare
        : Math.min(s.maxFare || Infinity, Math.round(s.base + km * s.perKm));
      const shownStops = s.express
        ? [from, to]
        : stops.filter(
            (_, i) => i === 0 || i === stops.length - 1 || i % (s.stopEvery || 1) === 0,
          );
      return { ...s, minutes, fare, km, stops: shownStops, line };
    });
}

/**
 * Build the list of journeys between two stations for a date.
 * Returns { journeys, path, error }.
 */
export function planJourneys(from, to) {
  if (!STATIONS[from] || !STATIONS[to])
    return {
      journeys: [],
      path: [],
      error: `We don’t have timetables for ${!STATIONS[from] ? from : to} yet.`,
    };
  if (from === to)
    return { journeys: [], path: [], error: "Choose two different stations." };

  const shared = lineOf(from).find((l) => lineOf(to).includes(l));
  const journeys = [];
  let path;

  if (shared) {
    path = shapeBetween(shared, from, to);
    legServices(shared, from, to).forEach((service) => {
      service.departures.forEach((dep, i) => {
        const start = toMin(dep);
        const stopTimes = service.stops.map((name, k) => ({
          name,
          time: toHHMM(
            start + Math.round((service.minutes * k) / Math.max(1, service.stops.length - 1)),
          ),
        }));
        journeys.push({
          id: `${service.prefix}${i}`,
          number: `${service.prefix} ${9000 + service.departures.length * 10 + i * 7}`,
          brand: service.brand,
          operator: service.operator,
          color: service.color,
          departureTime: dep.replace(".", ":"),
          arrivalTime: toHHMM(start + service.minutes),
          minutes: service.minutes,
          nextDay: start + service.minutes >= 1440,
          fare: service.fare,
          changes: 0,
          stops: stopTimes,
          amenities: service.amenities,
          seatsLeft: 4 + ((i * 7 + service.minutes) % 37),
        });
      });
    });
  } else {
    // Cross-network trip: change at KL Sentral.
    const [lineA] = lineOf(from);
    const [lineB] = lineOf(to);
    path = [...shapeBetween(lineA, from, "KL Sentral"), ...shapeBetween(lineB, "KL Sentral", to)];
    const first = legServices(lineA, from, "KL Sentral").sort((a, b) => a.minutes - b.minutes)[0];
    legServices(lineB, "KL Sentral", to).forEach((second) => {
      second.departures.forEach((dep, i) => {
        const secondStart = toMin(dep);
        const start = secondStart - 20 - first.minutes;
        const total = first.minutes + 20 + second.minutes;
        journeys.push({
          id: `${first.prefix}-${second.prefix}${i}`,
          number: `${first.prefix} + ${second.prefix} ${9100 + i * 7}`,
          brand: `${first.brand} + ${second.brand}`,
          operator: second.operator,
          color: second.color,
          departureTime: toHHMM(start),
          arrivalTime: toHHMM(secondStart + second.minutes),
          minutes: total,
          nextDay: secondStart + second.minutes >= 1440,
          fare: first.fare + second.fare,
          changes: 1,
          stops: [
            { name: from, time: toHHMM(start) },
            { name: "KL Sentral", time: toHHMM(start + first.minutes), change: true },
            ...second.stops.slice(1).map((name, k) => ({
              name,
              time: toHHMM(
                secondStart +
                  Math.round((second.minutes * (k + 1)) / Math.max(1, second.stops.length - 1)),
              ),
            })),
          ],
          amenities: second.amenities,
          seatsLeft: 3 + ((i * 11) % 29),
        });
      });
    });
  }

  journeys.sort((a, b) => toMin(a.departureTime) - toMin(b.departureTime));
  return { journeys, path, error: "" };
}

export const stationCode = (name) => STATIONS[name]?.code || name.slice(0, 3).toUpperCase();
export const stationLabel = (name) => STATIONS[name]?.short || name;
