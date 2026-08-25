const BOOKINGS_KEY = "bookingflexBookings:v1";
const PROFILE_KEY = "bookingflexProfile:v1";

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
};

export const getCurrentUserEmail = () => localStorage.getItem("userEmail") || "";

export const getBookingHistory = (email = getCurrentUserEmail()) => {
  const allBookings = safeParse(localStorage.getItem(BOOKINGS_KEY), {});
  return allBookings[email] || [];
};

export const saveBookingForUser = (email, booking) => {
  if (!email || !booking) return [];

  const allBookings = safeParse(localStorage.getItem(BOOKINGS_KEY), {});
  const existing = allBookings[email] || [];
  const bookingId = booking.bookingId || `TEMP-${Date.now()}`;
  const nextBooking = {
    ...booking,
    bookingId,
    savedAt: booking.savedAt || new Date().toISOString(),
  };

  const withoutDuplicate = existing.filter((item) => item.bookingId !== bookingId);
  const updated = [nextBooking, ...withoutDuplicate];
  allBookings[email] = updated;
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(allBookings));
  return updated;
};

export const getProfile = (email = getCurrentUserEmail()) => {
  const profiles = safeParse(localStorage.getItem(PROFILE_KEY), {});
  return profiles[email] || {
    fullName: "",
    phone: "",
    nationality: "",
    passportNumber: "",
    preferredAirport: "",
    cabinPreference: "Economy",
    notifications: true,
  };
};

export const saveProfile = (email, profile) => {
  if (!email) return profile;

  const profiles = safeParse(localStorage.getItem(PROFILE_KEY), {});
  profiles[email] = {
    ...getProfile(email),
    ...profile,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles));
  return profiles[email];
};

export const getDaysUntil = (dateValue) => {
  if (!dateValue) return null;

  const departure = new Date(dateValue);
  if (Number.isNaN(departure.getTime())) return null;

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfDeparture = new Date(departure.getFullYear(), departure.getMonth(), departure.getDate());
  return Math.ceil((startOfDeparture - startOfToday) / 86400000);
};

export const formatFlightDate = (dateValue) => {
  if (!dateValue) return "-";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return String(dateValue);

  return new Intl.DateTimeFormat("en-MY", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const formatMoney = (amount) => {
  const value = Number(amount);
  if (!Number.isFinite(value)) return amount || "-";

  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
  }).format(value);
};
