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
const LIVE_TOPIC = { all: "all", voucher: "travel", news: "travel", flight: "flights", hotel: "hotels", train: "trains" };

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

const TOPIC_ROWS = [
  ["flight", "flights", "Flights & airlines", Plane],
  ["hotel", "hotels", "Hotels & stays", BedDouble],
  ["train", "trains", "Rail & trains", TrainFront],
];

function useLive(topic) {
  const [state, setState] = useState({ loading: true, articles: [], error: null });
  useEffect(() => {
    if (!topic) return undefined;
    let alive = true;
    setState((s) => ({ ...s, loading: true }));
    fetch(`${API_BASE}/news/live?topic=${topic}`)
      .then((r) => r.json())
      .then((d) => alive && setState({ loading: false, articles: d.articles || [], error: d.error || null }))
      .catch(() => alive && setState({ loading: false, articles: [], error: "Live news is unavailable right now." }));
    return () => {
      alive = false;
    };
  }, [topic]);
  return state;
}

/** Story photo, or a soft placeholder when the source has none or it fails to load. */
function Photo({ src, Icon = Newspaper }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken)
    return (
      <span className="nw-photo is-empty" aria-hidden="true">
        <Icon size={28} />
      </span>
    );
  return <img className="nw-photo" src={src} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setBroken(true)} />;
}

const Meta = ({ a }) => (
  <small className="nw-meta">
    <b>{a.source}</b>
    {a.publishedAt && <span>{ago(a.publishedAt)}</span>}
  </small>
);

function Story({ a, variant, Icon }) {
  return (
    <a className={`nw-story is-${variant}`} href={a.url} target="_blank" rel="noopener noreferrer">
      <span className="nw-story-img">
        <Photo src={a.image} Icon={Icon} />
      </span>
      <span className="nw-story-body">
        <Meta a={a} />
        <strong>{a.title}</strong>
        {(variant === "lead" || variant === "row") && a.description && <span className="nw-story-sum">{a.description}</span>}
        {variant === "row" && (
          <span className="nw-readmore">
            Read on {a.source} <ExternalLink size={12} />
          </span>
        )}
      </span>
    </a>
  );
}

function TopicRow({ topic, title, Icon, onMore }) {
  const { loading, articles } = useLive(topic);
  if (!loading && !articles.length) return null;
  return (
    <section className="nw-row" aria-label={title}>
      <div className="nw-section-head">
        <h2>
          <Icon size={18} /> {title}
        </h2>
        <button type="button" onClick={onMore}>
          See all <ArrowUpRight size={14} />
        </button>
      </div>
      <div className="nw-row-grid">
        {loading
          ? [0, 1, 2, 3].map((i) => <span key={i} className="nw-skel is-card" />)
          : articles.slice(0, 4).map((a) => <Story key={a.url} a={a} variant="card" Icon={Icon} />)}
      </div>
    </section>
  );
}

