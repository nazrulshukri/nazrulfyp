import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import PostCard from "./PostCard";
import { api } from "../../lib/social";

/** A post opened from a shared link (/dashboard?post=ID). Friends only. */
export default function PostModal({ id, me, onClose }) {
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    api(`/posts/${encodeURIComponent(id)}`)
      .then((r) => alive && setPost(r.post))
      .catch((e) => alive && setError(e.status === 404 ? "This post isn't available. It may have been deleted, or only the author's friends can see it." : e.message));
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    const key = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [onClose]);

  return (
    <div className="hub-modal" role="dialog" aria-modal="true" aria-label="Shared post" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="hub-modal-card hub-post-modal">
        <button type="button" className="hub-icon-btn hub-modal-close" aria-label="Close" onClick={onClose}>
          <X size={18} />
        </button>
        {error && <p className="hub-error">{error}</p>}
        {!post && !error && <p className="hub-muted">Loading post…</p>}
        {post && <PostCard post={post} me={me} startOpen onChange={setPost} onDelete={onClose} />}
      </div>
    </div>
  );
}
