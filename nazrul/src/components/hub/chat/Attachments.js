import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BarChart3, CalendarDays, FileText, ImageIcon, Loader2, PiggyBank, Plane, Plus, Trash2, UserRound, X } from "lucide-react";
import Avatar from "../Avatar";
import { api, prepareMedia } from "../../../lib/social";
import { uploadChatFile } from "../../../lib/messaging";
import { API_BASE } from "../../../lib/apiConfig";
import { getBookingHistory } from "../../../lib/bookingStorage";
import { orderFromBooking } from "../../../lib/orders";

const ITEMS = [
  ["media", "Photos & videos", ImageIcon, "#2a78d6"],
  ["file", "File", FileText, "#7c3aed"],
  ["poll", "Poll", BarChart3, "#d97706"],
  ["event", "Event", CalendarDays, "#dc2626"],
  ["contact", "Contact", UserRound, "#ea580c"],
  ["ticket", "Flight ticket", Plane, "#0f766e"],
  ["savings", "Savings", PiggyBank, "#db2777"],
];
const MAX_BYTES = 4 * 1024 * 1024;

function Sheet({ title, onClose, children }) {
  useEffect(() => {
    const key = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [onClose]);
  // Rendered at the page root so these forms are never inside the message form.
  return createPortal(
    <div className="hub-modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="hub-modal-card hc-sheet" onSubmit={(e) => e.stopPropagation()}>
        <button type="button" className="hub-icon-btn hub-modal-close" aria-label="Close" onClick={onClose}>
          <X size={18} />
        </button>
        <h2>{title}</h2>
        {children}
      </div>
    </div>,
    document.body,
  );
}

function PollSheet({ onSend, onClose }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [multi, setMulti] = useState(false);
  const ok = question.trim() && options.filter((o) => o.trim()).length >= 2;
  return (
    <Sheet title="Create a poll" onClose={onClose}>
      <form
        className="hc-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (ok) onSend({ kind: "poll", payload: { question: question.trim(), options: options.map((o) => o.trim()).filter(Boolean), multi } });
        }}
      >
        <label>
          Question
          <input className="hub-input" autoFocus maxLength={200} value={question} placeholder="e.g. Where should we go in December?" onChange={(e) => setQuestion(e.target.value)} />
        </label>
        <fieldset>
          <legend>Options</legend>
          {options.map((o, i) => (
            <span className="hc-option" key={i}>
              <input className="hub-input" maxLength={80} value={o} placeholder={`Option ${i + 1}`} onChange={(e) => setOptions(options.map((x, j) => (j === i ? e.target.value : x)))} />
              {options.length > 2 && (
                <button type="button" className="hub-icon-btn is-quiet" aria-label={`Remove option ${i + 1}`} onClick={() => setOptions(options.filter((_, j) => j !== i))}>
                  <Trash2 size={15} />
                </button>
              )}
            </span>
          ))}
          {options.length < 8 && (
            <button type="button" className="hub-btn hub-btn-ghost" onClick={() => setOptions([...options, ""])}>
              <Plus size={15} /> Add option
            </button>
          )}
        </fieldset>
        <label className="hc-check">
          <input type="checkbox" checked={multi} onChange={(e) => setMulti(e.target.checked)} /> Allow more than one answer
        </label>
        <button type="submit" className="hub-btn" disabled={!ok}>
          Send poll
        </button>
      </form>
    </Sheet>
  );
}

const localInput = (d) => {
  const x = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return x.toISOString().slice(0, 16);
};

function EventSheet({ onSend, onClose }) {
  const start0 = new Date();
  start0.setDate(start0.getDate() + 1);
  start0.setHours(10, 0, 0, 0);
  const [title, setTitle] = useState("");
  const [start, setStart] = useState(localInput(start0));
  const [end, setEnd] = useState("");
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");
  return (
    <Sheet title="Create an event" onClose={onClose}>
      <form
        className="hc-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim() || !start) return;
          onSend({
            kind: "event",
            payload: { title: title.trim(), start: new Date(start).toISOString(), end: end ? new Date(end).toISOString() : undefined, location: location.trim(), note: note.trim() },
          });
        }}
      >
        <label>
          Title
          <input className="hub-input" autoFocus maxLength={120} value={title} placeholder="e.g. Trip planning call" onChange={(e) => setTitle(e.target.value)} />
        </label>
        <div className="hc-form-row">
          <label>
            Starts
            <input className="hub-input" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
          </label>
          <label>
            Ends (optional)
            <input className="hub-input" type="datetime-local" value={end} min={start} onChange={(e) => setEnd(e.target.value)} />
          </label>
        </div>
        <label>
          Location (optional)
          <input className="hub-input" maxLength={120} value={location} placeholder="e.g. KLIA Terminal 1, or online" onChange={(e) => setLocation(e.target.value)} />
        </label>
        <label>
          Note (optional)
          <textarea className="hub-input" rows={2} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        <button type="submit" className="hub-btn" disabled={!title.trim() || !start}>
          Send event
        </button>
      </form>
    </Sheet>
  );
}

