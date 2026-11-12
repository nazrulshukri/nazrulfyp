import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, BedDouble, Check, Copy, ExternalLink, Megaphone, Newspaper, Pin, Plane, Tag, TicketPercent, TrainFront } from "lucide-react";
import { API_BASE } from "../lib/apiConfig";
import "./NewsPage.css";

const TABS = [
  ["all", "All", Newspaper],
  ["voucher", "Vouchers", TicketPercent],
  ["flight", "Flights", Plane],
  ["hotel", "Hotels", BedDouble],
  ["train", "Trains", TrainFront],
  ["news", "BookingFlex news", Megaphone],
];
const KIND = Object.fromEntries(TABS.map(([id, label, Icon]) => [id, { label, Icon }]));
const LIVE_TOPIC = { all: "travel", voucher: "travel", news: "travel", flight: "flights", hotel: "hotels", train: "trains" };

const ago = (d) => {
  const s = Math.max(1, (Date.now() - new Date(d).getTime()) / 1000);
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};
const daysLeft = (d) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);

function Voucher({ p }) {
  const [copied, setCopied] = useState(false);
  const left = p.validUntil ? daysLeft(p.validUntil) : null;
  async function copy() {
    try {
      await navigator.clipboard.writeText(p.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }
  return (
    <article className="nw-voucher">
      <div className="nw-voucher-left">
        <span className="nw-voucher-off">{p.discount || "Special deal"}</span>
        <h3>{p.title}</h3>
        {p.body && <p>{p.body}</p>}
        <small>
          {left == null ? "No end date" : left <= 0 ? "Ends today" : `Ends in ${left} day${left === 1 ? "" : "s"}`}
          {p.validUntil ? ` · until ${new Date(p.validUntil).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : ""}
        </small>
      </div>
      <div className="nw-voucher-right">
        <span className="nw-voucher-label">Code</span>
        <strong>{p.code}</strong>
        <button type="button" onClick={copy} aria-label={`Copy code ${p.code}`}>
          {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? "Copied" : "Copy code"}
        </button>
      </div>
    </article>
  );
}

function Post({ p }) {
  const K = KIND[p.kind] || KIND.news;
  return (
    <article className={`nw-post ${p.image ? "has-image" : ""}`}>
      {p.image && <img src={p.image} alt="" loading="lazy" />}
      <div>
        <span className={`nw-tag is-${p.kind}`}>
          <K.Icon size={13} /> {K.label.replace("BookingFlex news", "News")}
          {p.pinned && (
            <b>
              <Pin size={11} /> Pinned
            </b>
          )}
        </span>
        <h3>{p.title}</h3>
        {p.body && <p>{p.body}</p>}
        <small>{ago(p.createdAt)}</small>
        {p.link && (
          <a href={p.link} target="_blank" rel="noopener noreferrer">
            Learn more <ArrowUpRight size={14} />
          </a>
        )}
      </div>
    </article>
  );
}

/** News & deals: BookingFlex updates and vouchers, plus live travel headlines. */
export default function NewsPage() {
  const [tab, setTab] = useState("all");
  const [posts, setPosts] = useState(null);
  const [live, setLive] = useState({ loading: true, enabled: true, articles: [] });

  useEffect(() => {
    fetch(`${API_BASE}/news`)
      .then((r) => r.json())
      .then((d) => setPosts(d.posts || []))
      .catch(() => setPosts([]));
  }, []);

  const topic = LIVE_TOPIC[tab];
  useEffect(() => {
    setLive((l) => ({ ...l, loading: true }));
    fetch(`${API_BASE}/news/live?topic=${topic}`)
      .then((r) => r.json())
      .then((d) => setLive({ loading: false, enabled: d.enabled !== false, articles: d.articles || [], error: d.error }))
      .catch(() => setLive({ loading: false, enabled: true, articles: [], error: "Live news is unavailable right now." }));
  }, [topic]);

  const shown = useMemo(() => (posts || []).filter((p) => tab === "all" || p.kind === tab), [posts, tab]);
  const vouchers = shown.filter((p) => p.kind === "voucher");
  const others = shown.filter((p) => p.kind !== "voucher");

  return (
    <div className="nw-page">
      <header className="nw-hero">
        <span className="nw-kicker">
          <Tag size={14} /> News & deals
        </span>
        <h1>What's new at BookingFlex</h1>
        <p>Vouchers, route updates, hotel and rail news, and the latest travel headlines, all in one place.</p>
      </header>

      <nav className="nw-tabs" aria-label="News topics">
        {TABS.map(([id, label, Icon]) => (
          <button key={id} type="button" className={tab === id ? "is-on" : ""} aria-pressed={tab === id} onClick={() => setTab(id)}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </nav>

      {posts === null && <p className="nw-muted">Loading updates…</p>}

      {vouchers.length > 0 && (
        <section aria-label="Vouchers">
          <h2 className="nw-h2">Vouchers</h2>
          <div className="nw-vouchers">
            {vouchers.map((p) => (
              <Voucher key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section aria-label="Updates">
          {vouchers.length > 0 && <h2 className="nw-h2">Updates</h2>}
          <div className="nw-posts">
            {others.map((p) => (
              <Post key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}

      {posts && shown.length === 0 && (
        <div className="nw-empty">
          <Newspaper size={26} />
          <p>{tab === "voucher" ? "No vouchers right now. Check back soon." : "No updates here yet."}</p>
          <Link to="/">Search flights, hotels and trains</Link>
        </div>
      )}

      {live.enabled && (
        <section className="nw-live" aria-label="Latest travel news">
          <h2 className="nw-h2">
            Latest travel news <small>from around the web</small>
          </h2>
          {live.loading && <p className="nw-muted">Loading headlines…</p>}
          {!live.loading && live.error && <p className="nw-muted">{live.error}</p>}
          {!live.loading && !live.error && live.articles.length === 0 && <p className="nw-muted">No headlines right now.</p>}
          <ul>
            {live.articles.map((a) => (
              <li key={a.url}>
                <a href={a.url} target="_blank" rel="noopener noreferrer">
                  {a.image && <img src={a.image} alt="" loading="lazy" />}
                  <span>
                    <strong>{a.title}</strong>
                    <small>
                      {a.source} · {ago(a.publishedAt)} <ExternalLink size={12} />
                    </small>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