/** News & deals: BookingFlex updates and vouchers, plus the latest travel headlines. */
export default function NewsPage() {
  const [tab, setTab] = useState("all");
  const [posts, setPosts] = useState(null);
  const [shownCount, setShownCount] = useState(10);
  const live = useLive(LIVE_TOPIC[tab]);

  useEffect(() => {
    fetch(`${API_BASE}/news`)
      .then((r) => r.json())
      .then((d) => setPosts(d.posts || []))
      .catch(() => setPosts([]));
  }, []);
  useEffect(() => setShownCount(10), [tab]);

  const pick = (id) => {
    setTab(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const mine = useMemo(() => (posts || []).filter((p) => tab === "all" || p.kind === tab), [posts, tab]);
  const vouchers = mine.filter((p) => p.kind === "voucher");
  const updates = mine.filter((p) => p.kind !== "voucher");
  const TabIcon = KIND[tab].Icon;

  // Lead story: the first headline with a photo; then four side stories.
  const arts = live.articles;
  const leadIdx = Math.max(0, arts.findIndex((a) => a.image));
  const lead = arts[leadIdx];
  const rest = arts.filter((_, i) => i !== leadIdx);
  const side = rest.slice(0, 4);
  const latest = rest.slice(4);
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="nw-page">
      <header className="nw-mast">
        <div>
          <span className="nw-kicker">
            <Tag size={14} /> BookingFlex
          </span>
          <h1>News & deals</h1>
        </div>
        <p>
          <time>{today}</time>
          <span>Airline, hotel and rail news, plus vouchers for your next trip.</span>
        </p>
      </header>

      <nav className="nw-tabs" aria-label="News sections">
        {TABS.map(([id, label, Icon]) => (
          <button key={id} type="button" className={tab === id ? "is-on" : ""} aria-pressed={tab === id} onClick={() => pick(id)}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </nav>

      {tab !== "voucher" && tab !== "news" && (
        <section className="nw-top" aria-label="Top stories">
          {live.loading && !arts.length ? (
            <>
              <span className="nw-skel is-lead" />
              <div className="nw-side">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className="nw-skel is-side" />
                ))}
              </div>
            </>
          ) : lead ? (
            <>
              <Story a={lead} variant="lead" Icon={TabIcon} />
              <div className="nw-side">
                {side.map((a) => (
                  <Story key={a.url} a={a} variant="side" Icon={TabIcon} />
                ))}
              </div>
            </>
          ) : (
            <p className="nw-muted">{live.error || "No headlines right now."}</p>
          )}
        </section>
      )}

      <div className="nw-columns">
        <main className="nw-main">
          {tab !== "voucher" && tab !== "news" && latest.length > 0 && (
            <section aria-label="Latest">
              <div className="nw-section-head">
                <h2>Latest</h2>
              </div>
              <div className="nw-latest">
                {latest.slice(0, shownCount).map((a) => (
                  <Story key={a.url} a={a} variant="row" Icon={TabIcon} />
                ))}
              </div>
              {latest.length > shownCount && (
                <button type="button" className="nw-more" onClick={() => setShownCount((n) => n + 10)}>
                  Load more stories
                </button>
              )}
            </section>
          )}

          {(tab === "voucher" || tab === "news") && (
            <section aria-label={KIND[tab].label}>
              <div className="nw-section-head">
                <h2>{KIND[tab].label}</h2>
              </div>
              {posts === null && <p className="nw-muted">Loading…</p>}
              {tab === "voucher" && (
                <div className="nw-vouchers">
                  {vouchers.map((p) => (
                    <Voucher key={p.id} p={p} />
                  ))}
                </div>
              )}
              {tab === "news" && (
                <div className="nw-posts">
                  {updates.map((p) => (
                    <Post key={p.id} p={p} />
                  ))}
                </div>
              )}
              {posts && !mine.length && (
                <div className="nw-empty">
                  <TabIcon size={26} />
                  <p>{tab === "voucher" ? "No vouchers right now. Check back soon." : "No BookingFlex news yet."}</p>
                  <Link to="/">Search flights, hotels and trains</Link>
                </div>
              )}
            </section>
          )}
        </main>

        {tab !== "voucher" && tab !== "news" && (
          <aside className="nw-aside" aria-label="Deals and BookingFlex news">
            <div className="nw-section-head">
              <h2>
                <TicketPercent size={17} /> Deals for you
              </h2>
            </div>
            {vouchers.length ? (
              vouchers.slice(0, 3).map((p) => <Voucher key={p.id} p={p} />)
            ) : (
              <div className="nw-aside-cta">
                <p>Fresh vouchers land here first.</p>
                <Link to="/">Plan a trip</Link>
              </div>
            )}
            {updates.length > 0 && (
              <>
                <div className="nw-section-head">
                  <h2>
                    <Megaphone size={17} /> From BookingFlex
                  </h2>
                </div>
                <div className="nw-posts is-compact">
                  {updates.slice(0, 4).map((p) => (
                    <Post key={p.id} p={p} />
                  ))}
                </div>
              </>
            )}
            {arts.length > 0 && (
              <>
                <div className="nw-section-head">
                  <h2>Most recent</h2>
                </div>
                <ol className="nw-ranked">
                  {arts.slice(0, 5).map((a) => (
                    <li key={a.url}>
                      <a href={a.url} target="_blank" rel="noopener noreferrer">
                        <strong>{a.title}</strong>
                        <Meta a={a} />
                      </a>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </aside>
        )}
      </div>

      {tab === "all" &&
        TOPIC_ROWS.map(([id, topic, title, Icon]) => <TopicRow key={id} topic={topic} title={title} Icon={Icon} onMore={() => pick(id)} />)}

      <p className="nw-credit">Headlines link to the original publishers. BookingFlex isn't responsible for third-party content.</p>
    </div>
  );
}
