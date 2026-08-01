const BOOKINGS_KEY = "bookingflexBookings:v1";
const PROFILE_KEY = "bookingflexProfile:v1";
const ROLE_KEY = "bookingflexRole:v1";
const VOUCHERS_KEY = "bookingflexVouchers:v1";
const FEATURE_PAGES_KEY = "bookingflexFeaturePages:v1";

export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "super-admin",
};

export const ROLE_LABELS = {
  [USER_ROLES.USER]: "User",
  [USER_ROLES.ADMIN]: "Admin",
  [USER_ROLES.SUPER_ADMIN]: "Super Admin",
};

const DEFAULT_VOUCHERS = [
  {
    id: "voucher-flex-2026",
    code: "FLEX2026",
    title: "Future travel launch",
    discountType: "percent",
    discountValue: 12,
    maxDiscount: 180,
    status: "active",
    audience: "All travellers",
    expiresAt: "2026-12-31",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

const DEFAULT_FEATURE_PAGES = [
  {
    id: "travel-insights-2026",
    title: "Travel Insights 2026",
    path: "/feature-lab/travel-insights-2026",
    status: "In design",
    ownerRole: USER_ROLES.SUPER_ADMIN,
    releaseWindow: "Q3 2026",
    description: "A premium analytics page for demand, popular routes, and traveller loyalty signals.",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
};

export const getCurrentUserEmail = () => localStorage.getItem("userEmail") || "";

export const inferRoleFromEmail = (email = "") => {
  const normalized = String(email).trim().toLowerCase();

  if (
    normalized.startsWith("superadmin") ||
    normalized.startsWith("super-admin") ||
    normalized.includes("+super") ||
    normalized.includes("super.admin")
  ) {
    return USER_ROLES.SUPER_ADMIN;
  }

  if (
    normalized.startsWith("admin") ||
    normalized.includes("+admin") ||
    normalized.includes("admin.")
  ) {
    return USER_ROLES.ADMIN;
  }

  return USER_ROLES.USER;
};

export const normalizeRole = (role, email = getCurrentUserEmail()) => {
  if (Object.values(USER_ROLES).includes(role)) return role;
  return inferRoleFromEmail(email);
};

export const setCurrentUserSession = (email, role) => {
  const nextEmail = String(email || "").trim();
  if (nextEmail) localStorage.setItem("userEmail", nextEmail);
  localStorage.setItem(ROLE_KEY, normalizeRole(role, nextEmail));
};

export const clearCurrentUserSession = () => {
  localStorage.removeItem("userEmail");
  localStorage.removeItem(ROLE_KEY);
};

export const getCurrentUserRole = () => {
  const email = getCurrentUserEmail();
  return normalizeRole(localStorage.getItem(ROLE_KEY), email);
};

export const getRoleLabel = (role = getCurrentUserRole()) => ROLE_LABELS[normalizeRole(role)] || "User";

export const canAccessAdmin = (role = getCurrentUserRole()) =>
  [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(normalizeRole(role));

export const canAccessSuperAdmin = (role = getCurrentUserRole()) =>
  normalizeRole(role) === USER_ROLES.SUPER_ADMIN;

export const getBookingHistory = (email = getCurrentUserEmail()) => {
  const allBookings = safeParse(localStorage.getItem(BOOKINGS_KEY), {});
  return allBookings[email] || [];
};

export const getAllBookingHistory = () => {
  const allBookings = safeParse(localStorage.getItem(BOOKINGS_KEY), {});
  return Object.entries(allBookings).flatMap(([email, bookings]) =>
    Array.isArray(bookings)
      ? bookings.map((booking) => ({
          ...booking,
          email,
        }))
      : []
  );
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

const getSeededList = (key, fallback) => {
  const stored = safeParse(localStorage.getItem(key), null);
  if (Array.isArray(stored)) return stored;

  localStorage.setItem(key, JSON.stringify(fallback));
  return fallback;
};

const makeId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const getVouchers = () => getSeededList(VOUCHERS_KEY, DEFAULT_VOUCHERS);

export const getActiveVouchers = () => {
  const now = new Date();
  return getVouchers().filter((voucher) => {
    const expiry = voucher.expiresAt ? new Date(`${voucher.expiresAt}T23:59:59`) : null;
    return voucher.status === "active" && (!expiry || expiry >= now);
  });
};

export const saveVoucher = (voucher) => {
  const vouchers = getVouchers();
  const normalizedCode = String(voucher.code || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");

  const nextVoucher = {
    id: voucher.id || makeId("voucher"),
    code: normalizedCode,
    title: voucher.title || "BookingFlex voucher",
    discountType: voucher.discountType === "fixed" ? "fixed" : "percent",
    discountValue: Math.max(Number(voucher.discountValue) || 0, 0),
    maxDiscount: Number(voucher.maxDiscount) || 0,
    status: voucher.status || "active",
    audience: voucher.audience || "All travellers",
    expiresAt: voucher.expiresAt || "",
    createdAt: voucher.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updated = [nextVoucher, ...vouchers.filter((item) => item.id !== nextVoucher.id)];
  localStorage.setItem(VOUCHERS_KEY, JSON.stringify(updated));
  return nextVoucher;
};

export const updateVoucherStatus = (id, status) => {
  const updated = getVouchers().map((voucher) =>
    voucher.id === id ? { ...voucher, status, updatedAt: new Date().toISOString() } : voucher
  );
  localStorage.setItem(VOUCHERS_KEY, JSON.stringify(updated));
  return updated;
};

export const deleteVoucher = (id) => {
  const updated = getVouchers().filter((voucher) => voucher.id !== id);
  localStorage.setItem(VOUCHERS_KEY, JSON.stringify(updated));
  return updated;
};

export const calculateVoucherDiscount = (voucher, amount) => {
  const baseAmount = Math.max(Number(amount) || 0, 0);
  if (!voucher || baseAmount <= 0) return 0;

  const rawDiscount =
    voucher.discountType === "fixed"
      ? Number(voucher.discountValue) || 0
      : (baseAmount * (Number(voucher.discountValue) || 0)) / 100;

  const cappedDiscount =
    voucher.maxDiscount && voucher.discountType === "percent"
      ? Math.min(rawDiscount, Number(voucher.maxDiscount))
      : rawDiscount;

  return Math.min(Math.max(cappedDiscount, 0), baseAmount);
};

export const applyVoucherToAmount = (code, amount) => {
  const normalizedCode = String(code || "").trim().toUpperCase();
  const voucher = getActiveVouchers().find((item) => item.code === normalizedCode);

  if (!normalizedCode) {
    return { valid: false, message: "Enter a voucher code." };
  }

  if (!voucher) {
    return { valid: false, message: "Voucher is invalid, expired, or inactive." };
  }

  const discount = calculateVoucherDiscount(voucher, amount);

  if (discount <= 0) {
    return { valid: false, message: "Voucher cannot be applied to this booking." };
  }

  return {
    valid: true,
    voucher,
    discount,
    total: Math.max((Number(amount) || 0) - discount, 0),
  };
};

const slugify = (value) =>
  String(value || "new-page")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "new-page";

export const getFeaturePages = () => getSeededList(FEATURE_PAGES_KEY, DEFAULT_FEATURE_PAGES);

export const saveFeaturePage = (page) => {
  const pages = getFeaturePages();
  const id = page.id || slugify(page.title || page.path || "new-page");
  const nextPage = {
    id,
    title: page.title || "New page",
    path: page.path || `/feature-lab/${id}`,
    status: page.status || "In design",
    ownerRole: page.ownerRole || USER_ROLES.SUPER_ADMIN,
    releaseWindow: page.releaseWindow || "Future",
    description: page.description || "Feature details will be maintained by the super admin.",
    createdAt: page.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updated = [nextPage, ...pages.filter((item) => item.id !== nextPage.id)];
  localStorage.setItem(FEATURE_PAGES_KEY, JSON.stringify(updated));
  return nextPage;
};

export const updateFeaturePageStatus = (id, status) => {
  const updated = getFeaturePages().map((page) =>
    page.id === id ? { ...page, status, updatedAt: new Date().toISOString() } : page
  );
  localStorage.setItem(FEATURE_PAGES_KEY, JSON.stringify(updated));
  return updated;
};
