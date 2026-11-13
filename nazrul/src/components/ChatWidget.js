import React, { useEffect, useRef, useState } from "react";
import { t } from "../lib/i18n";
import { MessageCircle, X, Send, Sparkles, RotateCcw } from "lucide-react";
import { API_BASE } from "../lib/apiConfig";

const STORAGE_KEY = "bookingflexChat:v2";
const GREETING = {
  role: "assistant",
  content:
    "Hi! I'm Flexi, BookingFlex's AI travel assistant. How can I help you today? Are you looking to book a flight, a hotel, a train, or a full trip (flight + hotel)?",
};
const SUGGESTIONS = [
  "✈️ Book a flight",
  "🏨 Find a hotel",
  "🚆 Train tickets",
  "🧳 Flight + hotel",
  "Compare Bali vs Phuket",
  "Best trip under RM 2,000",
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
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop();
    for (const part of parts) {
      const line = part.split("\n").find((l) => l.startsWith("data: "));
      if (line) onEvent(JSON.parse(line.slice(6)));
    }
  }
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(loadHistory);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [quickMode, setQuickMode] = useState(false);
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
  }, [messages, open, busy]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => () => abortRef.current?.abort(), []);

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
          else if (event.type === "mode") setQuickMode(event.mode === "quick");
          else if (event.type === "suggestions" && Array.isArray(event.items)) update((m) => ({ ...m, suggestions: event.items.slice(0, 6) }));
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

  return (
    <div className="bf26-chat">
      {open && (
        <section className="bf26-chat-panel" role="dialog" aria-label={t("BookingFlex travel assistant")}>
          <header>
            <span className="bf26-chat-avatar">
              <Sparkles size={18} />
            </span>
            <span>
              <strong>{t("Flexi")}</strong>
              <small>{t(quickMode ? "Travel assistant · quick answers" : "AI travel assistant")}</small>
            </span>
            <button type="button" onClick={reset} aria-label={t("Start a new chat")} title={t("New chat")}>
              <RotateCcw size={16} />
            </button>
            <button type="button" onClick={() => setOpen(false)} aria-label={t("Close chat")}>
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
                  <span className="bf26-chat-dots" aria-label={t("Flexi is typing")}>
                    <i />
                    <i />
                    <i />
                  </span>
                ) : (
                  m.role === "assistant" && m.content === GREETING.content ? t(GREETING.content) : m.content
                )}
              </div>
            ))}
            {/* Tappable next questions: the starters, then whatever Flexi suggested last. */}
            {!busy && (() => {
              const last = messages[messages.length - 1];
              const chips = messages.length === 1 ? SUGGESTIONS : last.role === "assistant" && !last.error ? last.suggestions : null;
              return chips && chips.length ? (
                <div className="bf26-chat-suggest">
                  {chips.map((s) => (
                    <button key={s} type="button" onClick={() => send(t(s))}>
                      {t(s)}
                    </button>
                  ))}
                </div>
              ) : null;
            })()}
          </div>

          <form
            className="bf26-chat-input"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              ref={inputRef}
              value={input}
              maxLength={2000}
              placeholder={t("Ask about flights, hotels, trains…")}
              onChange={(e) => setInput(e.target.value)}
              aria-label={t("Message Flexi")}
            />
            <button type="submit" disabled={busy || !input.trim()} aria-label={t("Send message")}>
              <Send size={17} />
            </button>
          </form>
          <p className="bf26-chat-note">
            {t(quickMode ? "Quick answers cover common travel questions." : "AI answers can be wrong.")}{" "}
            {t("Fares shown on BookingFlex are samples.")}
          </p>
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
        {!open && <span>{t("Ask Flexi")}</span>}
      </button>
    </div>
  );
}
