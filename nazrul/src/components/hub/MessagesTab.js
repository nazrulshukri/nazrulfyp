import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, MessageCircle, Phone, Send, Video } from "lucide-react";
import Avatar from "./Avatar";
import { useCalls } from "./CallManager";
import { clock, dayLabel, mapi } from "../../lib/messaging";

const POLL_MS = 2500;

function Thread({ friend, onBack, onRead }) {
  const [messages, setMessages] = useState(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const list = useRef(null);
  const latest = useRef(null);
  const { startCall, inCall } = useCalls();

  const scrollDown = () => {
    const el = list.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  const load = useCallback(
    async (initial) => {
      try {
        const q = !initial && latest.current ? `?after=${encodeURIComponent(latest.current)}` : "";
        const { messages: got } = await mapi(`/chats/${encodeURIComponent(friend.email)}${q}`);
        if (initial) setMessages(got);
        else if (got.length) setMessages((m) => [...(m || []), ...got.filter((x) => !(m || []).some((y) => y.id === x.id))]);
        if (got.length) {
          latest.current = got[got.length - 1].at;
          onRead && onRead();
        }
        setError(null);
      } catch (e) {
        setError(e.message);
      }
    },
    [friend.email, onRead],
  );

  useEffect(() => {
    latest.current = null;
    setMessages(null);
    load(true);
    const id = setInterval(() => !document.hidden && load(false), POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  useEffect(scrollDown, [messages]);

  async function send(e) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setBusy(true);
    try {
      const { message } = await mapi(`/chats/${encodeURIComponent(friend.email)}`, { method: "POST", body: { text: body } });
      setMessages((m) => [...(m || []), message]);
      latest.current = message.at;
      setText("");
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  let lastDay = null;
  return (
    <section className="hub-thread">
      <header className="hub-thread-head">
        <button type="button" className="hub-icon-btn is-quiet hub-thread-back" aria-label="Back to conversations" onClick={onBack}>
          <ArrowLeft size={18} />
        </button>
        <Avatar avatar={friend.avatar} name={friend.name} size={42} />
        <div>
          <strong>{friend.name}</strong>
          <small>{friend.mood?.emoji ? `${friend.mood.emoji} ${friend.mood.text || ""}` : "Friend"}</small>
        </div>
        <button type="button" className="hub-icon-btn" aria-label={`Voice call ${friend.name}`} disabled={inCall} onClick={() => startCall(friend, "audio")}>
          <Phone size={18} />
        </button>
        <button type="button" className="hub-icon-btn" aria-label={`Video call ${friend.name}`} disabled={inCall} onClick={() => startCall(friend, "video")}>
          <Video size={18} />
        </button>
      </header>

      <div className="hub-thread-list" ref={list} aria-live="polite">
        {!messages && !error && <p className="hub-muted hub-center">Loading…</p>}
        {messages && messages.length === 0 && (
          <div className="hub-thread-empty">
            <MessageCircle size={28} />
            <p>Say hi to {friend.name} and start planning your next trip together.</p>
          </div>
        )}
        {(messages || []).map((m) => {
          const day = dayLabel(m.at);
          const showDay = day !== lastDay;
          lastDay = day;
          return (
            <React.Fragment key={m.id}>
              {showDay && <p className="hub-thread-day">{day}</p>}
              <div className={`hub-bubble ${m.mine ? "is-mine" : ""}`}>
                <p>{m.text}</p>
                <small>
                  {clock(m.at)}
                  {m.mine ? (m.read ? " · Seen" : " · Sent") : ""}
                </small>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {error && <p className="hub-error">{error}</p>}
      <form className="hub-thread-compose" onSubmit={send}>
        <textarea
          rows={1}
          maxLength={2000}
          value={text}
          placeholder={`Message ${friend.name}…`}
          aria-label={`Message ${friend.name}`}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(e);
            }
          }}
        />
        <button type="submit" className="hub-btn" aria-label="Send" disabled={busy || !text.trim()}>
          {busy ? <Loader2 size={16} className="hub-spin" /> : <Send size={16} />}
        </button>
      </form>
    </section>
  );
}

/** Conversations with friends, a live chat thread, and call buttons. */
export default function MessagesTab({ onUnreadChange }) {
  const [chats, setChats] = useState(null);
  const [open, setOpen] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const { chats: list } = await mapi("/chats");
      setChats(list);
      setError(null);
      onUnreadChange && onUnreadChange(list.reduce((s, c) => s + c.unread, 0));
    } catch (e) {
      setError(e.message);
    }
  }, [onUnreadChange]);

  useEffect(() => {
    load();
    const id = setInterval(() => !document.hidden && load(), 5000);
    return () => clearInterval(id);
  }, [load]);

  return (
    <div className={`hub-messages ${open ? "has-open" : ""}`}>
      <aside className="hub-card hub-convos" aria-label="Conversations">
        <h2>Messages</h2>
        {error && <p className="hub-error">{error}</p>}
        {!chats && !error && <p className="hub-muted">Loading…</p>}
        {chats && chats.length === 0 && <p className="hub-muted">Add friends first, then you can chat and call them here.</p>}
        <ul>
          {(chats || []).map((c) => (
            <li key={c.friend.email}>
              <button type="button" className={open && open.email === c.friend.email ? "is-on" : ""} onClick={() => setOpen(c.friend)}>
                <Avatar avatar={c.friend.avatar} name={c.friend.name} size={46} />
                <span className="hub-convo-text">
                  <strong>{c.friend.name}</strong>
                  <small>{c.last ? `${c.last.mine ? "You: " : ""}${c.last.text}` : "No messages yet"}</small>
                </span>
                <span className="hub-convo-meta">
                  {c.last && <small>{clock(c.last.at)}</small>}
                  {c.unread > 0 && <b className="hub-badge">{c.unread}</b>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      {open ? (
        <Thread key={open.email} friend={open} onBack={() => setOpen(null)} onRead={load} />
      ) : (
        <section className="hub-thread hub-thread-placeholder">
          <MessageCircle size={36} />
          <p>Choose a friend to chat, or start a voice or video call.</p>
        </section>
      )}
    </div>
  );
}
