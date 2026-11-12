import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, Film, Heart, ImageIcon, Images, Loader2, Play, Plus, Send, Trash2, X } from "lucide-react";
import Avatar from "./Avatar";
import { api, compactCount, mediaUrl, prepareMedia, publishPost, timeAgo } from "../../lib/social";

const seen = new Set(); // views counted this visit

/** Big view of one photo or video, with arrows to move through the grid. */
function Viewer({ items, index, onIndex, onClose, onDeleted, onPatch }) {
  const item = items[index];
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setPost(null);
    setError(null);
    api(`/posts/${item.id}`)
      .then(({ post: p }) => {
        if (!alive) return;
        setPost(p);
        if (!p.mine && !seen.has(p.id)) {
          seen.add(p.id);
          api(`/posts/${p.id}/view`, { method: "POST" })
            .then((r) => onPatch(p.id, { views: r.views }))
            .catch(() => {});
        }
      })
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [item.id, onPatch]);

  useEffect(() => {
    const key = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && index < items.length - 1) onIndex(index + 1);
      if (e.key === "ArrowLeft" && index > 0) onIndex(index - 1);
    };
    document.addEventListener("keydown", key);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = prev;
    };
  }, [index, items.length, onClose, onIndex]);

  async function like() {
    if (!post) return;
    setPost((p) => ({ ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) }));
    try {
      const r = await api(`/posts/${post.id}/like`, { method: "POST" });
      setPost((p) => ({ ...p, liked: r.liked, likes: r.likes }));
      onPatch(post.id, { likes: r.likes });
    } catch (e) {
      setError(e.message);
    }
  }

  async function remove() {
    if (!window.confirm("Delete this post? It will also disappear from your feed.")) return;
    try {
      await api(`/posts/${post.id}`, { method: "DELETE" });
      onDeleted(post.id);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="gl-viewer" role="dialog" aria-modal="true" aria-label="Photo or video" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <button type="button" className="gl-close" aria-label="Close" onClick={onClose}>
        <X size={22} />
      </button>
      {index > 0 && (
        <button type="button" className="gl-arrow is-prev" aria-label="Previous" onClick={() => onIndex(index - 1)}>
          <ChevronLeft size={26} />
        </button>
      )}
      {index < items.length - 1 && (
        <button type="button" className="gl-arrow is-next" aria-label="Next" onClick={() => onIndex(index + 1)}>
          <ChevronRight size={26} />
        </button>
      )}
      <div className="gl-sheet">
        <div className="gl-stage">
          {!post && !error && <img className="gl-blur" src={item.thumb} alt="" />}
          {post?.video && (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video key={post.id} src={mediaUrl(post.video)} poster={post.poster} controls autoPlay playsInline loop />
          )}
          {post && !post.video && post.image && <img src={post.image} alt={post.text ? post.text.slice(0, 80) : "Photo"} />}
        </div>
        <aside className="gl-side">
          {post && (
            <header>
              <Avatar avatar={post.author.avatar} name={post.author.name} size={38} />
              <div>
                <strong>{post.author.name}</strong>
                <small>{timeAgo(post.createdAt)}</small>
              </div>
              {post.mine && (
                <button type="button" className="hub-icon-btn is-quiet" aria-label="Delete post" onClick={remove}>
                  <Trash2 size={16} />
                </button>
              )}
            </header>
          )}
          {error && <p className="hub-error" role="alert">{error}</p>}
          {post?.text && <p className="gl-caption">{post.text}</p>}
          {post && (
            <footer>
              <button type="button" className={`hub-like ${post.liked ? "is-on" : ""}`} aria-pressed={post.liked} onClick={like}>
                <Heart size={18} fill={post.liked ? "currentColor" : "none"} /> {post.likes}
              </button>
              <span className="gl-views">
                <Eye size={16} /> {compactCount(post.views)} {post.views === 1 ? "view" : "views"}
              </span>
            </footer>
          )}
          {!post && !error && <Loader2 size={20} className="hub-spin" />}
        </aside>
      </div>
    </div>
  );
}

