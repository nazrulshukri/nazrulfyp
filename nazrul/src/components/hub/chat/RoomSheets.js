import React, { useEffect, useState } from "react";
import { Check, Crown, Loader2, LogOut, UserMinus, X } from "lucide-react";
import Avatar from "../Avatar";
import { api } from "../../../lib/social";
import { mapi } from "../../../lib/messaging";

export const MAX_MEMBERS = 10;
const ICONS = ["✈️", "🏝️", "🗼", "🏔️", "🚆", "🎉", "💼", "🍜", "⚽", "🎧", "👨‍👩‍👧", "💬"];

function Modal({ title, onClose, children }) {
  useEffect(() => {
    const key = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [onClose]);
  return (
    <div className="hub-modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="hub-modal-card hc-sheet">
        <button type="button" className="hub-icon-btn hub-modal-close" aria-label="Close" onClick={onClose}>
          <X size={18} />
        </button>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

function FriendPicker({ exclude = [], picked, setPicked, room }) {
  const [friends, setFriends] = useState(null);
  useEffect(() => {
    api("/friends")
      .then((r) => setFriends(r.friends))
      .catch(() => setFriends([]));
  }, []);
  const list = (friends || []).filter((f) => !exclude.includes(f.email));
  const full = picked.length >= room;
  if (!friends) return <p className="hub-muted">Loading friends…</p>;
  if (!list.length) return <p className="hub-muted">{exclude.length ? "All your friends are already here." : "Add friends first, then you can make a group with them."}</p>;
  return (
    <ul className="hc-pick hc-pick-multi">
      {list.map((f) => {
        const on = picked.includes(f.email);
        return (
          <li key={f.email}>
            <button
              type="button"
              role="checkbox"
              aria-checked={on}
              disabled={!on && full}
              className={on ? "is-on" : ""}
              onClick={() => setPicked(on ? picked.filter((e) => e !== f.email) : [...picked, f.email])}
            >
              <Avatar avatar={f.avatar} name={f.name} size={38} />
              <span>
                <strong>{f.name}</strong>
                <small>{f.profession || f.email}</small>
              </span>
              <span className="hc-tick">{on && <Check size={14} />}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Create a group room with up to 9 friends. */
export function NewRoomSheet({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(ICONS[0]);
  const [picked, setPicked] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  async function create(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { room } = await mapi("/rooms", { method: "POST", body: { name: name.trim(), icon, members: picked } });
      onCreated(room);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }
  return (
    <Modal title="New group" onClose={onClose}>
      <form className="hc-form" onSubmit={create}>
        <div className="hc-room-name">
          <span className="hc-room-icon">{icon}</span>
          <input className="hub-input" autoFocus required maxLength={60} value={name} placeholder="Group name, e.g. Tokyo Dec trip" onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="hc-icons" role="radiogroup" aria-label="Group icon">
          {ICONS.map((i) => (
            <button key={i} type="button" role="radio" aria-checked={icon === i} className={icon === i ? "is-on" : ""} onClick={() => setIcon(i)}>
              {i}
            </button>
          ))}
        </div>
        <p className="hc-label">
          Add friends <small>{picked.length + 1} / {MAX_MEMBERS} people, including you</small>
        </p>
        <FriendPicker picked={picked} setPicked={setPicked} room={MAX_MEMBERS - 1} />
        {error && <p className="hub-error">{error}</p>}
        <button type="submit" className="hub-btn" disabled={busy || !name.trim()}>
          {busy ? <Loader2 size={16} className="hub-spin" /> : null} Create group
        </button>
      </form>
    </Modal>
  );
}

/** Members, add friends, rename (owner) or leave. */
export function RoomSettingsSheet({ room, onClose, onChanged, onLeft }) {
  const [name, setName] = useState(room.name);
  const [icon, setIcon] = useState(room.icon);
  const [picked, setPicked] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const members = room.members.map((m) => m.email);

  async function update(body) {
    setBusy(true);
    setError(null);
    try {
      const r = await mapi(`/rooms/${room.id}`, { method: "PUT", body });
      setPicked([]);
      if (r.room) onChanged(r.room);
      return r;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function leave() {
    if (!window.confirm(`Leave "${room.name}"? You'll stop getting its messages.`)) return;
    const r = await mapi(`/rooms/${room.id}`, { method: "PUT", body: { remove: [room.me] } }).catch((e) => setError(e.message));
    if (r) onLeft();
  }

  return (
    <Modal title="Group info" onClose={onClose}>
      {room.isOwner && (
        <form
          className="hc-form"
          onSubmit={(e) => {
            e.preventDefault();
            update({ name: name.trim(), icon });
          }}
        >
          <div className="hc-room-name">
            <span className="hc-room-icon">{icon}</span>
            <input className="hub-input" required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
            <button type="submit" className="hub-btn hub-btn-ghost" disabled={busy || (name.trim() === room.name && icon === room.icon)}>
              Save
            </button>
          </div>
          <div className="hc-icons" role="radiogroup" aria-label="Group icon">
            {ICONS.map((i) => (
              <button key={i} type="button" role="radio" aria-checked={icon === i} className={icon === i ? "is-on" : ""} onClick={() => setIcon(i)}>
                {i}
              </button>
            ))}
          </div>
        </form>
      )}
      <p className="hc-label">
        Members <small>{members.length} / {MAX_MEMBERS}</small>
      </p>
      <ul className="hc-pick">
        {room.members.map((m) => (
          <li key={m.email}>
            <div className="hc-member">
              <Avatar avatar={m.avatar} name={m.name} size={38} />
              <span>
                <strong>
                  {m.name} {m.email === room.owner && <Crown size={13} aria-label="Owner" />}
                </strong>
                <small>{m.email === room.owner ? "Owner" : "Member"}</small>
              </span>
              {room.isOwner && m.email !== room.owner && (
                <button type="button" className="hub-icon-btn is-quiet" aria-label={`Remove ${m.name}`} disabled={busy} onClick={() => window.confirm(`Remove ${m.name} from the group?`) && update({ remove: [m.email] })}>
                  <UserMinus size={16} />
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {room.isOwner && members.length < MAX_MEMBERS && (
        <>
          <p className="hc-label">Add friends</p>
          <FriendPicker exclude={members} picked={picked} setPicked={setPicked} room={MAX_MEMBERS - members.length} />
          {picked.length > 0 && (
            <button type="button" className="hub-btn" disabled={busy} onClick={() => update({ add: picked })}>
              Add {picked.length} {picked.length === 1 ? "friend" : "friends"}
            </button>
          )}
        </>
      )}
      {error && <p className="hub-error">{error}</p>}
      <button type="button" className="hub-btn hub-btn-ghost hc-leave" onClick={leave}>
        <LogOut size={16} /> Leave group
      </button>
    </Modal>
  );
}
