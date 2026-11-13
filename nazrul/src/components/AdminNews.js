import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeftRight,
  BedDouble,
  Eye,
  EyeOff,
  Film,
  ImageIcon,
  Megaphone,
  Music,
  Pencil,
  Pin,
  Plane,
  Plus,
  Shuffle,
  Star,
  TicketPercent,
  TrainFront,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { API_BASE } from "../lib/apiConfig";
import { authHeaders } from "../lib/adminAccess";
import { posterFromVideo } from "../lib/social";

const KINDS = [
  ["voucher", "Voucher", TicketPercent, "A discount code people can copy"],
  ["news", "BookingFlex news", Megaphone, "Announcements and stories"],
  ["flight", "Flight update", Plane, "New routes, delays, airline news"],
  ["hotel", "Hotel update", BedDouble, "Stays, openings, offers"],
  ["train", "Train update", TrainFront, "ETS, KTM and rail changes"],
];
const KIND_LABEL = Object.fromEntries(KINDS.map(([k, l]) => [k, l]));
const DISCOUNTS = ["10% off", "15% off", "20% off", "RM 30 off", "RM 50 off", "RM 100 off", "Free seat selection"];
const MAX_BYTES = 4 * 1024 * 1024;
const EMPTY = { kind: "news", title: "", body: "", image: "", link: "", code: "", discount: "", validUntil: "", pinned: false, published: true };

const abs = (u) => (u && u.startsWith("/") ? `${API_BASE}${u}` : u);
const dayPlus = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
const endOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 12).toISOString().slice(0, 10);
};
const mb = (n) => `${(n / 1048576).toFixed(1)} MB`;

