import React, { useCallback, useEffect, useState } from "react";
import { Check, Copy, Link2, Loader2, Mail, UserMinus, UserPlus, X } from "lucide-react";
import Avatar from "./Avatar";
import GalleryTab from "./GalleryTab";
import { RELATIONSHIPS, api } from "../../lib/social";
import { countryName, flagOf } from "../../lib/countries";

const relLabel = (v) => (RELATIONSHIPS.find(([k]) => k === v) || ["", ""])[1];

function FriendProfile({ email, onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    api(`/people/${encodeURIComponent(email)}`)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [email]);
  useEffect(() => {
    const key = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [onClose]);
  const p = data?.profile;
  return (
    <div className="hub-modal" role="dialog" aria-modal="true" aria-label="Friend profile" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="hub-modal-card">
        <button type="button" className="hub-icon-btn hub-modal-close" aria-label="Close" onClick={onClose}>
          <X size={18} />
        </button>
        {error && <p className="hub-error">{error}</p>}
        {!p && !error && <p className="hub-muted">Loading…</p>}
        {p && (
          <>
            <div className="hub-modal-head">
              <Avatar avatar={p.avatar} name={p.name} size={84} ring />
              <div>
                <h2>
                  {p.name}
                  {p.country && (
                    <span className="hub-flag" title={countryName(p.country)}>
                      {" "}
                      {flagOf(p.country)}
                    </span>
                  )}
                </h2>
                <p className="hub-muted">{[p.profession, p.location].filter(Boolean).join(" · ")}</p>
                {p.mood?.emoji && (
                  <p className="hub-feeling">
                    <span>{p.mood.emoji}</span> Feeling {p.mood.text || "good"}
                  </p>
                )}
              </div>
            </div>
            {p.bio && <p className="hub-lead">{p.bio}</p>}
            <dl className="hub-facts">
              {p.age && (
                <div>
                  <dt>Age</dt>
                  <dd>{p.age}</dd>
                </div>
              )}
              {p.relationship && (
                <div>
                  <dt>Status</dt>
                  <dd>{relLabel(p.relationship)}</dd>
                </div>
              )}
              {p.phone && (
                <div>
                  <dt>Phone</dt>
                  <dd>{p.phone}</dd>
                </div>
              )}
            </dl>
            {p.interests?.length > 0 && (
              <div className="hub-chips">
                {p.interests.map((i) => (
                  <span key={i} className="hub-chip is-on">
                    {i}
                  </span>
                ))}
              </div>
            )}
            {p.experience?.[0] && (
              <p className="hub-muted">
                Works as {p.experience[0].title}
                {p.experience[0].company ? ` at ${p.experience[0].company}` : ""}
              </p>
            )}
            {p.email && <GalleryTab email={p.email} />}
          </>
        )}
      </div>
    </div>
  );
}

function PersonRow({ person, children, onOpen }) {
  return (
    <li className="hub-person">
      <button type="button" className="hub-person-main" onClick={onOpen}>
        <Avatar avatar={person.avatar} name={person.name} size={48} />
        <span>
          <strong>
            {person.name}
            {person.country && <span className="hub-flag-sm"> {flagOf(person.country)}</span>}
          </strong>
          <small>
            {person.mood?.emoji ? `${person.mood.emoji} ` : ""}
            {person.profession || person.email}
          </small>
        </span>
      </button>
      <div className="hub-person-actions">{children}</div>
    </li>
  );
}

/** Add friends by email, share an invite link, answer requests. */
export default function FriendsTab({ onChange }) {
  const [data, setData] = useState(null);
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState(null);
  const [open, setOpen] = useState(null);

  const load = useCallback(async () => {
    try {
      setData(await api("/friends"));
    } catch (e) {
      setMsg({ error: true, text: e.message });
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  async function act(fn, success) {
    setBusy(true);
    setMsg(null);
    try {
      const r = await fn();
      const text = typeof success === "function" ? success(r) : success;
      if (text) setMsg({ text });
      await load();
      onChange && onChange();
    } catch (e) {
      setMsg({ error: true, text: e.message });
    } finally {
      setBusy(false);
    }
  }

  async function add(e) {
    e.preventDefault();
    const to = email.trim();
    if (!to) return;
    await act(
      () => api("/friends", { method: "POST", body: { email: to } }),
      (r) =>
        r.status === "accepted"
          ? `You and ${to} are now friends.`
          : r.status === "requested"
            ? `Friend request sent to ${to}.`
            : r.emailed
              ? `${to} isn't on BookingFlex yet, so we emailed them an invite.`
              : `${to} isn't on BookingFlex yet. Share this invite link with them: ${r.link}`,
    );
    setEmail("");
  }

  async function makeLink() {
    try {
      const r = await api("/invites", { method: "POST" });
      setLink(r.link);
      try {
        await navigator.clipboard.writeText(r.link);
        setMsg({ text: "Invite link copied. Paste it in WhatsApp, Telegram or anywhere." });
      } catch {
        setMsg({ text: "Here's your invite link. Copy it and send it to your friends." });
      }
    } catch (e) {
      setMsg({ error: true, text: e.message });
    }
  }

  return (
    <div className="hub-friends">
      <section className="hub-card">
        <div className="hub-card-head">
          <h2>
            <UserPlus size={18} /> Invite friends
          </h2>
        </div>
        <form className="hub-inline" onSubmit={add}>
          <input className="hub-input" type="email" required value={email} placeholder="Friend's email" aria-label="Friend's email" onChange={(e) => setEmail(e.target.value)} />
          <button type="submit" className="hub-btn" disabled={busy}>
            {busy ? <Loader2 size={16} className="hub-spin" /> : <Mail size={16} />} Add or invite
          </button>
        </form>
        <div className="hub-invite-link">
          <button type="button" className="hub-btn hub-btn-ghost" onClick={makeLink}>
            <Link2 size={16} /> Get an invite link
          </button>
          {link && (
            <span className="hub-link-box">
              <code>{link}</code>
              <button type="button" className="hub-icon-btn is-quiet" aria-label="Copy link" onClick={() => navigator.clipboard && navigator.clipboard.writeText(link)}>
                <Copy size={15} />
              </button>
            </span>
          )}
        </div>
        {msg && <p className={msg.error ? "hub-error" : "hub-notice"}>{msg.text}</p>}
      </section>

      {data?.incoming?.length > 0 && (
        <section className="hub-card">
          <div className="hub-card-head">
            <h2>Friend requests</h2>
          </div>
          <ul className="hub-people">
            {data.incoming.map((p) => (
              <PersonRow key={p.email} person={p} onOpen={() => setOpen(p.email)}>
                <button type="button" className="hub-btn" disabled={busy} onClick={() => act(() => api(`/friends/${encodeURIComponent(p.email)}/accept`, { method: "POST" }), `You and ${p.name} are now friends.`)}>
                  <Check size={15} /> Accept
                </button>
                <button type="button" className="hub-btn hub-btn-ghost" disabled={busy} onClick={() => act(() => api(`/friends/${encodeURIComponent(p.email)}`, { method: "DELETE" }), null)}>
                  Decline
                </button>
              </PersonRow>
            ))}
          </ul>
        </section>
      )}

      <section className="hub-card">
        <div className="hub-card-head">
          <h2>Your friends</h2>
          <small className="hub-muted">{data ? data.friends.length : "…"}</small>
        </div>
        {data && data.friends.length === 0 && <p className="hub-muted">No friends yet. Invite someone you'd love to travel with.</p>}
        <ul className="hub-people hub-people-grid">
          {(data?.friends || []).map((p) => (
            <PersonRow key={p.email} person={p} onOpen={() => setOpen(p.email)}>
              <button
                type="button"
                className="hub-icon-btn is-quiet"
                aria-label={`Remove ${p.name}`}
                disabled={busy}
                onClick={() => window.confirm(`Remove ${p.name} from your friends?`) && act(() => api(`/friends/${encodeURIComponent(p.email)}`, { method: "DELETE" }), null)}
              >
                <UserMinus size={16} />
              </button>
            </PersonRow>
          ))}
        </ul>
      </section>

      {data?.outgoing?.length > 0 && (
        <section className="hub-card">
          <div className="hub-card-head">
            <h2>Waiting for a reply</h2>
          </div>
          <ul className="hub-people">
            {data.outgoing.map((p) => (
              <PersonRow key={p.email} person={p} onOpen={() => {}}>
                <button type="button" className="hub-btn hub-btn-ghost" disabled={busy} onClick={() => act(() => api(`/friends/${encodeURIComponent(p.email)}`, { method: "DELETE" }), null)}>
                  Cancel
                </button>
              </PersonRow>
            ))}
          </ul>
        </section>
      )}

      {open && <FriendProfile email={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
