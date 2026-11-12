// Asks the server whether the signed-in user is an admin ("admin"/"super").
// The answer is cached per login token for this browser tab.
import { useEffect, useState } from "react";
import { API_BASE } from "./apiConfig";

const CACHE_KEY = "bookingflexAdminRole";

const readToken = () => {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
};

export const authHeaders = () => {
  const token = readToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function fetchAdminRole() {
  const token = readToken();
  if (!token) return null;
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "null");
    if (cached && cached.token === token) return cached.role;
  } catch {
    /* ignore */
  }
  let role = null;
  try {
    const res = await fetch(`${API_BASE}/admin/me`, { headers: authHeaders() });
    if (res.ok) role = (await res.json()).role || "admin";
    else if (![401, 403, 503].includes(res.status)) return null; // don't cache server errors
  } catch {
    return null;
  }
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ token, role }));
  } catch {
    /* ignore */
  }
  return role;
}

/** Re-checks whenever `key` changes (e.g. the current page). */
export function useAdminRole(key) {
  const [role, setRole] = useState(null);
  useEffect(() => {
    let alive = true;
    fetchAdminRole().then((r) => alive && setRole(r));
    return () => {
      alive = false;
    };
  }, [key]);
  return role;
}
