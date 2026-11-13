import React, { useState } from "react";
import { BedDouble, CalendarPlus, Check, Download, FileText, MapPin, MessageCircle, PiggyBank, Plane, TrainFront, UserPlus } from "lucide-react";
import Avatar from "../Avatar";
import { clock, downloadIcs, fileHref, fileSize, googleCalendarUrl, mapi } from "../../../lib/messaging";
import { flagOf } from "../../../lib/countries";

const RM = (n) => `RM ${Number(n || 0).toLocaleString("en-MY", { maximumFractionDigits: 0 })}`;
const when = (d, opts = {}) =>
  new Date(d).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", ...opts });

function Poll({ m, onUpdate }) {
  const p = m.payload;
  const [busy, setBusy] = useState(false);
  const total = p.options.reduce((s, o) => s + o.votes, 0);
  async function vote(i) {
    setBusy(true);
    try {
      const r = await mapi(`/msg/${m.id}/vote`, { method: "POST", body: { option: i } });
      onUpdate(r.message);
    } catch {
      /* the next refresh shows the right state */
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="hc-poll">
      <strong>📊 {p.question}</strong>
      <small>{p.multi ? "Choose one or more" : "Choose one"}</small>
      {p.options.map((o, i) => {
        const pct = total ? Math.round((o.votes / total) * 100) : 0;
        return (
          <button key={i} type="button" className={`hc-poll-opt ${o.mine ? "is-on" : ""}`} disabled={busy} aria-pressed={o.mine} onClick={() => vote(i)}>
            <i style={{ width: `${pct}%` }} />
            <span>
              {o.mine ? <Check size={14} /> : <span className="hc-poll-dot" />} {o.text}
            </span>
            <b>{o.votes}</b>
          </button>
        );
      })}
      <small>
        {p.voters} {p.voters === 1 ? "person" : "people"} voted
      </small>
    </div>
  );
}

function EventCard({ p }) {
  return (
    <div className="hc-card hc-event">
      <div className="hc-event-date">
        <small>{new Date(p.start).toLocaleDateString("en-GB", { month: "short" })}</small>
        <b>{new Date(p.start).getDate()}</b>
      </div>
      <div>
        <strong>{p.title}</strong>
        <small>
          {when(p.start)}
          {p.end ? ` – ${new Date(p.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}
        </small>
        {p.location && (
          <small>
            <MapPin size={12} /> {p.location}
          </small>
        )}
        {p.note && <p>{p.note}</p>}
        <span className="hc-actions">
          <button type="button" onClick={() => downloadIcs(p)}>
            <CalendarPlus size={14} /> Add to calendar
          </button>
          <a href={googleCalendarUrl(p)} target="_blank" rel="noopener noreferrer">
            Google Calendar
          </a>
        </span>
      </div>
    </div>
  );
}

function ContactCard({ p, onMessage }) {
  return (
    <div className="hc-card hc-contact">
      <Avatar avatar={p.avatar} name={p.name} size={44} />
      <div>
        <strong>
          {p.name} {p.country && flagOf(p.country)}
        </strong>
        <small>{p.email}</small>
      </div>
      <span className="hc-actions">
        {onMessage && (
          <button type="button" onClick={() => onMessage(p)}>
            <MessageCircle size={14} /> Message
          </button>
        )}
        <a href={`/dashboard?tab=friends`}>
          <UserPlus size={14} /> Friends
        </a>
      </span>
    </div>
  );
}

function TicketCard({ p }) {
  const Icon = p.type === "hotel" ? BedDouble : p.type === "train" ? TrainFront : Plane;
  return (
    <div className={`hc-card hc-ticket is-${p.type}`}>
      <div className="hc-ticket-top">
        <Icon size={18} />
        <strong>{p.title || "Booking"}</strong>
        {p.verified && (
          <span className="hc-verified" title="Booked on BookingFlex">
            <Check size={12} /> BookingFlex
          </span>
        )}
      </div>
      {(p.origin || p.destination) && (
        <div className="hc-ticket-route">
          <b>{p.origin || "—"}</b>
          <span aria-hidden="true">
            <Icon size={14} />
          </span>
          <b>{p.destination || "—"}</b>
        </div>
      )}
      {p.subtitle && <small>{p.subtitle}</small>}
      <div className="hc-ticket-foot">
        {p.startAt && <small>{when(p.startAt)}</small>}
        {p.reference && <small>Ref {p.reference}</small>}
        {p.travellers ? <small>{p.travellers} traveller{p.travellers > 1 ? "s" : ""}</small> : null}
      </div>
    </div>
  );
}

function SavingsCard({ p }) {
  const pct = p.budgetMyr ? Math.min(100, Math.round((p.savedMyr / p.budgetMyr) * 100)) : 0;
  return (
    <div className="hc-card hc-savings">
      <div className="hc-ticket-top">
        <PiggyBank size={18} />
        <strong>Saving for {p.destination}</strong>
      </div>
      <div className="hc-progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <i style={{ width: `${pct}%` }} />
      </div>
      <small>
        {RM(p.savedMyr)} of {RM(p.budgetMyr)} · {pct}%
        {p.targetDate ? ` · trip ${new Date(p.targetDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : ""}
      </small>
    </div>
  );
}

/** One chat message of any kind. In group rooms, other people's names show above. */
export default function MessageBubble({ m, group, onUpdate, onMessage }) {
  const p = m.payload || {};
  const system = group && m.kind === "text" && /^(created ".*"|added \d|removed \d|left the room|started a video meeting|ended the meeting)/.test(m.text);
  if (system) {
    return (
      <p className="hub-thread-day hc-system">
        {m.mine ? "You" : m.from?.name} {m.text}
      </p>
    );
  }
  const media = m.kind === "image" || m.kind === "video";
  return (
    <div className={`hc-row ${m.mine ? "is-mine" : ""}`}>
      {group && !m.mine && <Avatar avatar={m.from?.avatar} name={m.from?.name} size={30} />}
      <div className={`hub-bubble ${m.mine ? "is-mine" : ""} ${m.kind !== "text" ? `hc-kind-${m.kind}` : ""} ${media ? "is-media" : ""}`}>
        {group && !m.mine && <span className="hc-author">{m.from?.name}</span>}
        {m.kind === "image" && (
          <a href={fileHref(p.url)} target="_blank" rel="noopener noreferrer">
            <img className="hc-media" src={fileHref(p.url)} alt={m.text || p.name || "Photo"} loading="lazy" />
          </a>
        )}
        {m.kind === "video" && (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video className="hc-media" src={fileHref(p.url)} poster={fileHref(p.poster)} controls playsInline preload="metadata" />
        )}
        {m.kind === "file" && (
          <a className="hc-card hc-file" href={fileHref(p.url)} download={p.name}>
            <FileText size={26} />
            <span>
              <strong>{p.name}</strong>
              <small>{p.size ? fileSize(p.size) : "File"}</small>
            </span>
            <Download size={16} />
          </a>
        )}
        {m.kind === "poll" && <Poll m={m} onUpdate={onUpdate} />}
        {m.kind === "event" && <EventCard p={p} />}
        {m.kind === "contact" && <ContactCard p={p} onMessage={onMessage} />}
        {m.kind === "ticket" && <TicketCard p={p} />}
        {m.kind === "savings" && <SavingsCard p={p} />}
        {m.text && <p>{m.text}</p>}
        <small>
          {clock(m.at)}
          {m.mine && !group ? (m.read ? " · Seen" : " · Sent") : ""}
        </small>
      </div>
    </div>
  );
}
