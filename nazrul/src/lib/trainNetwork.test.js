import { planJourneys, toHHMM } from "./trainNetwork";

test("north-line trips offer ETS services that end at the chosen station", () => {
  const { journeys, error, path } = planJourneys("KL Sentral", "Butterworth");
  expect(error).toBe("");
  expect(path.length).toBeGreaterThan(2);
  expect(new Set(journeys.map((j) => j.brand))).toEqual(new Set(["ETS Platinum", "ETS Gold"]));
  journeys.forEach((j) => {
    expect(j.changes).toBe(0);
    expect(j.stops[0].name).toBe("KL Sentral");
    expect(j.stops[j.stops.length - 1].name).toBe("Butterworth");
  });
});

test("airport trips include the non-stop KLIA Ekspres", () => {
  const { journeys } = planJourneys("KL Sentral", "KLIA");
  const express = journeys.filter((j) => j.brand === "KLIA Ekspres");
  expect(express.length).toBeGreaterThan(0);
  expect(express[0].minutes).toBe(28);
  expect(express[0].stops).toHaveLength(2);
});

test("trips across networks change at KL Sentral", () => {
  const { journeys } = planJourneys("KLIA", "Ipoh");
  expect(journeys.length).toBeGreaterThan(0);
  journeys.forEach((j) => {
    expect(j.changes).toBe(1);
    expect(j.stops.some((s) => s.name === "KL Sentral" && s.change)).toBe(true);
  });
});

test("unknown or identical stations return a helpful error", () => {
  expect(planJourneys("KL Sentral", "Johor Bahru").error).toMatch(/Johor Bahru/);
  expect(planJourneys("Ipoh", "Ipoh").error).toMatch(/different/);
});

test("times wrap past midnight", () => {
  expect(toHHMM(24 * 60 + 15)).toBe("00:15");
  expect(toHHMM(-30)).toBe("23:30");
});