function usePicker(load) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    let alive = true;
    load()
      .then((x) => alive && setItems(x))
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [load]);
  return { items, error };
}

const loadFriends = async () => (await api("/friends")).friends;
function ContactSheet({ onSend, onClose }) {
  const { items, error } = usePicker(loadFriends);
  return (
    <Sheet title="Share a contact" onClose={onClose}>
      {error && <p className="hub-error">{error}</p>}
      {!items && !error && <p className="hub-muted">Loading friends…</p>}
      {items && items.length === 0 && <p className="hub-muted">Add friends first to share their contact.</p>}
      <ul className="hc-pick">
        {(items || []).map((f) => (
          <li key={f.email}>
            <button type="button" onClick={() => onSend({ kind: "contact", payload: { email: f.email } })}>
              <Avatar avatar={f.avatar} name={f.name} size={40} />
              <span>
                <strong>{f.name}</strong>
                <small>{f.profession || f.email}</small>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}

// Bookings saved on the server plus older ones kept in this browser.
async function loadBookings() {
  let server = [];
  try {
    const token = localStorage.getItem("token");
    const r = await fetch(`${API_BASE}/orders/mine`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (r.ok) server = (await r.json()).orders || [];
  } catch {
    /* offline: local bookings only */
  }
  const local = getBookingHistory().map(orderFromBooking).filter(Boolean);
  const seen = new Set();
  return [...server, ...local]
    .filter((o) => o.reference && !seen.has(o.reference) && seen.add(o.reference))
    .sort((a, b) => new Date(b.startAt || 0) - new Date(a.startAt || 0));
}
function TicketSheet({ onSend, onClose }) {
  const { items, error } = usePicker(loadBookings);
  const icon = { flight: "✈️", hotel: "🏨", train: "🚆" };
  return (
    <Sheet title="Share a booking" onClose={onClose}>
      <p className="hub-muted">Friends see the route, dates and reference, never what you paid.</p>
      {error && <p className="hub-error">{error}</p>}
      {!items && !error && <p className="hub-muted">Loading your bookings…</p>}
      {items && items.length === 0 && <p className="hub-muted">No bookings yet. Book a flight, hotel or train and it will show here.</p>}
      <ul className="hc-pick">
        {(items || []).map((o) => (
          <li key={o.reference}>
            <button
              type="button"
              onClick={() =>
                onSend({
                  kind: "ticket",
                  payload: { reference: o.reference, type: o.kind, title: o.title, subtitle: o.subtitle, origin: o.origin, destination: o.destination, startAt: o.startAt, endAt: o.endAt, travellers: o.travellers },
                })
              }
            >
              <span className="hc-pick-icon">{icon[o.kind] || "🎫"}</span>
              <span>
                <strong>{o.title}</strong>
                <small>
                  {o.startAt ? new Date(o.startAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : ""} · {o.reference}
                </small>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}

const loadTrips = async () => (await api("/trips")).trips;
function SavingsSheet({ onSend, onClose }) {
  const { items, error } = usePicker(loadTrips);
  return (
    <Sheet title="Share your savings" onClose={onClose}>
      {error && <p className="hub-error">{error}</p>}
      {!items && !error && <p className="hub-muted">Loading trip plans…</p>}
      {items && items.length === 0 && <p className="hub-muted">No trip plans yet. Create one under Trips &amp; savings.</p>}
      <ul className="hc-pick">
        {(items || []).map((t) => (
          <li key={t.id}>
            <button type="button" onClick={() => onSend({ kind: "savings", payload: { tripId: t.id } })}>
              <span className="hc-pick-icon">🐷</span>
              <span>
                <strong>{t.destination}</strong>
                <small>
                  RM {Math.round(t.savedMyr).toLocaleString("en-MY")} of RM {Math.round(t.budgetMyr || 0).toLocaleString("en-MY")}
                </small>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}

/**
 * The + button next to the message box (like WhatsApp). `send(body)` posts a
 * message; uploads report progress through `onUpload(state | null)`.
 */
export default function AttachButton({ send, onUpload, disabled }) {
  const [open, setOpen] = useState(false);
  const [sheet, setSheet] = useState(null);
  const mediaInput = useRef(null);
  const fileInput = useRef(null);
  const wrap = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => wrap.current && !wrap.current.contains(e.target) && setOpen(false);
    const key = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  async function upload(file, asMedia) {
    if (!file) return;
    onUpload({ name: file.name, progress: 0 });
    try {
      if (asMedia && /^(image|video)\//.test(file.type)) {
        const m = await prepareMedia(file);
        if (m.kind === "photo") {
          const blob = await (await fetch(m.image)).blob();
          const r = await uploadChatFile(blob, "image/jpeg", file.name.replace(/\.\w+$/, ".jpg"), (p) => onUpload({ name: file.name, progress: p }));
          await send({ kind: "image", payload: { fileId: r.id } });
        } else {
          let posterId;
          if (m.poster) posterId = (await uploadChatFile(await (await fetch(m.poster)).blob(), "image/jpeg", "cover.jpg")).id;
          const r = await uploadChatFile(file, m.type, file.name, (p) => onUpload({ name: file.name, progress: p }));
          await send({ kind: "video", payload: { fileId: r.id, posterId } });
          URL.revokeObjectURL(m.preview);
        }
      } else {
        if (file.size > MAX_BYTES) throw new Error(`${file.name} is ${(file.size / 1048576).toFixed(1)} MB. Files can be up to 4 MB.`);
        const r = await uploadChatFile(file, file.type || "application/octet-stream", file.name, (p) => onUpload({ name: file.name, progress: p }));
        await send({ kind: "file", payload: { fileId: r.id } });
      }
      onUpload(null);
    } catch (err) {
      onUpload({ name: file.name, error: err.message });
    }
  }

  function pick(id) {
    setOpen(false);
    if (id === "media") mediaInput.current && mediaInput.current.click();
    else if (id === "file") fileInput.current && fileInput.current.click();
    else setSheet(id);
  }

  const done = async (body) => {
    setSheet(null);
    await send(body);
  };
  const close = () => setSheet(null);

  return (
    <div className="hc-attach" ref={wrap}>
      <button type="button" className={`hub-icon-btn hc-plus ${open ? "is-open" : ""}`} aria-label="Attach" aria-expanded={open} disabled={disabled} onClick={() => setOpen(!open)}>
        <Plus size={20} />
      </button>
      {open && (
        <div className="hc-menu" role="menu">
          {ITEMS.map(([id, label, Icon, color]) => (
            <button key={id} type="button" role="menuitem" onClick={() => pick(id)}>
              <span style={{ color }}>
                <Icon size={24} />
              </span>
              {label}
            </button>
          ))}
        </div>
      )}
      <input
        ref={mediaInput}
        type="file"
        hidden
        accept="image/*,video/mp4,video/quicktime,video/webm"
        onChange={(e) => {
          upload(e.target.files && e.target.files[0], true);
          e.target.value = "";
        }}
      />
      <input
        ref={fileInput}
        type="file"
        hidden
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,image/*,video/*,audio/*"
        onChange={(e) => {
          upload(e.target.files && e.target.files[0], false);
          e.target.value = "";
        }}
      />
      {sheet === "poll" && <PollSheet onSend={done} onClose={close} />}
      {sheet === "event" && <EventSheet onSend={done} onClose={close} />}
      {sheet === "contact" && <ContactSheet onSend={done} onClose={close} />}
      {sheet === "ticket" && <TicketSheet onSend={done} onClose={close} />}
      {sheet === "savings" && <SavingsSheet onSend={done} onClose={close} />}
    </div>
  );
}

export const UploadStatus = ({ state, onDismiss }) =>
  state ? (
    <div className={`hc-upload ${state.error ? "is-error" : ""}`} role="status">
      {state.error ? (
        <>
          <span>{state.error}</span>
          <button type="button" className="hub-icon-btn is-quiet" aria-label="Dismiss" onClick={onDismiss}>
            <X size={14} />
          </button>
        </>
      ) : (
        <>
          <Loader2 size={14} className="hub-spin" />
          <span>Sending {state.name}…</span>
          <i style={{ width: `${Math.round((state.progress || 0) * 100)}%` }} />
        </>
      )}
    </div>
  ) : null;
