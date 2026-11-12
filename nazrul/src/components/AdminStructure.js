import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { KeyRound, Link2, Lock } from "lucide-react";
import { API_BASE } from "../lib/apiConfig";
import { authHeaders } from "../lib/adminAccess";

// Where each linked collection sits in the diagram (columns left to right).
const LAYOUT = [["orders", "admins", "inquiries"], ["users"], ["payments", "hotelpayments"], ["bookings"]];

function FieldRow({ table, f }) {
  return (
    <li data-field={`${table}.${f.name}`} className={f.ref ? "is-ref" : f.key === "primary" ? "is-pk" : ""}>
      <span className="ad-er-name">
        {f.key === "primary" && <KeyRound size={12} aria-label="Primary key" />}
        {f.ref && <Link2 size={12} aria-label={`Refers to ${f.ref.to}`} />}
        {f.hidden && <Lock size={11} aria-label="Hidden from admins" />}
        {f.name}
      </span>
      <span className="ad-er-type">{f.type}</span>
      <span className="ad-er-badges">
        {f.key === "primary" && <b className="is-pk">PK</b>}
        {f.key === "unique" && <b className="is-uq">UNIQUE</b>}
        {f.key === "index" && <b>INDEX</b>}
        {f.ref && <b className="is-fk">→ {f.ref.to}</b>}
        {f.presentPct < 100 && <i title="Share of records that have this field">{f.presentPct}%</i>}
      </span>
    </li>
  );
}

function Table({ t, active, onHover }) {
  return (
    <div
      className={`ad-er-table ${active ? "is-active" : ""}`}
      data-table={t.name}
      onMouseEnter={() => onHover(t.name)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="ad-er-head">
        <strong>{t.name}</strong>
        <small>
          {t.label} · {t.count} record{t.count === 1 ? "" : "s"}
        </small>
      </div>
      {t.fields.length ? (
        <ul>
          {t.fields.map((f) => (
            <FieldRow key={f.name} table={t.name} f={f} />
          ))}
        </ul>
      ) : (
        <p className="ad-muted ad-er-empty">No records yet, so no fields to show.</p>
      )}
    </div>
  );
}

/** Entity-relationship view: tables, fields, keys, indexes and links. */
export default function AdminStructure() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [lines, setLines] = useState([]);
  const [hover, setHover] = useState(null);
  const board = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE}/admin/db/schema`, { headers: authHeaders() })
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(body.message || "Could not load the structure.");
        setData(body);
      })
      .catch((e) => setError(e.message));
  }, []);

  // Draw a connector from each reference field to the field it points at.
  const measure = useCallback(() => {
    const root = board.current;
    if (!root || !data) return;
    const box = root.getBoundingClientRect();
    const next = [];
    for (const r of data.relations) {
      const from = root.querySelector(`[data-field="${r.from}.${r.field.split(".")[0]}"]`);
      const to =
        root.querySelector(`[data-field="${r.to}.${r.toField}"]`) || root.querySelector(`[data-table="${r.to}"] .ad-er-head`);
      if (!from || !to) continue;
      const a = from.getBoundingClientRect();
      const b = to.getBoundingClientRect();
      const leftToRight = a.left < b.left;
      const x1 = (leftToRight ? a.right : a.left) - box.left;
      const x2 = (leftToRight ? b.left : b.right) - box.left;
      const y1 = a.top + a.height / 2 - box.top;
      const y2 = b.top + b.height / 2 - box.top;
      const bend = Math.max(30, Math.abs(x2 - x1) / 2) * (leftToRight ? 1 : -1);
      next.push({
        key: `${r.from}.${r.field}`,
        from: r.from,
        to: r.to,
        d: `M${x1},${y1} C${x1 + bend},${y1} ${x2 - bend},${y2} ${x2},${y2}`,
        x2,
        y2,
      });
    }
    setLines(next);
  }, [data]);

  useLayoutEffect(() => {
    measure();
    if (!board.current || !("ResizeObserver" in window)) return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(board.current);
    return () => ro.disconnect();
  }, [measure]);

  if (error) return <p className="ad-error">{error}</p>;
  if (!data) return <p className="ad-muted">Loading the database structure…</p>;

  const byName = Object.fromEntries(data.collections.map((c) => [c.name, c]));
  const linked = new Set(LAYOUT.flat());
  const standalone = data.collections.filter((c) => !linked.has(c.name));

  return (
    <div className="ad-er">
      <section className="ad-card">
        <div className="ad-card-head">
          <h2>How the tables connect</h2>
          <small>Hover a table to highlight its links</small>
        </div>
        <div className="ad-er-legend">
          <span>
            <b className="is-pk">PK</b> primary key (every record's id)
          </span>
          <span>
            <b className="is-uq">UNIQUE</b> no two records can share it
          </span>
          <span>
            <b>INDEX</b> sped-up lookups
          </span>
          <span>
            <b className="is-fk">→ table</b> points to another table
          </span>
        </div>
        <div className="ad-er-board" ref={board}>
          <svg className="ad-er-lines" aria-hidden="true">
            {lines.map((l) => (
              <g key={l.key} className={hover && (hover === l.from || hover === l.to) ? "is-hot" : hover ? "is-dim" : ""}>
                <path d={l.d} />
                <circle cx={l.x2} cy={l.y2} r="3.5" />
              </g>
            ))}
          </svg>
          {LAYOUT.map((col, i) => (
            <div className="ad-er-col" key={i}>
              {col.map((name) =>
                byName[name] ? <Table key={name} t={byName[name]} active={hover === name} onHover={setHover} /> : null,
              )}
            </div>
          ))}
        </div>

        <h3 className="ad-er-sub">Not linked to other tables</h3>
        <div className="ad-er-standalone">
          {standalone.map((t) => (
            <Table key={t.name} t={t} active={false} onHover={() => {}} />
          ))}
        </div>
      </section>

      <div className="ad-grid-2">
        <section className="ad-card">
          <div className="ad-card-head">
            <h2>Relationships</h2>
          </div>
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>From</th>
                  <th>To</th>
                  <th>Type</th>
                  <th className="ad-num">Records that match</th>
                </tr>
              </thead>
              <tbody>
                {data.relations.map((r) => (
                  <tr key={`${r.from}.${r.field}`} title={r.note}>
                    <td className="ad-mono">
                      {r.from}.{r.field}
                    </td>
                    <td className="ad-mono">
                      {r.to}.{r.toField}
                    </td>
                    <td className="ad-muted">{r.kind}</td>
                    <td className="ad-num">{r.checked ? `${r.matched} of ${r.checked}` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="ad-card">
          <div className="ad-card-head">
            <h2>Indexes</h2>
          </div>
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Table</th>
                  <th>Fields</th>
                  <th>Kind</th>
                </tr>
              </thead>
              <tbody>
                {data.collections
                  .filter((c) => c.indexes.length)
                  .flatMap((c) =>
                    c.indexes.map((ix) => (
                      <tr key={`${c.name}.${ix.name}`}>
                        <td className="ad-mono">{c.name}</td>
                        <td className="ad-mono">{ix.keys.join(" + ")}</td>
                        <td className="ad-muted">{ix.name === "_id_" ? "Primary key" : ix.unique ? "Unique" : "Index"}</td>
                      </tr>
                    )),
                  )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
