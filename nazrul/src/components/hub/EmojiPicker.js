import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { portalRoot } from "../../lib/social";
import { Smile } from "lucide-react";

const SETS = [
  [
    "😀",
    "Smileys",
    "😀 😃 😄 😁 😆 😅 🤣 😂 🙂 😉 😊 😇 🥰 😍 🤩 😘 😋 😛 😜 🤪 😝 🤗 🤭 🤫 🤔 🤐 🤨 😐 😏 😒 🙄 😬 😌 😔 😪 😴 😷 🤒 🥵 🥶 🥴 😵 🤯 🤠 🥳 😎 🤓 🧐 😕 😟 🙁 😮 😯 😲 😳 🥺 😢 😭 😱 😖 😣 😞 😓 😩 😫 🥱 😤 😡 😠 🤬 😈 💀 🤡 👻 👽 🤖 💩",
  ],
  [
    "👍",
    "Gestures",
    "👍 👎 👌 🤌 🤏 ✌️ 🤞 🤟 🤘 🤙 👈 👉 👆 👇 ☝️ 👋 🤚 🖐️ ✋ 🖖 👏 🙌 👐 🤲 🤝 🙏 ✍️ 💪 🦾 🫶 👀 🧠 🫡 🤷 🤦 🙋 🙆 🙅 💁 🙇 🧳 🏃 🚶 🕺 💃 👯 🧘 🏊 🏄 🚴",
  ],
  [
    "❤️",
    "Hearts",
    "❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝 💟 ✨ ⭐ 🌟 💫 🔥 💯 ✅ ❌ ❗ ❓ 💤 💬 💭 🎉 🎊 🎁 🏆 🥇 🎯",
  ],
  [
    "✈️",
    "Travel",
    "✈️ 🛫 🛬 🛩️ 🚆 🚄 🚅 🚇 🚌 🚕 🚗 🚢 ⛴️ 🛳️ 🚤 🗺️ 🧭 🏝️ 🏖️ 🏕️ ⛰️ 🏔️ 🗻 🌋 🏙️ 🌆 🌃 🌉 🗼 🗽 🗿 🕌 🛕 ⛩️ 🏯 🏰 🎡 🎢 🏨 🛎️ 🧳 🎒 📸 🎫 🛂 🌍 🌏 🌎 ☀️ 🌤️ ⛅ 🌧️ ⛈️ ❄️ 🌈 🌊",
  ],
  [
    "🍜",
    "Food",
    "🍜 🍲 🍛 🍣 🍱 🥟 🍤 🍙 🍚 🍢 🍡 🍧 🍨 🍦 🥧 🍰 🎂 🍩 🍪 🍫 🍬 🍕 🍔 🍟 🌭 🥪 🌮 🌯 🥗 🥘 🍳 🥞 🧇 🥐 🥖 🍞 🧀 🍗 🍖 🥩 🍉 🍓 🥭 🍍 🥥 🍌 🍎 ☕ 🍵 🧋 🥤 🍹 🍺 🥂",
  ],
  [
    "🌴",
    "Nature",
    "🌴 🌵 🌲 🌳 🌿 🍀 🍁 🍂 🌸 🌺 🌻 🌹 🌷 🌼 🐶 🐱 🐼 🐨 🐯 🦁 🐵 🐘 🦒 🦓 🐢 🐠 🐬 🐳 🦈 🐙 🦋 🐝 🐞 🦜 🦩 🐧 🌙 ⭐ ☄️",
  ],
];
const RECENT_KEY = "bookingflexRecentEmoji";

const readRecent = () => {
  try {
    const list = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    return Array.isArray(list) ? list.slice(0, 16) : [];
  } catch {
    return [];
  }
};

/**
 * Puts `emoji` into a text box at the cursor (or replaces the selection)
 * and keeps typing where it left off. `setValue` updates the React state.
 */
export function insertEmoji(el, value, setValue, emoji) {
  const start = el ? (el.selectionStart ?? value.length) : value.length;
  const end = el ? (el.selectionEnd ?? value.length) : value.length;
  const next = value.slice(0, start) + emoji + value.slice(end);
  setValue(next);
  requestAnimationFrame(() => {
    if (!el) return;
    el.focus();
    const at = start + emoji.length;
    el.setSelectionRange(at, at);
  });
}

/** A 😊 button that opens an emoji grid. `onPick(emoji)` for each one chosen. */
export default function EmojiPicker({
  onPick,
  label = "Add emoji",
  up = true,
  align = "left",
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [recent, setRecent] = useState(readRecent);
  const wrap = useRef(null);
  const pop = useRef(null);
  const [pos, setPos] = useState(null);

  // The grid floats over the page (cards clip their contents), placed next
  // to the button: above it when there's room, otherwise below.
  useEffect(() => {
    if (!open) return undefined;
    const place = () => {
      const r = wrap.current && wrap.current.getBoundingClientRect();
      if (!r) return;
      const width = Math.min(330, window.innerWidth - 16);
      const left = Math.max(
        8,
        Math.min(
          align === "right" ? r.right - width : r.left,
          window.innerWidth - width - 8,
        ),
      );
      const roomAbove = r.top > 330;
      setPos(
        up && roomAbove
          ? { left, width, bottom: window.innerHeight - r.top + 8 }
          : { left, width, top: r.bottom + 8 },
      );
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, up, align]);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) =>
      wrap.current &&
      !wrap.current.contains(e.target) &&
      !(pop.current && pop.current.contains(e.target)) &&
      setOpen(false);
    const key = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("touchstart", close);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  function pick(emoji) {
    onPick(emoji);
    const next = [emoji, ...recent.filter((x) => x !== emoji)].slice(0, 16);
    setRecent(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  const tabs = recent.length
    ? [["🕘", "Recent", recent.join(" ")], ...SETS]
    : SETS;
  const current = tabs[Math.min(tab, tabs.length - 1)];
  return (
    <span className="hub-emoji" ref={wrap}>
      <button
        type="button"
        className={`hub-icon-btn is-quiet ${open ? "is-active" : ""}`}
        aria-label={label}
        aria-expanded={open}
        title={label}
        onClick={() => setOpen(!open)}
      >
        <Smile size={18} />
      </button>
      {open &&
        pos &&
        createPortal(
          <div
            ref={pop}
            className="hub-emoji-pop"
            style={pos}
            role="dialog"
            aria-label="Emoji"
          >
            <div className="hub-emoji-tabs" role="tablist">
              {tabs.map(([icon, name], i) => (
                <button
                  key={name}
                  type="button"
                  role="tab"
                  aria-selected={current[1] === name}
                  title={name}
                  className={current[1] === name ? "is-on" : ""}
                  onClick={() => setTab(i)}
                >
                  {icon}
                </button>
              ))}
            </div>
            <p className="hub-emoji-title">{current[1]}</p>
            <div className="hub-emoji-grid">
              {current[2].split(" ").map((e, i) => (
                <button
                  key={`${e}-${i}`}
                  type="button"
                  aria-label={e}
                  onClick={() => pick(e)}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>,
          portalRoot(),
        )}
    </span>
  );
}
