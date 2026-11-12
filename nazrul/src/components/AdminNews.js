import React, { useCallback, useEffect, useState } from "react";
import { Eye, EyeOff, Pencil, Pin, Plus, Trash2 } from "lucide-react";
import { API_BASE } from "../lib/apiConfig";
import { authHeaders } from "../lib/adminAccess";

const KINDS = [
  ["voucher", "Voucher"],
  ["news", "BookingFlex news"],
  ["flight", "Flight update"],
  ["hotel", "Hotel update"],
  ["train", "Train update"],
];
const EMPTY = { kind: "news", title: "", body: "", image: "", link: "", code: "", discount: "", validUntil: "", pinned: false, published: true };

async function call(path, method = "GET", body) {
  const res = await fetch(`${API_BASE}/news${path}`, {
    method,
    headers: { ...(body ? { "Content-Type": "application/json" } : {}), ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}

/** Admins write news posts and vouchers shown on /news. */
export default function AdminNews() {
  const [posts, setPosts] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setPosts((await call("/admin")).posts);
    } catch (e) {
      setMsg({ error: true, text: e.message });
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const body = { ...form, validUntil: form.validUntil || null };
      if (editing) await call(`/admin/${editing}`, "PUT", body);
      else await call("/admin", "POST", body);
      setMsg({ text: editing ? "Post updated." : form.published ? "Published. It's live on the News page." : "Saved as a draft." });
      setForm(EMPTY);
      setEditing(null);
      load();
    } catch (err) {
      setMsg({ error: true, text: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function patch(p, change) {
    try {
      await call(`/admin/${p.id}`, "PUT", change);
      load();
    } catch (e) {
      setMsg({ error: true, text: e.message });
    }
  }

  function edit(p) {
    setEditing(p.id);
    setForm({
      kind: p.kind,
      title: p.title || "",
      body: p.body || "",
      image: p.image || "",
      link: p.link || "",
      code: p.code || "",
      discount: p.discount || "",
      validUntil: p.validUntil ? p.validUntil.slice(0, 10) : "",
      pinned: Boolean(p.pinned),
      published: Boolean(p.published),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const isVoucher = form.kind === "voucher";
  return (
    <div className="ad-news">
      <form className="ad-card ad-news-form" onSubmit={save}>
        <div className="ad-card-head">
          <h2>{editing ? "Edit post" : "New post or voucher"}</h2>
          <a href="/news" target="_blank" rel="noopener noreferrer" className="ad-muted">
            Open News page ↗
          </a>
        </div>
        <div className="ad-news-grid">
          <label>
            Type
            <select value={form.kind} onChange={(e) => set("kind", e.target.value)}>
              {KINDS.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="ad-span-2">
            Title
            <input required maxLength={120} value={form.title} placeholder={isVoucher ? "e.g. 15% off flights to Tokyo" : "e.g. New ETS departures to Penang"} onChange={(e) => set("title", e.target.value)} />
          </label>
          {isVoucher && (
            <>
              <label>
                Code
                <input required maxLength={24} value={form.code} placeholder="FLEX15" onChange={(e) => set("code", e.target.value.toUpperCase())} />
              </label>
              <label>
                Discount
                <input maxLength={40} value={form.discount} placeholder="15% off" onChange={(e) => set("discount", e.target.value)} />
              </label>
              <label>
                Valid until
                <input type="date" value={form.validUntil} onChange={(e) => set("validUntil", e.target.value)} />
              </label>
            </>
          )}
          <label className="ad-span-3">
            Details
            <textarea rows={3} maxLength={1500} value={form.body} placeholder="What's new, terms, dates…" onChange={(e) => set("body", e.target.value)} />
          </label>
          <label className="ad-span-2">
            Image link (https://…, optional)
            <input type="url" maxLength={600} value={form.image} placeholder="https://images.unsplash.com/…" onChange={(e) => set("image", e.target.value)} />
          </label>
          <label>
            "Learn more" link (optional)
            <input type="url" maxLength={600} value={form.link} placeholder="https://…" onChange={(e) => set("link", e.target.value)} />
          </label>
        </div>
        <div className="ad-news-actions">
          <label className="ad-check">
            <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} /> Published
          </label>
          <label className="ad-check">
            <input type="checkbox" checked={form.pinned} onChange={(e) => set("pinned", e.target.checked)} /> Pin to top
          </label>
          <span className="ad-news-spacer" />
          {editing && (
            <button
              type="button"
              className="ad-btn ad-btn-ghost"
              onClick={() => {
                setEditing(null);
                setForm(EMPTY);
              }}
            >
              Cancel
            </button>
          )}
          <button type="submit" className="ad-btn" disabled={busy}>
            <Plus size={16} /> {editing ? "Save changes" : form.published ? "Publish" : "Save draft"}
          </button>
        </div>
        {msg && <p className={msg.error ? "ad-error" : "ad-note"}>{msg.text}</p>}
      </form>

      <section className="ad-card ad-card-wide">
        <div className="ad-card-head">
          <h2>All posts</h2>
          <small>{posts ? posts.length : "…"}</small>
        </div>
        {posts && posts.length === 0 && <p className="ad-muted">Nothing yet. Your first post will appear on the News page.</p>}
        <ul className="ad-news-list">
          {(posts || []).map((p) => {
            const expired = p.kind === "voucher" && p.validUntil && new Date(p.validUntil) < new Date();
            return (
              <li key={p.id}>
                <span className={`ad-news-kind is-${p.kind}`}>{(KINDS.find(([k]) => k === p.kind) || ["", p.kind])[1]}</span>
                <span className="ad-news-title">
                  <strong>
                    {p.pinned && <Pin size={12} />} {p.title}
                  </strong>
                  <small className="ad-muted">
                    {p.code ? `${p.code} · ` : ""}
                    {new Date(p.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    {!p.published ? " · draft" : expired ? " · expired" : " · live"}
                  </small>
                </span>
                <button type="button" className="ad-icon-btn" title={p.published ? "Unpublish" : "Publish"} aria-label={p.published ? "Unpublish" : "Publish"} onClick={() => patch(p, { published: !p.published })}>
                  {p.published ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button type="button" className="ad-icon-btn" title="Edit" aria-label="Edit" onClick={() => edit(p)}>
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  className="ad-icon-btn"
                  title="Delete"
                  aria-label="Delete"
                  onClick={async () => {
                    if (!window.confirm(`Delete "${p.title}"?`)) return;
                    try {
                      await call(`/admin/${p.id}`, "DELETE");
                      load();
                    } catch (e) {
                      setMsg({ error: true, text: e.message });
                    }
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
