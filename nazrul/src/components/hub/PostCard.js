import React, { useState } from "react";
import { Check, Heart, Loader2, MessageCircle, Send, Share2, Trash2, X } from "lucide-react";
import Avatar from "./Avatar";
import { api, mediaUrl, timeAgo } from "../../lib/social";
import { flagOf } from "../../lib/countries";

export const postLink = (id) => `${window.location.origin}/dashboard?post=${id}`;

const Name = ({ person }) => (
  <strong>
    {person.name}
    {person.country && <span className="hub-flag-sm"> {flagOf(person.country)}</span>}
  </strong>
);

/**
 * One post, like on Twitter: photo or video, like, comments and share.
 * `onChange(post)` gets the updated post; `onDelete(id)` after deleting.
 */
export default function PostCard({ post, me, onChange, onDelete, startOpen = false }) {
  const [open, setOpen] = useState(startOpen);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [shared, setShared] = useState(false);
  const [error, setError] = useState(null);

  async function like() {
    onChange({ ...post, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) });
    try {
      const r = await api(`/posts/${post.id}/like`, { method: "POST" });
      onChange({ ...post, liked: r.liked, likes: r.likes });
    } catch (e) {
      setError(e.message);
      onChange(post);
    }
  }

  async function comment(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const r = await api(`/posts/${post.id}/comments`, { method: "POST", body: { text: text.trim() } });
      setText("");
      onChange(r.post);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function removeComment(c) {
    try {
      const r = await api(`/posts/${post.id}/comments/${c.id}`, { method: "DELETE" });
      onChange(r.post);
    } catch (err) {
      setError(err.message);
    }
  }

  async function share() {
    const url = postLink(post.id);
    const title = `${post.author.name} on BookingFlex`;
    try {
      if (navigator.share) {
        await navigator.share({ title, text: post.text ? post.text.slice(0, 120) : title, url });
        return;
      }
    } catch (e) {
      if (e && e.name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  async function remove() {
    if (!window.confirm("Delete this post?")) return;
    try {
      await api(`/posts/${post.id}`, { method: "DELETE" });
      onDelete && onDelete(post.id);
    } catch (e) {
      setError(e.message);
    }
  }

  const count = post.commentCount ?? (post.comments || []).length;
  return (
    <article className="hub-card hub-post">
      <header>
        <Avatar avatar={post.author.avatar} name={post.author.name} size={42} />
        <div>
          <Name person={post.author} />
          <small>
            {post.author.profession ? `${post.author.profession} · ` : ""}
            {timeAgo(post.createdAt)}
          </small>
        </div>
        {post.mine && (
          <button type="button" className="hub-icon-btn is-quiet" aria-label="Delete post" onClick={remove}>
            <Trash2 size={16} />
          </button>
        )}
      </header>
      {post.text && <p className={`hub-post-text ${!post.image && !post.video && post.text.length < 120 ? "is-big" : ""}`}>{post.text}</p>}
      {post.video && (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video className="hub-post-video" src={mediaUrl(post.video)} poster={post.poster} controls playsInline preload="none" />
      )}
      {post.image && <img className="hub-post-img" src={post.image} alt={post.text ? post.text.slice(0, 80) : "Post photo"} loading="lazy" />}
      <footer className="hub-post-actions">
        <button type="button" className={`hub-like ${post.liked ? "is-on" : ""}`} aria-pressed={post.liked} aria-label={`Like, ${post.likes} likes`} onClick={like}>
          <Heart size={18} fill={post.liked ? "currentColor" : "none"} /> {post.likes}
        </button>
        <button type="button" className={`hub-like ${open ? "is-active" : ""}`} aria-expanded={open} aria-label={`Comments, ${count}`} onClick={() => setOpen(!open)}>
          <MessageCircle size={18} /> {count}
        </button>
        <button type="button" className="hub-like" onClick={share} aria-label="Share link">
          {shared ? <Check size={18} /> : <Share2 size={18} />} {shared ? "Link copied" : "Share"}
        </button>
      </footer>
      {error && <p className="hub-error">{error}</p>}
      {open && (
        <div className="hub-comments">
          {(post.comments || []).length === 0 && <p className="hub-muted">No comments yet. Be the first.</p>}
          <ul>
            {(post.comments || []).map((c) => (
              <li key={c.id}>
                <Avatar avatar={c.author.avatar} name={c.author.name} size={30} />
                <div>
                  <span>
                    <Name person={c.author} /> <small>{timeAgo(c.createdAt)}</small>
                  </span>
                  <p>{c.text}</p>
                </div>
                {(c.mine || post.mine) && (
                  <button type="button" className="hub-icon-btn is-quiet" aria-label="Delete comment" onClick={() => removeComment(c)}>
                    <X size={14} />
                  </button>
                )}
              </li>
            ))}
          </ul>
          <form className="hub-comment-form" onSubmit={comment}>
            <Avatar avatar={me?.avatar} name={me?.name} size={30} />
            <input className="hub-input" value={text} maxLength={500} placeholder="Write a comment…" aria-label="Write a comment" onChange={(e) => setText(e.target.value)} />
            <button type="submit" className="hub-icon-btn" aria-label="Send comment" disabled={busy || !text.trim()}>
              {busy ? <Loader2 size={16} className="hub-spin" /> : <Send size={16} />}
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
