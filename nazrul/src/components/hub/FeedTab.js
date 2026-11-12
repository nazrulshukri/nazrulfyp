import React, { useCallback, useEffect, useRef, useState } from "react";
import { Heart, ImagePlus, Loader2, Send, Trash2, X } from "lucide-react";
import Avatar from "./Avatar";
import { api, resizeImage, timeAgo } from "../../lib/social";

const MAX = 500;

/** Instagram-style photo posts and Twitter-style short posts from you and your friends. */
export default function FeedTab({ me, onChange }) {
  const [posts, setPosts] = useState(null);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const file = useRef(null);

  const load = useCallback(async () => {
    try {
      setPosts((await api("/feed")).posts);
    } catch (e) {
      setError(e.message);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  async function pick(e) {
    const f = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!f) return;
    try {
      setImage(await resizeImage(f));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (!text.trim() && !image) return;
    setBusy(true);
    try {
      const { post } = await api("/posts", { method: "POST", body: { text: text.trim(), image } });
      setPosts((list) => [post, ...(list || [])]);
      setText("");
      setImage(null);
      setError(null);
      onChange && onChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function like(post) {
    setPosts((list) => list.map((p) => (p.id === post.id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p)));
    try {
      const r = await api(`/posts/${post.id}/like`, { method: "POST" });
      setPosts((list) => list.map((p) => (p.id === post.id ? { ...p, liked: r.liked, likes: r.likes } : p)));
    } catch (err) {
      setError(err.message);
      load();
    }
  }

  async function remove(post) {
    if (!window.confirm("Delete this post?")) return;
    try {
      await api(`/posts/${post.id}`, { method: "DELETE" });
      setPosts((list) => list.filter((p) => p.id !== post.id));
      onChange && onChange();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="hub-feed">
      <form className="hub-card hub-composer" onSubmit={submit}>
        <Avatar avatar={me?.avatar} name={me?.name} size={46} />
        <div className="hub-composer-body">
          <textarea
            value={text}
            maxLength={MAX}
            rows={image ? 2 : 3}
            placeholder="Where are you dreaming of going? Share a moment…"
            aria-label="Write a post"
            onChange={(e) => setText(e.target.value)}
          />
          {image && (
            <div className="hub-composer-preview">
              <img src={image} alt="Selected" />
              <button type="button" aria-label="Remove photo" onClick={() => setImage(null)}>
                <X size={16} />
              </button>
            </div>
          )}
          <div className="hub-composer-bar">
            <button type="button" className="hub-icon-btn" onClick={() => file.current && file.current.click()}>
              <ImagePlus size={18} /> Photo
            </button>
            <input ref={file} type="file" accept="image/*" hidden onChange={pick} />
            <small className={text.length > MAX - 40 ? "is-warn" : ""}>
              {text.length}/{MAX}
            </small>
            <button type="submit" className="hub-btn" disabled={busy || (!text.trim() && !image)}>
              {busy ? <Loader2 size={16} className="hub-spin" /> : <Send size={16} />} Post
            </button>
          </div>
        </div>
      </form>

      {error && <p className="hub-error">{error}</p>}
      {!posts && !error && <p className="hub-muted">Loading posts…</p>}
      {posts && posts.length === 0 && (
        <div className="hub-card hub-empty">
          <strong>No posts yet</strong>
          <p>Share your first travel moment, or invite friends to see theirs here.</p>
        </div>
      )}

      {(posts || []).map((post) => (
        <article className="hub-card hub-post" key={post.id}>
          <header>
            <Avatar avatar={post.author.avatar} name={post.author.name} size={42} />
            <div>
              <strong>{post.author.name}</strong>
              <small>
                {post.author.profession ? `${post.author.profession} · ` : ""}
                {timeAgo(post.createdAt)}
              </small>
            </div>
            {post.mine && (
              <button type="button" className="hub-icon-btn is-quiet" aria-label="Delete post" onClick={() => remove(post)}>
                <Trash2 size={16} />
              </button>
            )}
          </header>
          {post.text && <p className={`hub-post-text ${!post.image && post.text.length < 120 ? "is-big" : ""}`}>{post.text}</p>}
          {post.image && <img className="hub-post-img" src={post.image} alt={post.text ? post.text.slice(0, 80) : "Post photo"} loading="lazy" />}
          <footer>
            <button type="button" className={`hub-like ${post.liked ? "is-on" : ""}`} aria-pressed={post.liked} onClick={() => like(post)}>
              <Heart size={18} fill={post.liked ? "currentColor" : "none"} /> {post.likes}
            </button>
          </footer>
        </article>
      ))}
    </div>
  );
}