async function call(path, method = "GET", body) {
  const res = await fetch(`${API_BASE}/news${path}`, {
    method,
    headers: { ...(body ? { "Content-Type": "application/json" } : {}), ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}

/** Uploads one file with progress (0–1). Resolves to { id, kind, url }. */
function upload(blob, type, name, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/news/admin/media`);
    xhr.setRequestHeader("Content-Type", type);
    xhr.setRequestHeader("X-File-Name", encodeURIComponent(name || ""));
    Object.entries(authHeaders()).forEach(([k, v]) => xhr.setRequestHeader(k, v));
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress && onProgress(e.loaded / e.total);
    xhr.onload = () => {
      let data = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        /* ignore */
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(data);
      else reject(new Error(xhr.status === 413 ? "That file is too large. Each file can be up to 4 MB." : data.message || "Upload failed."));
    };
    xhr.onerror = () => reject(new Error("Upload failed. Check your connection."));
    xhr.send(blob);
  });
}

/** Big photos are shrunk to 1920 px JPEG in the browser; GIFs are kept as they are. */
function shrinkPhoto(file) {
  if (file.type === "image/gif" || file.size < 900 * 1024) return Promise.resolve(file);
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, 1920 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      c.toBlob((b) => resolve(b && b.size < file.size ? new File([b], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }) : file), "image/jpeg", 0.85);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}
const dataUrlToBlob = async (d) => (await fetch(d)).blob();

const kindOfFile = (f) =>
  /^image\//.test(f.type) ? "image" : /^video\//.test(f.type) || /\.(mov|mp4|webm)$/i.test(f.name) ? "video" : /^audio\//.test(f.type) || /\.(mp3|m4a|wav|ogg|aac)$/i.test(f.name) ? "audio" : null;
const typeOfFile = (f, kind) =>
  f.type ||
  (kind === "video" ? (/\.mov$/i.test(f.name) ? "video/quicktime" : "video/mp4") : kind === "audio" ? (/\.m4a$/i.test(f.name) ? "audio/mp4" : "audio/mpeg") : "image/jpeg");

function MediaTile({ m, isCover, onRemove, onCover }) {
  const Icon = m.kind === "video" ? Film : m.kind === "audio" ? Music : ImageIcon;
  return (
    <li className={`ad-media-tile is-${m.kind} ${m.error ? "is-error" : ""}`}>
      <div className="ad-media-thumb">
        {m.kind === "image" && <img src={m.preview || abs(m.url)} alt="" />}
        {m.kind === "video" &&
          (m.posterPreview || m.posterUrl ? (
            <img src={m.posterPreview || abs(m.posterUrl)} alt="" />
          ) : (
            <span className="ad-media-icon">
              <Film size={26} />
            </span>
          ))}
        {m.kind === "audio" && (
          <span className="ad-media-icon">
            <Music size={26} />
          </span>
        )}
        <span className="ad-media-badge">
          <Icon size={12} /> {m.kind === "image" ? (isCover ? "Cover" : "Photo") : m.kind === "video" ? "Video" : "Song"}
        </span>
        {m.progress != null && m.progress < 1 && !m.error && (
          <span className="ad-media-progress" aria-label={`Uploading ${Math.round(m.progress * 100)}%`}>
            <i style={{ width: `${Math.round(m.progress * 100)}%` }} />
          </span>
        )}
      </div>
      <div className="ad-media-meta">
        <span title={m.name}>{m.error || m.name || (m.kind === "audio" ? "Song" : "File")}</span>
        <span className="ad-media-actions">
          {m.kind === "image" && !isCover && !m.error && (
            <button type="button" className="ad-icon-btn" title="Use as cover" aria-label="Use as cover" onClick={onCover}>
              <Star size={14} />
            </button>
          )}
          <button type="button" className="ad-icon-btn" title="Remove" aria-label={`Remove ${m.name || m.kind}`} onClick={onRemove}>
            <X size={14} />
          </button>
        </span>
      </div>
      {m.kind === "audio" && (m.preview || m.url) && !m.error && (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <audio className="ad-media-audio" src={m.preview || abs(m.url)} controls preload="none" />
      )}
    </li>
  );
}

/** How the post will look on /news. */
function Preview({ form, media }) {
  const cover = media.find((m) => m.kind === "image" && !m.error);
  const coverSrc = (cover && (cover.preview || abs(cover.url))) || (/^https:\/\//.test(form.image) ? form.image : null);
  const video = media.find((m) => m.kind === "video" && !m.error);
  const songs = media.filter((m) => m.kind === "audio" && !m.error);
  if (form.kind === "voucher") {
    return (
      <div className="ad-preview-voucher">
        {coverSrc && <img src={coverSrc} alt="" />}
        <div>
          <span className="ad-preview-off">{form.discount || "Special deal"}</span>
          <strong>{form.title || "Voucher title"}</strong>
          {form.body && <p>{form.body}</p>}
          <small>{form.validUntil ? `Until ${new Date(form.validUntil).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : "No end date"}</small>
        </div>
        <div className="ad-preview-code">
          <small>Code</small>
          <b>{form.code || "CODE"}</b>
        </div>
      </div>
    );
  }
  return (
    <article className="ad-preview-post">
      {video ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video src={video.preview || abs(video.url)} poster={video.posterPreview || abs(video.posterUrl)} controls playsInline muted />
      ) : (
        coverSrc && <img src={coverSrc} alt="" />
      )}
      <div>
        <span className="ad-news-kind">{KIND_LABEL[form.kind]}</span>
        <strong>{form.title || "Post title"}</strong>
        {form.body && <p>{form.body}</p>}
        {songs.map((s) => (
          <span key={s.key} className="ad-preview-song">
            <Music size={14} /> {s.name || "Song"}
          </span>
        ))}
      </div>
    </article>
  );
}

