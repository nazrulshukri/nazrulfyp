// Country flags and phone numbers. Flags are emoji built from the two-letter
// country code; names come from the browser (Intl.DisplayNames) so they show
// in the visitor's language. Phone parsing uses libphonenumber-js.
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString, AsYouType } from "libphonenumber-js";

/** 🇲🇾 from "MY". */
export const flagOf = (code) =>
  /^[A-Z]{2}$/i.test(code || "") ? String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)) : "";

let names = null;
export function countryName(code) {
  if (!code) return "";
  try {
    names = names || new Intl.DisplayNames([navigator.language || "en"], { type: "region" });
    return names.of(code.toUpperCase()) || code;
  } catch {
    return code;
  }
}

/** Every country with its flag, name and calling code, sorted by name. */
export function countryList() {
  return getCountries()
    .map((code) => ({ code, flag: flagOf(code), name: countryName(code), dial: `+${getCountryCallingCode(code)}` }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Reads a phone number. Numbers starting with "+" are detected on their own;
 * local numbers ("012-345 6789") use the fallback country.
 * Returns { country, flag, international, e164, valid } (fields may be empty).
 */
export function readPhone(raw, fallbackCountry = "MY") {
  const text = String(raw || "").trim();
  if (!text) return { country: "", flag: "", international: "", e164: "", valid: false };
  const p = parsePhoneNumberFromString(text, text.startsWith("+") ? undefined : fallbackCountry);
  if (!p) {
    const typing = new AsYouType(text.startsWith("+") ? undefined : fallbackCountry);
    typing.input(text);
    const c = typing.getCountry() || "";
    return { country: c, flag: flagOf(c), international: text, e164: "", valid: false };
  }
  const country = p.country || "";
  return { country, flag: flagOf(country), international: p.formatInternational(), e164: p.number, valid: p.isValid() };
}

/** Best guess of the visitor's country from the browser language (e.g. en-MY → MY). */
export function guessCountry() {
  try {
    const region = new Intl.Locale(navigator.language || "").maximize().region;
    if (region && getCountries().includes(region)) return region;
  } catch {
    /* ignore */
  }
  return "MY";
}
