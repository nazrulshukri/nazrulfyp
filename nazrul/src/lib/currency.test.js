import {
  chargeNote,
  countryFromTimeZone,
  currencyForCountry,
  formatPrice,
  getCurrency,
  resetCurrencyToLocation,
  setCurrency,
} from "./currency";

afterEach(() => {
  try {
    localStorage.clear();
  } catch {
    /* ignore */
  }
});

test("Malaysian ringgit keeps the RM style", () => {
  setCurrency("MYR");
  expect(formatPrice(2869)).toBe("RM 2,869.00");
  expect(formatPrice(2869, { whole: true })).toBe("RM 2,869");
  expect(chargeNote(100)).toBe("");
});

test("converts and formats other currencies", () => {
  setCurrency("USD");
  expect(formatPrice(100)).toMatch(/^\$2\d\.\d\d$/);
  expect(formatPrice(100, { code: "JPY", whole: true })).toMatch(/^¥3,\d{3}$/);
  expect(chargeNote(100)).toBe("Charged as RM 100.00");
  expect(getCurrency().chosen).toBe(true);
});

test("ignores unknown currency codes", () => {
  setCurrency("GBP");
  setCurrency("XYZ");
  expect(getCurrency().code).toBe("GBP");
});

test("maps location to currency", () => {
  expect(countryFromTimeZone("Asia/Kuala_Lumpur")).toBe("MY");
  expect(countryFromTimeZone("Australia/Perth")).toBe("AU");
  expect(countryFromTimeZone("America/Los_Angeles")).toBe("US");
  expect(currencyForCountry("my")).toBe("MYR");
  expect(currencyForCountry("FR")).toBe("EUR");
  expect(currencyForCountry("BR")).toBe("USD"); // not offered, falls back to USD
});

test("match my location clears the saved choice", () => {
  setCurrency("EUR");
  resetCurrencyToLocation();
  expect(getCurrency().chosen).toBe(false);
});