/** Admins write news posts and vouchers shown on /news, with photos, videos and songs. */
export default function AdminNews() {
  const [posts, setPosts] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [media, setMedia] = useState([]);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const fileInput = useRef(null);
  const keySeq = useRef(0);

  const load = useCallback(async () => {
    try {
      setPosts((await call("/admin")).posts);
    } catch (e) {
      setMsg({ error: true, text: e.message });
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const patchMedia = (key, change) => setMedia((list) => list.map((m) => (m.key === key ? { ...m, ...change } : m)));
  const uploading = media.some((m) => m.progress != null && m.progress < 1 && !m.error);

  async function addFiles(fileList) {
    const picked = [...fileList];
    if (!picked.length) return;
    setMsg(null);
    const room = 8 - media.length;
    if (room <= 0) return setMsg({ error: true, text: "A post can have up to 8 files." });
    for (const original of picked.slice(0, room)) {
      const kind = kindOfFile(original);
      const key = `m${(keySeq.current += 1)}`;
      if (!kind) {
        setMsg({ error: true, text: `${original.name} isn't a photo, video or song.` });
        continue;
      }
      const file = kind === "image" ? await shrinkPhoto(original) : original;
      const preview = URL.createObjectURL(file);
      const item = { key, kind, name: original.name, preview, progress: 0 };
      if (file.size > MAX_BYTES) {
        setMedia((list) => [...list, { ...item, progress: null, error: `${original.name} is ${mb(file.size)}. Files can be up to 4 MB.` }]);
        continue;
      }
      setMedia((list) => (kind === "image" && !list.some((m) => m.kind === "image") ? [item, ...list] : [...list, item]));
      (async () => {
        try {
          let posterId;
          if (kind === "video") {
            const { poster } = await posterFromVideo(file);
            if (poster) {
              patchMedia(key, { posterPreview: poster });
              posterId = (await upload(await dataUrlToBlob(poster), "image/jpeg", "cover.jpg")).id;
            }
          }
          const r = await upload(file, typeOfFile(file, kind), original.name, (p) => patchMedia(key, { progress: p }));
          patchMedia(key, { id: r.id, url: r.url, posterId, progress: 1 });
        } catch (err) {
          patchMedia(key, { error: err.message, progress: null });
        }
      })();
    }
  }

  function resetForm() {
    media.forEach((m) => m.preview && URL.revokeObjectURL(m.preview));
    setForm(EMPTY);
    setMedia([]);
    setEditing(null);
    setShowLink(false);
  }

  async function save(e) {
    e.preventDefault();
    if (uploading) return setMsg({ error: true, text: "Wait for the uploads to finish." });
    setBusy(true);
    setMsg(null);
    try {
      const body = {
        ...form,
        validUntil: form.validUntil || null,
        media: media.filter((m) => m.id && !m.error).map((m) => ({ id: m.id, name: m.name, poster: m.posterId })),
      };
      if (editing) await call(`/admin/${editing}`, "PUT", body);
      else await call("/admin", "POST", body);
      setMsg({ text: editing ? "Post updated." : form.published ? "Published. It's live on the News page." : "Saved as a draft." });
      resetForm();
      load();
    } catch (err) {
      setMsg({ error: true, text: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function patch(p, change) {
    try {
      await call(`/admin/${p.id}`, "PUT", change);
      load();
    } catch (e) {
      setMsg({ error: true, text: e.message });
    }
  }

  function edit(p) {
    setEditing(p.id);
    setForm({
      kind: p.kind,
      title: p.title || "",
      body: p.body || "",
      image: p.imageLink || "",
      link: p.link || "",
      code: p.code || "",
      discount: p.discount || "",
      validUntil: p.validUntil ? p.validUntil.slice(0, 10) : "",
      pinned: Boolean(p.pinned),
      published: Boolean(p.published),
    });
    setMedia((p.media || []).map((m, i) => ({ key: `e${i}-${m.id}`, kind: m.kind, id: m.id, url: m.url, name: m.name, posterId: m.posterId, posterUrl: m.poster, progress: 1 })));
    setShowLink(Boolean(p.imageLink));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const isVoucher = form.kind === "voucher";
  return (
    <div className="ad-news">
      <form className="ad-card ad-news-form" onSubmit={save}>
        <div className="ad-card-head">
          <h2>{editing ? "Edit post" : "Create a post or voucher"}</h2>
          <a href="/news" target="_blank" rel="noopener noreferrer" className="ad-muted">
            Open News page ↗
          </a>
        </div>

        <div className="ad-compose">
          <div className="ad-compose-main">
            <fieldset className="ad-step">
              <legend>
                <b>1</b> What are you posting?
              </legend>
              <div className="ad-kinds" role="radiogroup" aria-label="Type">
                {KINDS.map(([v, l, Icon, hint]) => (
                  <button key={v} type="button" role="radio" aria-checked={form.kind === v} className={form.kind === v ? "is-on" : ""} onClick={() => set("kind", v)}>
                    <Icon size={20} />
                    <strong>{l}</strong>
                    <small>{hint}</small>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="ad-step">
              <legend>
                <b>2</b> Write it
              </legend>
              <div className="ad-news-grid">
                <label className="ad-span-3">
                  Title
                  <input required maxLength={120} value={form.title} placeholder={isVoucher ? "e.g. 15% off flights to Tokyo" : "e.g. New ETS departures to Penang"} onChange={(e) => set("title", e.target.value)} />
                </label>
                <label className="ad-span-3">
                  Details
                  <textarea rows={3} maxLength={1500} value={form.body} placeholder={isVoucher ? "Who can use it, minimum spend, which routes…" : "What's new, dates, what travellers should know…"} onChange={(e) => set("body", e.target.value)} />
                </label>
              </div>
            </fieldset>

            {isVoucher && (
              <fieldset className="ad-step">
                <legend>
                  <b>3</b> Voucher
                </legend>
                <div className="ad-news-grid">
                  <label>
                    Code
                    <span className="ad-inline">
                      <input required maxLength={24} value={form.code} placeholder="FLEX15" onChange={(e) => set("code", e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""))} />
                      <button
                        type="button"
                        className="ad-btn ad-btn-ghost"
                        title="Make a code"
                        onClick={() => {
                          const n = (form.discount.match(/\d+/) || [""])[0];
                          const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
                          set("code", `FLEX${n}${rand}`.slice(0, 24));
                        }}
                      >
                        <Shuffle size={15} /> Generate
                      </button>
                    </span>
                  </label>
                  <label className="ad-span-2">
                    Discount
                    <input maxLength={40} value={form.discount} placeholder="15% off" onChange={(e) => set("discount", e.target.value)} />
                    <span className="ad-chips">
                      {DISCOUNTS.map((d) => (
                        <button key={d} type="button" className={form.discount === d ? "is-on" : ""} onClick={() => set("discount", d)}>
                          {d}
                        </button>
                      ))}
                    </span>
                  </label>
                  <label className="ad-span-3">
                    Valid until
                    <span className="ad-inline">
                      <input type="date" value={form.validUntil} min={dayPlus(0)} onChange={(e) => set("validUntil", e.target.value)} />
                      <span className="ad-chips">
                        {[
                          ["1 week", dayPlus(7)],
                          ["2 weeks", dayPlus(14)],
                          ["1 month", dayPlus(30)],
                          ["End of month", endOfMonth()],
                          ["No end date", ""],
                        ].map(([l, v]) => (
                          <button key={l} type="button" className={form.validUntil === v ? "is-on" : ""} onClick={() => set("validUntil", v)}>
                            {l}
                          </button>
                        ))}
                      </span>
                    </span>
                  </label>
                </div>
              </fieldset>
            )}

            <fieldset className="ad-step">
              <legend>
                <b>{isVoucher ? 4 : 3}</b> Photos, videos and songs <span className="ad-muted">(optional)</span>
              </legend>
              <div
                className={`ad-drop ${dragging ? "is-over" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  addFiles(e.dataTransfer.files);
                }}
              >
                <UploadCloud size={30} />
                <strong>Drag files here, or</strong>
                <button type="button" className="ad-btn" onClick={() => fileInput.current && fileInput.current.click()}>
                  <Plus size={16} /> Choose files
                </button>
                <small>Photos (JPG, PNG, WebP, GIF), videos (MP4, MOV) and songs (MP3, M4A, WAV). Up to 8 files, 4 MB each. The first photo is the cover.</small>
                <input
                  ref={fileInput}
                  type="file"
                  multiple
                  hidden
                  accept="image/*,video/mp4,video/quicktime,video/webm,audio/*,.mp3,.m4a,.wav,.ogg"
                  onChange={(e) => {
                    addFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </div>
              {media.length > 0 && (
                <ul className="ad-media">
                  {media.map((m) => (
                    <MediaTile
                      key={m.key}
                      m={m}
                      isCover={m === media.find((x) => x.kind === "image" && !x.error)}
                      onRemove={() => setMedia((list) => list.filter((x) => x.key !== m.key))}
                      onCover={() => setMedia((list) => [m, ...list.filter((x) => x.key !== m.key)])}
                    />
                  ))}
                </ul>
              )}
              <div className="ad-more-links">
                {!showLink ? (
                  <button type="button" className="ad-link-btn" onClick={() => setShowLink(true)}>
                    <ArrowLeftRight size={14} /> Use an image link instead, or add a "Learn more" link
                  </button>
                ) : (
                  <div className="ad-news-grid">
                    <label className="ad-span-2">
                      Image link (https://…)
                      <input type="url" maxLength={600} value={form.image} placeholder="https://images.unsplash.com/…" onChange={(e) => set("image", e.target.value)} />
                    </label>
                    <label>
                      "Learn more" link
                      <input type="url" maxLength={600} value={form.link} placeholder="https://…" onChange={(e) => set("link", e.target.value)} />
                    </label>
                  </div>
                )}
              </div>
            </fieldset>
          </div>

          <aside className="ad-compose-preview" aria-label="Preview">
            <span className="ad-muted">Preview</span>
            <Preview form={form} media={media} />
          </aside>
        </div>

        <div className="ad-news-actions">
          <label className="ad-check">
            <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} /> Published
          </label>
          <label className="ad-check">
            <input type="checkbox" checked={form.pinned} onChange={(e) => set("pinned", e.target.checked)} /> Pin to top
          </label>
          <span className="ad-news-spacer" />
          {editing && (
            <button type="button" className="ad-btn ad-btn-ghost" onClick={resetForm}>
              Cancel
            </button>
          )}
          <button type="submit" className="ad-btn" disabled={busy || uploading}>
            <Plus size={16} /> {uploading ? "Uploading…" : editing ? "Save changes" : form.published ? "Publish" : "Save draft"}
          </button>
        </div>
        {msg && <p className={msg.error ? "ad-error" : "ad-note"}>{msg.text}</p>}
      </form>

      <section className="ad-card ad-card-wide">
        <div className="ad-card-head">
          <h2>All posts</h2>
          <small>{posts ? posts.length : "…"}</small>
        </div>
        {posts && posts.length === 0 && <p className="ad-muted">Nothing yet. Your first post will appear on the News page.</p>}
        <ul className="ad-news-list">
          {(posts || []).map((p) => {
            const expired = p.kind === "voucher" && p.validUntil && new Date(p.validUntil) < new Date();
            const counts = ["image", "video", "audio"].map((k) => (p.media || []).filter((m) => m.kind === k).length);
            return (
              <li key={p.id}>
                {p.image ? <img className="ad-news-thumb" src={abs(p.image)} alt="" loading="lazy" /> : <span className={`ad-news-kind is-${p.kind}`}>{KIND_LABEL[p.kind] || p.kind}</span>}
                <span className="ad-news-title">
                  <strong>
                    {p.pinned && <Pin size={12} />} {p.title}
                  </strong>
                  <small className="ad-muted">
                    {KIND_LABEL[p.kind]} · {p.code ? `${p.code} · ` : ""}
                    {new Date(p.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    {!p.published ? " · draft" : expired ? " · expired" : " · live"}
                    {counts[0] ? ` · ${counts[0]} photo${counts[0] > 1 ? "s" : ""}` : ""}
                    {counts[1] ? ` · ${counts[1]} video${counts[1] > 1 ? "s" : ""}` : ""}
                    {counts[2] ? ` · ${counts[2]} song${counts[2] > 1 ? "s" : ""}` : ""}
                  </small>
                </span>
                <button type="button" className="ad-icon-btn" title={p.published ? "Unpublish" : "Publish"} aria-label={p.published ? "Unpublish" : "Publish"} onClick={() => patch(p, { published: !p.published })}>
                  {p.published ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button type="button" className="ad-icon-btn" title="Edit" aria-label="Edit" onClick={() => edit(p)}>
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  className="ad-icon-btn"
                  title="Delete"
                  aria-label="Delete"
                  onClick={async () => {
                    if (!window.confirm(`Delete "${p.title}"? Its photos, videos and songs are deleted too.`)) return;
                    try {
                      await call(`/admin/${p.id}`, "DELETE");
                      load();
                    } catch (e) {
                      setMsg({ error: true, text: e.message });
                    }
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
