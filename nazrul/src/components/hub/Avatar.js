import React from "react";
import { characterById } from "../../lib/social";

/** A person's photo, or their chosen character on a coloured background. */
export default function Avatar({ avatar, name = "", size = 44, ring = false }) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.5) };
  if (avatar && avatar.kind === "photo" && avatar.photo) {
    return <img className={`hub-avatar ${ring ? "has-ring" : ""}`} src={avatar.photo} alt={name} style={style} />;
  }
  const c = characterById(avatar && avatar.character);
  return (
    <span
      className={`hub-avatar ${ring ? "has-ring" : ""}`}
      role="img"
      aria-label={name ? `${name} (${c.label})` : c.label}
      style={{ ...style, background: c.bg }}
    >
      {c.emoji}
    </span>
  );
}