/** Upload sheet: pick a photo or video, add a caption, share. */
function Composer({ me, onPosted, onClose }) {
  const [media, setMedia] = useState(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const file = useRef(null);

  useEffect(() => {
    if (file.current) file.current.click();
  }, []);
  useEffect(() => () => media && media.kind === "video" && URL.revokeObjectURL(media.preview), [media]);

  async function pick(e) {
    const f = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!f) return;
    setError(null);
    try {
      setMedia(await prepareMedia(f));
    } catch (err) {
      setError(err.message);
    }
  }

  async function share(e) {
    e.preventDefault();
    if (!media) return;
    setBusy(true);
    setError(null);
    try {
      onPosted(await publishPost(text.trim(), media));
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="hub-modal" role="dialog" aria-modal="true" aria-label="New photo or video" onClick={(e) => e.target === e.currentTarget && !busy && onClose()}>
      <form className="hub-modal-card gl-composer" onSubmit={share}>
        <button type="button" className="hub-icon-btn hub-modal-close" aria-label="Close" disabled={busy} onClick={onClose}>
          <X size={18} />
        </button>
        <h2>New post</h2>
        <input ref={file} type="file" accept="image/*,video/mp4,video/quicktime,video/webm" hidden onChange={pick} />
        {media ? (
          <div className="gl-preview">
            {media.kind === "video" ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video src={media.preview} poster={media.poster} controls playsInline muted />
            ) : (
              <img src={media.preview} alt="Selected" />
            )}
            <button type="button" className="hub-btn hub-btn-ghost" disabled={busy} onClick={() => file.current && file.current.click()}>
              Change
            </button>
          </div>
        ) : (
          <button type="button" className="gl-drop" onClick={() => file.current && file.current.click()}>
            <Images size={30} />
            <strong>Choose a photo or video</strong>
            <span>Photos are resized for you. Videos up to 4 MB (about 15–30 seconds).</span>
          </button>
        )}
        <div className="gl-caption-row">
          <Avatar avatar={me?.avatar} name={me?.name} size={36} />
          <textarea className="hub-input" rows={2} maxLength={500} value={text} placeholder="Write a caption…" aria-label="Caption" onChange={(e) => setText(e.target.value)} />
        </div>
        {error && <p className="hub-error" role="alert">{error}</p>}
        <button type="submit" className="hub-btn gl-share" disabled={!media || busy}>
          {busy ? <Loader2 size={16} className="hub-spin" /> : <Send size={16} />} {busy ? (media?.kind === "video" ? "Uploading video…" : "Sharing…") : "Share"}
        </button>
      </form>
    </div>
  );
}

/**
 * Photo and video grid, like a profile on Instagram. Shows your own uploads
 * (with an upload button), or a friend's when `email` is given.
 */
export default function GalleryTab({ me, email, onChange }) {
  const own = !email;
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(null);
  const [composing, setComposing] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems((await api(`/gallery${email ? `?email=${encodeURIComponent(email)}` : ""}`)).items);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, [email]);
  useEffect(() => {
    load();
  }, [load]);

  const shown = (items || []).filter((i) => filter === "all" || i.kind === filter);
  const count = (kind) => (items || []).filter((i) => i.kind === kind).length;
  const patch = useCallback((id, change) => setItems((list) => (list || []).map((i) => (i.id === id ? { ...i, ...change } : i))), []);

  return (
    <div className="gl">
      <div className="gl-head">
        {own && (
          <button type="button" className="gl-new" onClick={() => setComposing(true)}>
            <span>
              <Plus size={26} />
            </span>
            New
          </button>
        )}
        <div className="gl-filters" role="tablist" aria-label="Show">
          {[
            ["all", "All", Images, (items || []).length],
            ["photo", "Photos", ImageIcon, count("photo")],
            ["video", "Videos", Film, count("video")],
          ].map(([id, label, Icon, n]) => (
            <button key={id} type="button" role="tab" aria-selected={filter === id} className={filter === id ? "is-on" : ""} onClick={() => setFilter(id)}>
              <Icon size={17} /> {label} <small>{items ? n : ""}</small>
            </button>
          ))}
        </div>
      </div>

      {error && <p className="hub-error" role="alert">{error}</p>}
      {!items && !error && (
        <div className="gl-grid" aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className="gl-tile is-loading" />
          ))}
        </div>
      )}
      {items && shown.length === 0 && (
        <div className="hub-card hub-empty">
          <strong>{filter === "video" ? "No videos yet" : filter === "photo" ? "No photos yet" : "No photos or videos yet"}</strong>
          <p>{own ? "Everything you upload shows up here and in your feed." : "When they share photos or videos, they'll show up here."}</p>
          {own && (
            <button type="button" className="hub-btn" onClick={() => setComposing(true)}>
              <Plus size={16} /> Upload
            </button>
          )}
        </div>
      )}
      {shown.length > 0 && (
        <div className="gl-grid">
          {shown.map((item, i) => (
            <button key={item.id} type="button" className="gl-tile" aria-label={`${item.kind === "video" ? "Video" : "Photo"}${item.text ? `: ${item.text}` : ""}`} onClick={() => setOpen(i)}>
              {item.thumb ? <img src={item.thumb} alt="" loading="lazy" /> : <span className="gl-tile-empty" />}
              <span className="gl-kind">{item.kind === "video" ? <Play size={16} fill="currentColor" /> : null}</span>
              <span className="gl-count">
                {item.kind === "video" ? <Play size={13} /> : <Eye size={13} />} {compactCount(item.views)}
              </span>
            </button>
          ))}
        </div>
      )}

      {open != null && shown[open] && (
        <Viewer
          items={shown}
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
          onPatch={patch}
          onDeleted={(id) => {
            setOpen(null);
            setItems((list) => list.filter((i) => i.id !== id));
            onChange && onChange();
          }}
        />
      )}
      {composing && (
        <Composer
          me={me}
          onClose={() => setComposing(false)}
          onPosted={() => {
            setComposing(false);
            setFilter("all");
            load();
            onChange && onChange();
          }}
        />
      )}
    </div>
  );
}
