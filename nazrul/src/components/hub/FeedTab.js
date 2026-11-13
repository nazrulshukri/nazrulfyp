import React, { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Send, X } from "lucide-react";
import Avatar from "./Avatar";
import EmojiPicker, { insertEmoji } from "./EmojiPicker";
import PostCard from "./PostCard";
import { api, prepareMedia, publishPost } from "../../lib/social";

const MAX = 500;

/** Instagram-style photo posts and Twitter-style short posts from you and your friends. */
export default function FeedTab({ me, onChange }) {
  const [posts, setPosts] = useState(null);
  const [text, setText] = useState("");
  const [media, setMedia] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const file = useRef(null);
  const box = useRef(null);

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
      setMedia(await prepareMedia(f));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (!text.trim() && !media) return;
    setBusy(true);
    try {
      const post = await publishPost(text.trim(), media);
      setPosts((list) => [post, ...(list || [])]);
      setText("");
      setMedia(null);
      setError(null);
      onChange && onChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="hub-feed">
      <form className="hub-card hub-composer" onSubmit={submit}>
        <Avatar avatar={me?.avatar} name={me?.name} size={46} />
        <div className="hub-composer-body">
          <textarea
            ref={box}
            value={text}
            maxLength={MAX}
            rows={media ? 2 : 3}
            placeholder="Where are you dreaming of going? Share a moment…"
            aria-label="Write a post"
            onChange={(e) => setText(e.target.value)}
          />
          {media && (
            <div className="hub-composer-preview">
              {media.kind === "video" ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video src={media.preview} poster={media.poster} controls playsInline muted />
              ) : (
                <img src={media.preview} alt="Selected" />
              )}
              <button type="button" aria-label="Remove photo or video" onClick={() => setMedia(null)}>
                <X size={16} />
              </button>
            </div>
          )}
          <div className="hub-composer-bar">
            <EmojiPicker up={false} onPick={(e) => insertEmoji(box.current, text, setText, e)} />
            <button type="button" className="hub-icon-btn" onClick={() => file.current && file.current.click()}>
              <ImagePlus size={18} /> Photo / video
            </button>
            <input ref={file} type="file" accept="image/*,video/mp4,video/quicktime,video/webm" hidden onChange={pick} />
            <small className={text.length > MAX - 40 ? "is-warn" : ""}>
              {text.length}/{MAX}
            </small>
            <button type="submit" className="hub-btn" disabled={busy || (!text.trim() && !media)}>
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
        <PostCard
          key={post.id}
          post={post}
          me={me}
          onChange={(np) => setPosts((list) => list.map((x) => (x.id === np.id ? np : x)))}
          onDelete={(id) => {
            setPosts((list) => list.filter((x) => x.id !== id));
            onChange && onChange();
          }}
        />
      ))}
    </div>
  );
}
