import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Database, Search } from "lucide-react";
import { API_BASE } from "../lib/apiConfig";
import { authHeaders } from "../lib/adminAccess";

const MAX_COLUMNS = 7;

const cell = (v) => {
  if (v == null || v === "") return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "object") return JSON.stringify(v).slice(0, 60);
  const s = String(v);
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) return d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }
  return s.length > 48 ? `${s.slice(0, 46)}…` : s;
};

async function getJson(url) {
  const res = await fetch(url, { headers: authHeaders() });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || "Could not load the database.");
  return body;
}

/** Read-only browser for the MongoDB collections (super admins). */
export default function AdminDatabase() {
  const [collections, setCollections] = useState(null);
  const [active, setActive] = useState(null);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [open, setOpen] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getJson(`${API_BASE}/admin/db`)
      .then((b) => {
        setCollections(b.collections);
        const first = b.collections.find((c) => c.count > 0) || b.collections[0];
        setActive(first && first.name);
      })
      .catch((e) => setError(e.message));
  }, []);

  // Search after the admin stops typing for a moment.
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(query.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [query]);

  const load = useCallback(async () => {
    if (!active) return;
    setLoading(true);
    setOpen(null);
    try {
      const params = new URLSearchParams({ page: String(page), q: search });
      setResult(await getJson(`${API_BASE}/admin/db/${active}?${params}`));
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [active, page, search]);
  useEffect(() => {
    load();
  }, [load]);

  const columns = useMemo(() => {
    if (!result || !result.rows.length) return [];
    const keys = [];
    for (const row of result.rows.slice(0, 20)) {
      for (const k of Object.keys(row)) if (!keys.includes(k) && k !== "_id" && k !== "_created") keys.push(k);
    }
    return [...keys.slice(0, MAX_COLUMNS), "_created"];
  }, [result]);

  return (
    <div className="ad-db">
      <aside className="ad-db-list" aria-label="Collections">
        <div className="ad-db-list-head">
          <Database size={16} /> MongoDB
        </div>
        {!collections && !error && <p className="ad-muted">Loading…</p>}
        {(collections || []).map((c) => (
          <button
            key={c.name}
            type="button"
            className={c.name === active ? "is-on" : ""}
            aria-pressed={c.name === active}
            onClick={() => {
              setActive(c.name);
              setPage(1);
              setQuery("");
              setSearch("");
            }}
          >
            <span>
              {c.label}
              <small>{c.name}</small>
            </span>
            <b>{c.count}</b>
          </button>
        ))}
      </aside>

      <section className="ad-card ad-db-main">
        <div className="ad-card-head ad-db-head">
          <h2>{result ? result.label : "Records"}</h2>
          <label className="ad-db-search">
            <Search size={15} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search this collection"
              aria-label="Search this collection"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
        <p className="ad-muted ad-db-note">Read-only. Passwords, tokens and payment details are hidden (•••).</p>
        {error && <p className="ad-error">{error}</p>}

        {result && !result.rows.length && (
          <p className="ad-muted">{search ? "No records match your search." : "This collection is empty."}</p>
        )}

        {result && result.rows.length > 0 && (
          <div className={`ad-table-wrap ${loading ? "is-loading" : ""}`}>
            <table className="ad-table ad-db-table">
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c}>{c === "_created" ? "Created" : c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <React.Fragment key={row._id}>
                    <tr
                      className={open === row._id ? "is-open" : ""}
                      tabIndex={0}
                      onClick={() => setOpen(open === row._id ? null : row._id)}
                      onKeyDown={(e) => e.key === "Enter" && setOpen(open === row._id ? null : row._id)}
                    >
                      {columns.map((c) => (
                        <td key={c} className={c === "_created" ? "ad-muted" : ""}>
                          {cell(row[c])}
                        </td>
                      ))}
                    </tr>
                    {open === row._id && (
                      <tr className="ad-db-detail">
                        <td colSpan={columns.length}>
                          <pre>{JSON.stringify(row, null, 2)}</pre>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {result && result.total > 0 && (
          <div className="ad-db-pager">
            <span className="ad-muted">
              {result.total} record{result.total === 1 ? "" : "s"} · page {result.page} of {result.pages}
            </span>
            <div>
              <button type="button" className="ad-icon-btn" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className="ad-icon-btn"
                aria-label="Next page"
                disabled={page >= result.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
