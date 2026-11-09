import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Sparkles, RotateCcw, Square, WifiOff } from "lucide-react";
import { API_BASE } from "../lib/apiConfig";

const STORAGE_KEY = "bookingflexChat:v1";
const GREETING = {
  role: "assistant",
  content: "Hi! I'm Flexi, your BookingFlex travel assistant. Ask me about flights, hotels, trains or planning your trip.",
};
const SUGGESTIONS = [
  "Plan a 5-day trip to Tokyo",
  "Which trains go from KL to Penang?",
  "How do I pay with FPX?",
  "Best time to visit Bali?",
];

const loadHistory = () => {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) && saved.length ? saved : [GREETING];
  } catch {
    return [GREETING];
  }
};

// Reads the Server-Sent Events stream from /chat and calls onEvent for each event.
async function streamChat(messages, onEvent, signal) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
    signal,
  });
  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "The assistant is unavailable right now.");
  }
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("text/event-stream")) {
    throw new Error("The AI server route is not deployed correctly. Please check the Vercel /api/chat configuration.");
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let receivedText = false;
  let completed = false;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop();
    for (const part of parts) {
      const line = part.split("\n").find((l) => l.startsWith("data: "));
      if (line) {
        const event = JSON.parse(line.slice(6));
        if (event.type === "text" || event.type === "refusal" || event.type === "error") receivedText = true;
        if (event.type === "done") completed = true;
        onEvent(event);
      }
    }
  }
  if (!completed && !receivedText) {
    throw new Error("The AI server closed the connection without a reply. Please try again.");
  }
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(loadHistory);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
    } catch {
      /* storage unavailable: keep the chat in memory only */
    }
  }, [messages]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    const connected = () => setOnline(true);
    const disconnected = () => setOnline(false);
    window.addEventListener("online", connected);
    window.addEventListener("offline", disconnected);
    return () => {
      window.removeEventListener("online", connected);
      window.removeEventListener("offline", disconnected);
    };
  }, []);

  async function send(text) {
    const question = text.trim();
    if (!question || busy) return;
    setInput("");
    const history = [...messages, { role: "user", content: question }];
    setMessages([...history, { role: "assistant", content: "", pending: true }]);
    setBusy(true);
    const controller = new AbortController();
    abortRef.current = controller;

    const update = (fn) =>
      setMessages((list) => {
        const next = [...list];
        next[next.length - 1] = fn(next[next.length - 1]);
        return next;
      });

    try {
      // The greeting is UI-only; the API conversation starts with the traveller.
      const apiMessages = history
        .filter((m) => m !== GREETING && !m.error)
        .map(({ role, content }) => ({ role, content }));
      await streamChat(
        apiMessages,
        (event) => {
          if (event.type === "text") update((m) => ({ ...m, content: m.content + event.text }));
          else if (event.type === "refusal") update((m) => ({ ...m, content: event.text }));
          else if (event.type === "error") update((m) => ({ ...m, content: event.message, error: true }));
        },
        controller.signal,
      );
      update((m) => ({ ...m, pending: false, content: m.content || "Sorry, I didn't catch that. Could you rephrase?" }));
    } catch (error) {
      if (error.name !== "AbortError") {
        update(() => ({ role: "assistant", content: error.message, error: true }));
      }
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    abortRef.current?.abort();
    setMessages([GREETING]);
    setBusy(false);
  }

  function stop() {
    abortRef.current?.abort();
    setMessages((list) => list.map((message, index) =>
      index === list.length - 1 && message.pending
        ? { ...message, pending: false, content: message.content || "Reply stopped." }
        : message,
    ));
    setBusy(false);
  }

  return (
    <div className="bf26-chat">
      {open && (
        <section className="bf26-chat-panel" role="dialog" aria-label="BookingFlex travel assistant">
          <header>
            <span className="bf26-chat-avatar">
              <Sparkles size={18} />
            </span>
            <span>
              <strong>Flexi</strong>
              <small><i className={online ? "is-online" : ""} />{online ? "Online · AI travel assistant" : "You are offline"}</small>
            </span>
            <button type="button" onClick={reset} aria-label="Start a new chat" title="New chat">
              <RotateCcw size={16} />
            </button>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat">
              <X size={18} />
            </button>
          </header>

          <div className="bf26-chat-list" ref={listRef} aria-live="polite">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`bf26-chat-msg is-${m.role} ${m.error ? "is-error" : ""} ${m.pending && !m.content ? "is-typing" : ""}`}
              >
                {m.pending && !m.content ? (
                  <span className="bf26-chat-dots" aria-label="Flexi is typing">
                    <i />
                    <i />
                    <i />
                  </span>
                ) : (
                  m.content
                )}
              </div>
            ))}
            {messages.length === 1 && (
              <div className="bf26-chat-suggest">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            className="bf26-chat-input"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            {!online && (
              <div className="bf26-chat-offline"><WifiOff size={15} /> Reconnect to continue chatting.</div>
            )}
            <textarea
              ref={inputRef}
              value={input}
              maxLength={2000}
              rows={1}
              placeholder="Ask about flights, hotels, trains…"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              aria-label="Message Flexi"
            />
            <button
              type={busy ? "button" : "submit"}
              onClick={busy ? stop : undefined}
              disabled={!busy && (!online || !input.trim())}
              aria-label={busy ? "Stop generating" : "Send message"}
              className={busy ? "is-stop" : ""}
            >
              {busy ? <Square size={15} fill="currentColor" /> : <Send size={17} />}
            </button>
          </form>
          <p className="bf26-chat-note">Enter to send · Shift + Enter for a new line · AI can make mistakes</p>
        </section>
      )}

      <button
        type="button"
        className={`bf26-chat-fab ${open ? "is-open" : ""}`}
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close travel assistant" : "Open travel assistant"}
        aria-expanded={open}
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
        {!open && <span>Ask Flexi</span>}
      </button>
    </div>
  );
}
