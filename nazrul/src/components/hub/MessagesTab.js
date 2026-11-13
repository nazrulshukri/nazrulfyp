import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Info,
  Loader2,
  MessageCircle,
  Phone,
  Plus,
  Send,
  Users,
  Video,
} from "lucide-react";
import Avatar from "./Avatar";
import { useCalls } from "./CallManager";
import MessageBubble from "./chat/MessageBubble";
import AttachButton, { UploadStatus } from "./chat/Attachments";
import GroupMeeting from "./chat/GroupMeeting";
import { NewRoomSheet, RoomSettingsSheet } from "./chat/RoomSheets";
import { clock, dayLabel, mapi, preview } from "../../lib/messaging";
import { flagOf } from "../../lib/countries";

const POLL_MS = 2500;

/** One conversation: a friend (1-to-1) or a group room. */
function Thread({
  target,
  onBack,
  onRead,
  onOpenFriend,
  onRoomChanged,
  onLeftRoom,
}) {
  const group = target.type === "room";
  const [room, setRoom] = useState(group ? target.room : null);
  const friend = group ? null : target.friend;
  const [messages, setMessages] = useState(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [upload, setUpload] = useState(null);
  const [settings, setSettings] = useState(false);
  const [meeting, setMeeting] = useState(null); // "video" | "audio"
  const list = useRef(null);
  const latest = useRef(null);
  const { startCall, inCall } = useCalls();
  const path = group
    ? `/rooms/${target.room.id}`
    : `/chats/${encodeURIComponent(friend.email)}`;
  const sendPath = group ? `/rooms/${target.room.id}/messages` : path;
  // The parent re-creates these on every render; keep the latest in refs so
  // the polling loop below doesn't restart (and refetch) each time.
  const onReadRef = useRef(onRead);
  const onLeftRef = useRef(onLeftRoom);
  onReadRef.current = onRead;
  onLeftRef.current = onLeftRoom;

  const load = useCallback(
    async (initial) => {
      try {
        const q =
          !initial && latest.current
            ? `?after=${encodeURIComponent(latest.current)}`
            : "";
        const r = await mapi(`${path}${q}`);
        if (r.room) setRoom(r.room);
        const got = r.messages;
        if (initial) setMessages(got);
        else if (got.length)
          setMessages((m) => [
            ...(m || []),
            ...got.filter((x) => !(m || []).some((y) => y.id === x.id)),
          ]);
        if (got.length) {
          latest.current = got[got.length - 1].at;
          if (onReadRef.current) onReadRef.current();
        }
        setError(null);
      } catch (e) {
        if (e.status === 404 && group) {
          if (onLeftRef.current) onLeftRef.current();
        } else setError(e.message);
      }
    },
    [path, group],
  );

  useEffect(() => {
    latest.current = null;
    setMessages(null);
    load(true);
    const id = setInterval(() => !document.hidden && load(false), POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    const el = list.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const send = useCallback(
    async (body) => {
      const { message } = await mapi(sendPath, { method: "POST", body });
      setMessages((m) => [...(m || []), message]);
      latest.current = message.at;
      setError(null);
      return message;
    },
    [sendPath],
  );

  async function sendText(e) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setBusy(true);
    try {
      await send({ text: body });
      setText("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const sendSafe = async (body) => {
    try {
      await send(body);
    } catch (err) {
      setError(err.message);
    }
  };
  const updateMessage = (m) =>
    setMessages((list0) =>
      (list0 || []).map((x) =>
        x.id === m.id ? { ...x, ...m, from: x.from } : x,
      ),
    );

  const name = group ? room.name : friend.name;
  let lastDay = null;
  return (
    <section className="hub-thread">
      <header className="hub-thread-head">
        <button
          type="button"
          className="hub-icon-btn is-quiet hub-thread-back"
          aria-label="Back to conversations"
          onClick={onBack}
        >
          <ArrowLeft size={18} />
        </button>
        {group ? (
          <span className="hc-room-avatar">{room.icon}</span>
        ) : (
          <Avatar avatar={friend.avatar} name={friend.name} size={42} />
        )}
        <div>
          <strong>
            {name} {!group && friend.country ? flagOf(friend.country) : ""}
          </strong>
          <small>
            {group
              ? room.members
                  .map((m) => m.name)
                  .slice(0, 4)
                  .join(", ") +
                (room.members.length > 4 ? ` +${room.members.length - 4}` : "")
              : friend.mood?.emoji
                ? `${friend.mood.emoji} ${friend.mood.text || ""}`
                : "Friend"}
          </small>
        </div>
        {group ? (
          <>
            {room.meeting && (
              <button
                type="button"
                className="hub-btn hc-join"
                onClick={() => setMeeting("video")}
              >
                <Video size={16} /> Join meeting
              </button>
            )}
            <button
              type="button"
              className="hub-icon-btn"
              aria-label="Start a voice meeting"
              title="Voice meeting"
              onClick={() => setMeeting("audio")}
            >
              <Phone size={18} />
            </button>
            <button
              type="button"
              className="hub-icon-btn"
              aria-label="Start a video meeting"
              title="Video meeting"
              onClick={() => setMeeting("video")}
            >
              <Video size={18} />
            </button>
            <button
              type="button"
              className="hub-icon-btn"
              aria-label="Group info"
              title="Group info"
              onClick={() => setSettings(true)}
            >
              <Info size={18} />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="hub-icon-btn"
              aria-label={`Voice call ${friend.name}`}
              disabled={inCall}
              onClick={() => startCall(friend, "audio")}
            >
              <Phone size={18} />
            </button>
            <button
              type="button"
              className="hub-icon-btn"
              aria-label={`Video call ${friend.name}`}
              disabled={inCall}
              onClick={() => startCall(friend, "video")}
            >
              <Video size={18} />
            </button>
          </>
        )}
      </header>

      <div className="hub-thread-list" ref={list} aria-live="polite">
        {!messages && !error && (
          <p className="hub-muted hub-center">Loading…</p>
        )}
        {messages && messages.length === 0 && (
          <div className="hub-thread-empty">
            <MessageCircle size={28} />
            <p>
              {group
                ? "Say hi to the group!"
                : `Say hi to ${friend.name} and start planning your next trip together.`}
            </p>
          </div>
        )}
        {(messages || []).map((m) => {
          const day = dayLabel(m.at);
          const showDay = day !== lastDay;
          lastDay = day;
          return (
            <React.Fragment key={m.id}>
              {showDay && <p className="hub-thread-day">{day}</p>}
              <MessageBubble
                m={m}
                group={group}
                onUpdate={updateMessage}
                onMessage={onOpenFriend}
              />
            </React.Fragment>
          );
        })}
      </div>

      {error && <p className="hub-error">{error}</p>}
      <UploadStatus state={upload} onDismiss={() => setUpload(null)} />
      <div className="hub-thread-compose">
        <AttachButton
          send={sendSafe}
          onUpload={setUpload}
          disabled={Boolean(upload && !upload.error)}
        />
        <form className="hc-compose-form" onSubmit={sendText}>
          <textarea
            rows={1}
            maxLength={2000}
            value={text}
            placeholder={`Message ${name}…`}
            aria-label={`Message ${name}`}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendText(e);
              }
            }}
          />
          <button
            type="submit"
            className="hub-btn"
            aria-label="Send"
            disabled={busy || !text.trim()}
          >
            {busy ? (
              <Loader2 size={16} className="hub-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </form>
      </div>

      {settings && group && (
        <RoomSettingsSheet
          room={room}
          onClose={() => setSettings(false)}
          onChanged={(r) => {
            setRoom(r);
            onRoomChanged && onRoomChanged(r);
            load(false);
          }}
          onLeft={() => {
            setSettings(false);
            onLeftRoom && onLeftRoom();
          }}
        />
      )}
      {meeting && group && (
        <GroupMeeting
          room={room}
          video={meeting === "video"}
          onClose={() => {
            setMeeting(null);
            load(false);
          }}
        />
      )}
    </section>
  );
}

/** Chats with friends and group rooms, with attachments, calls and meetings. */
export default function MessagesTab({ onUnreadChange }) {
  const [chats, setChats] = useState(null);
  const [rooms, setRooms] = useState(null);
  const [open, setOpen] = useState(null); // { type: "dm", friend } | { type: "room", room }
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const [{ chats: dm }, { rooms: groups }] = await Promise.all([
        mapi("/chats"),
        mapi("/rooms"),
      ]);
      setChats(dm);
      setRooms(groups);
      setError(null);
      onUnreadChange &&
        onUnreadChange(
          dm.reduce((s, c) => s + c.unread, 0) +
            groups.reduce((s, r) => s + r.unread, 0),
        );
    } catch (e) {
      setError(e.message);
    }
  }, [onUnreadChange]);

  useEffect(() => {
    load();
    const id = setInterval(() => !document.hidden && load(), 5000);
    return () => clearInterval(id);
  }, [load]);

  const openFriend = useCallback(
    (person) => {
      const known = (chats || []).find((c) => c.friend.email === person.email);
      if (known) setOpen({ type: "dm", friend: known.friend });
    },
    [chats],
  );
  const key = open
    ? open.type === "room"
      ? `r-${open.room.id}`
      : `d-${open.friend.email}`
    : null;

  return (
    <div className={`hub-messages ${open ? "has-open" : ""}`}>
      <aside className="hub-card hub-convos" aria-label="Conversations">
        <div className="hc-convos-head">
          <h2>Messages</h2>
          <button
            type="button"
            className="hub-btn hub-btn-ghost hc-new-group"
            onClick={() => setCreating(true)}
          >
            <Plus size={15} /> New group
          </button>
        </div>
        {error && <p className="hub-error">{error}</p>}
        {!chats && !error && <p className="hub-muted">Loading…</p>}

        {rooms && rooms.length > 0 && (
          <>
            <p className="hc-section">
              <Users size={13} /> Groups
            </p>
            <ul>
              {rooms.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    className={key === `r-${r.id}` ? "is-on" : ""}
                    onClick={() => setOpen({ type: "room", room: r })}
                  >
                    <span className="hc-room-avatar">{r.icon}</span>
                    <span className="hub-convo-text">
                      <strong>
                        {r.name}{" "}
                        {r.meeting && <span className="hc-live">● Live</span>}
                      </strong>
                      <small>
                        {r.last
                          ? `${r.last.mine ? "You" : r.last.from?.name}: ${preview(r.last)}`
                          : `${r.members.length} members`}
                      </small>
                    </span>
                    <span className="hub-convo-meta">
                      {r.last && <small>{clock(r.last.at)}</small>}
                      {r.unread > 0 && <b className="hub-badge">{r.unread}</b>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {chats && chats.length === 0 && (
          <p className="hub-muted">
            Add friends first, then you can chat, call and make groups here.
          </p>
        )}
        {chats && chats.length > 0 && (
          <p className="hc-section">
            <MessageCircle size={13} /> Chats
          </p>
        )}
        <ul>
          {(chats || []).map((c) => (
            <li key={c.friend.email}>
              <button
                type="button"
                className={key === `d-${c.friend.email}` ? "is-on" : ""}
                onClick={() => setOpen({ type: "dm", friend: c.friend })}
              >
                <Avatar
                  avatar={c.friend.avatar}
                  name={c.friend.name}
                  size={46}
                />
                <span className="hub-convo-text">
                  <strong>
                    {c.friend.name}{" "}
                    {c.friend.country ? flagOf(c.friend.country) : ""}
                  </strong>
                  <small>
                    {c.last
                      ? `${c.last.mine ? "You: " : ""}${preview(c.last)}`
                      : "No messages yet"}
                  </small>
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
        <Thread
          key={key}
          target={open}
          onBack={() => setOpen(null)}
          onRead={load}
          onOpenFriend={openFriend}
          onRoomChanged={load}
          onLeftRoom={() => {
            setOpen(null);
            load();
          }}
        />
      ) : (
        <section className="hub-thread hub-thread-placeholder">
          <MessageCircle size={36} />
          <p>
            Choose a chat or a group, or start a new group with up to {10 - 1}{" "}
            friends.
          </p>
        </section>
      )}
      {creating && (
        <NewRoomSheet
          onClose={() => setCreating(false)}
          onCreated={(room) => {
            setCreating(false);
            setOpen({ type: "room", room });
            load();
          }}
        />
      )}
    </div>
  );
}
