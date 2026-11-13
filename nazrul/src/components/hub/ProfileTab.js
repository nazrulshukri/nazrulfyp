import React, { useMemo, useRef, useState } from "react";
import { Award, Briefcase, Camera, Check, Globe2, GraduationCap, Heart, ImagePlus, Loader2, Lock, Pencil, Phone, Plane, Plus, Trash2, UserRound } from "lucide-react";
import Avatar from "./Avatar";
import { CHARACTERS, COVERS, INTERESTS, MOODS, RELATIONSHIPS, api, resizeImage } from "../../lib/social";
import { getCurrentUserEmail, getProfile, saveProfile } from "../../lib/bookingStorage";
import { countryList, countryName, flagOf, guessCountry, readPhone } from "../../lib/countries";

const CABINS = ["Economy", "Premium Economy", "Business", "First"];

// Travel details used to live only in this browser (the old Profile
// Maintenance page). Start from those if the account has none saved yet.
function travelOf(p) {
  const t = p.travel || {};
  if (t.legalName || t.nationality || t.passport || t.preferredAirport) return t;
  const old = getProfile(getCurrentUserEmail());
  return {
    legalName: old.fullName || "",
    nationality: old.nationality || "",
    passport: old.passportNumber || "",
    preferredAirport: old.preferredAirport || "",
    cabin: old.cabinPreference || t.cabin || "Economy",
    notifications: old.notifications !== false,
  };
}

// Booking pages and the Bookings tab still read the copy in this browser.
function mirrorTravel(p) {
  const t = p.travel || {};
  saveProfile(getCurrentUserEmail(), {
    fullName: t.legalName || p.name || "",
    phone: p.phone || "",
    nationality: t.nationality || "",
    passportNumber: t.passport || "",
    preferredAirport: t.preferredAirport || "",
    cabinPreference: t.cabin || "Economy",
    notifications: t.notifications !== false,
  });
}
const maskPassport = (v) => (v ? `${"•".repeat(Math.max(0, v.length - 4))}${v.slice(-4)}` : "");

const VIS = [
  ["public", "Everyone"],
  ["friends", "Friends"],
  ["private", "Only me"],
];
const LISTS = {
  experience: { title: "Work experience", icon: Briefcase, fields: [["title", "Job title"], ["company", "Company"], ["from", "From"], ["to", "To"]] },
  education: { title: "Education", icon: GraduationCap, fields: [["school", "School / university"], ["course", "Course"], ["year", "Year"]] },
  certificates: { title: "Certificates", icon: Award, fields: [["name", "Certificate"], ["issuer", "Issued by"], ["year", "Year"]] },
};
const relLabel = (v) => (RELATIONSHIPS.find(([k]) => k === v) || ["", ""])[1];

function View({ p, onEdit }) {
  const facts = [
    p.age && ["Age", p.age],
    p.country && ["From", `${flagOf(p.country)} ${countryName(p.country)}`],
    p.phone && ["Phone", (() => {
      const ph = readPhone(p.phone, p.country || "MY");
      return `${ph.flag ? `${ph.flag} ` : ""}${ph.international || p.phone}`;
    })()],
    p.relationship && ["Status", relLabel(p.relationship)],
    p.location && ["Lives in", p.location],
  ].filter(Boolean);
  return (
    <div className="hub-profile">
      <section className="hub-card">
        <div className="hub-card-head">
          <h2>About</h2>
          <button type="button" className="hub-btn" onClick={onEdit}>
            <Pencil size={15} /> Edit profile
          </button>
        </div>
        {p.bio ? <p className="hub-lead">{p.bio}</p> : <p className="hub-muted">Add a short bio so friends know what you love about travel.</p>}
        {p.mood?.emoji && (
          <p className="hub-feeling">
            <span>{p.mood.emoji}</span> Feeling {p.mood.text || "good"}
          </p>
        )}
        {facts.length > 0 && (
          <dl className="hub-facts">
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <section className="hub-card">
        <div className="hub-card-head">
          <h2>
            <Heart size={18} /> Interests
          </h2>
        </div>
        {p.interests?.length ? (
          <div className="hub-chips">
            {p.interests.map((i) => (
              <span key={i} className="hub-chip is-on">
                {i}
              </span>
            ))}
          </div>
        ) : (
          <p className="hub-muted">Pick what you love doing: fishing, golf, music and more.</p>
        )}
      </section>

      <TravelCard t={travelOf(p)} onEdit={onEdit} />

      {Object.entries(LISTS).map(([key, { title, icon: Icon, fields }]) => (
        <section className="hub-card" key={key}>
          <div className="hub-card-head">
            <h2>
              <Icon size={18} /> {title}
            </h2>
          </div>
          {p[key]?.length ? (
            <ul className="hub-timeline">
              {p[key].map((row, i) => (
                <li key={i}>
                  <strong>{row[fields[0][0]]}</strong>
                  <span>{fields.slice(1).map(([f]) => row[f]).filter(Boolean).join(" · ")}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="hub-muted">Nothing added yet.</p>
          )}
        </section>
      ))}
    </div>
  );
}

function TravelCard({ t, onEdit }) {
  const rows = [
    ["Name on passport", t.legalName],
    ["Nationality", t.nationality],
    ["Passport", maskPassport(t.passport)],
    ["Preferred airport", t.preferredAirport],
    ["Cabin", t.cabin || "Economy"],
    ["Trip reminders", t.notifications === false ? "Off" : "On"],
  ];
  const missing = !t.legalName || !t.passport;
  return (
    <section className="hub-card">
      <div className="hub-card-head">
        <h2>
          <Plane size={18} /> Travel details
        </h2>
        <small className="hub-muted hub-private">
          <Lock size={13} /> Only you
        </small>
      </div>
      <dl className="hub-facts">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v || <span className="hub-muted">Not added</span>}</dd>
          </div>
        ))}
      </dl>
      {missing && (
        <button type="button" className="hub-btn hub-btn-ghost" onClick={onEdit}>
          <Pencil size={15} /> Add passport details for faster booking
        </button>
      )}
    </section>
  );
}

function Edit({ p, onCancel, onSaved }) {
  const [f, setF] = useState(() => ({
    name: p.name || "",
    profession: p.profession || "",
    age: p.age || "",
    phone: p.phone || "",
    location: p.location || "",
    bio: p.bio || "",
    relationship: p.relationship || "",
    mood: { emoji: p.mood?.emoji || "", text: p.mood?.text || "" },
    interests: p.interests || [],
    experience: p.experience?.length ? p.experience : [],
    education: p.education?.length ? p.education : [],
    certificates: p.certificates?.length ? p.certificates : [],
    visibility: { phone: "friends", age: "friends", relationship: "friends", ...(p.visibility || {}) },
    avatar: p.avatar || { kind: "character", character: "traveller" },
    cover: p.cover || "forest",
    coverPhoto: p.coverPhoto || "",
    country: p.country || "",
    travel: { cabin: "Economy", notifications: true, ...travelOf(p) },
  }));
  const setTravel = (k, v) => setF((s) => ({ ...s, travel: { ...s.travel, [k]: v } }));
  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const file = useRef(null);
  const coverFile = useRef(null);
  const countries = useMemo(countryList, []);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const phone = readPhone(f.phone, f.country || guessCountry());

  async function pickCover(e) {
    const file0 = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file0) return;
    try {
      set("coverPhoto", await resizeImage(file0, 1600));
    } catch (err) {
      setError(err.message);
    }
  }

  async function pickPhoto(e) {
    const file0 = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file0) return;
    try {
      set("avatar", { kind: "photo", photo: await resizeImage(file0, 512), character: f.avatar.character });
    } catch (err) {
      setError(err.message);
    }
  }

  const toggleInterest = (i) => set("interests", f.interests.includes(i) ? f.interests.filter((x) => x !== i) : [...f.interests, i]);

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body = { ...f };
      if (phone.valid) body.phone = phone.international;
      if (!body.country && phone.country) body.country = phone.country;
      const { profile } = await api("/me", { method: "PUT", body });
      mirrorTravel(profile);
      onSaved(profile);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const visSelect = (field) => (
    <select className="hub-vis" aria-label={`Who can see your ${field}`} value={f.visibility[field]} onChange={(e) => set("visibility", { ...f.visibility, [field]: e.target.value })}>
      {VIS.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  );

  return (
    <form className="hub-profile hub-edit" onSubmit={save}>
      <section className="hub-card">
        <div className="hub-card-head">
          <h2>Picture</h2>
        </div>
        <div className="hub-avatar-pick">
          <Avatar avatar={f.avatar} name={f.name} size={96} ring />
          <div>
            <button type="button" className="hub-btn hub-btn-ghost" onClick={() => file.current && file.current.click()}>
              <Camera size={16} /> Upload a photo
            </button>
            <input ref={file} type="file" accept="image/*" hidden onChange={pickPhoto} />
            <p className="hub-muted">Or pick a character:</p>
            <div className="hub-characters" role="radiogroup" aria-label="Character">
              {CHARACTERS.map((c) => {
                const on = f.avatar.kind === "character" && f.avatar.character === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    title={c.label}
                    className={on ? "is-on" : ""}
                    style={{ background: c.bg }}
                    onClick={() => set("avatar", { kind: "character", character: c.id })}
                  >
                    {c.emoji}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <p className="hub-label">Cover background</p>
        <div className="hub-cover-pick">
          <div className="hub-cover-preview" style={{ background: f.coverPhoto ? `center / cover no-repeat url("${f.coverPhoto}")` : COVERS[f.cover] || COVERS.forest }}>
            <Avatar avatar={f.avatar} name={f.name} size={48} ring />
          </div>
          <div className="hub-inline">
            <button type="button" className="hub-btn hub-btn-ghost" onClick={() => coverFile.current && coverFile.current.click()}>
              <ImagePlus size={16} /> {f.coverPhoto ? "Change cover photo" : "Upload a cover photo"}
            </button>
            {f.coverPhoto && (
              <button type="button" className="hub-btn hub-btn-ghost" onClick={() => set("coverPhoto", "")}>
                <Trash2 size={15} /> Remove photo
              </button>
            )}
            <input ref={coverFile} type="file" accept="image/*" hidden onChange={pickCover} />
          </div>
        </div>
        <p className="hub-label">{f.coverPhoto ? "Colour (used when there's no photo)" : "Or pick a colour"}</p>
        <div className="hub-covers" role="radiogroup" aria-label="Cover colour">
          {Object.entries(COVERS).map(([k, bg]) => (
            <button key={k} type="button" role="radio" aria-checked={f.cover === k} aria-label={k} className={f.cover === k ? "is-on" : ""} style={{ background: bg }} onClick={() => set("cover", k)} />
          ))}
        </div>
      </section>

      <section className="hub-card">
        <div className="hub-card-head">
          <h2>
            <UserRound size={18} /> About you
          </h2>
        </div>
        <div className="hub-grid">
          <label>
            Name
            <input value={f.name} maxLength={80} required onChange={(e) => set("name", e.target.value)} />
          </label>
          <label>
            Profession
            <input value={f.profession} maxLength={80} placeholder="e.g. Software engineer" onChange={(e) => set("profession", e.target.value)} />
          </label>
          <label>
            <span className="hub-label-row">
              Age {visSelect("age")}
            </span>
            <input type="number" min="13" max="120" value={f.age} onChange={(e) => set("age", e.target.value)} />
          </label>
          <label>
            <span className="hub-label-row">
              <span>
                <Phone size={13} /> Phone
              </span>
              {visSelect("phone")}
            </span>
            <span className="hub-phone">
              <span className="hub-phone-flag" title={phone.country ? countryName(phone.country) : "Country"} aria-hidden="true">
                {phone.flag || "🌐"}
              </span>
              <input type="tel" value={f.phone} maxLength={30} autoComplete="tel" placeholder="+60 12 345 6789" onChange={(e) => set("phone", e.target.value)} />
            </span>
            {f.phone && (
              <small className={`hub-hint ${phone.valid ? "is-ok" : ""}`}>
                {phone.valid ? `${countryName(phone.country)} · ${phone.international}` : phone.country ? `Looks like ${countryName(phone.country)}. Keep typing…` : "Start with + and the country code, e.g. +60"}
              </small>
            )}
          </label>
          <label>
            <span className="hub-label-row">
              <span>
                <Globe2 size={13} /> Country
              </span>
            </span>
            <select value={f.country} onChange={(e) => set("country", e.target.value)}>
              <option value="">{phone.country ? `Use ${flagOf(phone.country)} ${countryName(phone.country)} (from your phone)` : "Choose your country"}</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Lives in
            <input value={f.location} maxLength={80} placeholder="e.g. Kuala Lumpur" onChange={(e) => set("location", e.target.value)} />
          </label>
          <label>
            <span className="hub-label-row">
              Relationship status {visSelect("relationship")}
            </span>
            <select value={f.relationship} onChange={(e) => set("relationship", e.target.value)}>
              {RELATIONSHIPS.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="hub-span-2">
            Bio
            <textarea value={f.bio} maxLength={400} rows={3} placeholder="What kind of traveller are you?" onChange={(e) => set("bio", e.target.value)} />
          </label>
        </div>
      </section>

      <section className="hub-card">
        <div className="hub-card-head">
          <h2>How are you feeling?</h2>
        </div>
        <div className="hub-moods" role="radiogroup" aria-label="Feeling">
          {MOODS.map((m) => (
            <button key={m} type="button" role="radio" aria-checked={f.mood.emoji === m} className={f.mood.emoji === m ? "is-on" : ""} onClick={() => set("mood", { ...f.mood, emoji: f.mood.emoji === m ? "" : m })}>
              {m}
            </button>
          ))}
        </div>
        <input className="hub-input" value={f.mood.text} maxLength={80} placeholder="e.g. excited for London" aria-label="Feeling, in words" onChange={(e) => set("mood", { ...f.mood, text: e.target.value })} />
      </section>

      <section className="hub-card">
        <div className="hub-card-head">
          <h2>
            <Heart size={18} /> Interests
          </h2>
          <small className="hub-muted">{f.interests.length} picked</small>
        </div>
        <div className="hub-chips">
          {[...new Set([...INTERESTS, ...f.interests])].map((i) => (
            <button key={i} type="button" className={`hub-chip ${f.interests.includes(i) ? "is-on" : ""}`} aria-pressed={f.interests.includes(i)} onClick={() => toggleInterest(i)}>
              {f.interests.includes(i) && <Check size={13} />} {i}
            </button>
          ))}
        </div>
        <div className="hub-inline">
          <input className="hub-input" value={custom} maxLength={30} placeholder="Add your own, e.g. Sailing" onChange={(e) => setCustom(e.target.value)} />
          <button
            type="button"
            className="hub-btn hub-btn-ghost"
            disabled={!custom.trim()}
            onClick={() => {
              const v = custom.trim();
              if (v && !f.interests.includes(v)) set("interests", [...f.interests, v]);
              setCustom("");
            }}
          >
            <Plus size={15} /> Add
          </button>
        </div>
      </section>

      {Object.entries(LISTS).map(([key, { title, icon: Icon, fields }]) => (
        <section className="hub-card" key={key}>
          <div className="hub-card-head">
            <h2>
              <Icon size={18} /> {title}
            </h2>
            <button type="button" className="hub-btn hub-btn-ghost" disabled={f[key].length >= 10} onClick={() => set(key, [...f[key], Object.fromEntries(fields.map(([k]) => [k, ""]))])}>
              <Plus size={15} /> Add
            </button>
          </div>
          {f[key].length === 0 && <p className="hub-muted">Nothing added yet.</p>}
          {f[key].map((row, i) => (
            <div className="hub-row" key={i}>
              {fields.map(([k, label]) => (
                <input key={k} className="hub-input" placeholder={label} aria-label={label} value={row[k] || ""} maxLength={80} onChange={(e) => set(key, f[key].map((r, j) => (j === i ? { ...r, [k]: e.target.value } : r)))} />
              ))}
              <button type="button" className="hub-icon-btn is-quiet" aria-label={`Remove ${title.toLowerCase()} ${i + 1}`} onClick={() => set(key, f[key].filter((_, j) => j !== i))}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </section>
      ))}

      <section className="hub-card">
        <div className="hub-card-head">
          <h2>
            <Plane size={18} /> Travel details
          </h2>
          <small className="hub-muted hub-private">
            <Lock size={13} /> Only you can see these
          </small>
        </div>
        <p className="hub-muted">Used to fill in flight, hotel and train bookings for you.</p>
        <div className="hub-grid">
          <label>
            Name as on passport
            <input value={f.travel.legalName || ""} maxLength={100} autoComplete="name" placeholder="e.g. Muhammad Nazrul bin Ahmad" onChange={(e) => setTravel("legalName", e.target.value)} />
          </label>
          <label>
            Nationality
            <input value={f.travel.nationality || ""} maxLength={60} autoComplete="country-name" placeholder="e.g. Malaysia" onChange={(e) => setTravel("nationality", e.target.value)} />
          </label>
          <label>
            Passport number
            <input value={f.travel.passport || ""} maxLength={20} autoComplete="off" spellCheck={false} placeholder="e.g. A12345678" onChange={(e) => setTravel("passport", e.target.value.toUpperCase())} />
          </label>
          <label>
            Preferred airport
            <input value={f.travel.preferredAirport || ""} maxLength={100} placeholder="e.g. Kuala Lumpur International (KUL)" onChange={(e) => setTravel("preferredAirport", e.target.value)} />
          </label>
          <label>
            Cabin
            <select value={f.travel.cabin || "Economy"} onChange={(e) => setTravel("cabin", e.target.value)}>
              {CABINS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="hub-check hub-span-2">
            <input type="checkbox" checked={f.travel.notifications !== false} onChange={(e) => setTravel("notifications", e.target.checked)} />
            <span>
              <strong>Trip reminders</strong>
              <small>Remind me before upcoming departures.</small>
            </span>
          </label>
        </div>
      </section>

      {error && <p className="hub-error">{error}</p>}
      <div className="hub-save-bar">
        <button type="button" className="hub-btn hub-btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="hub-btn" disabled={busy}>
          {busy ? <Loader2 size={16} className="hub-spin" /> : <Check size={16} />} Save profile
        </button>
      </div>
    </form>
  );
}

export default function ProfileTab({ profile, onSaved }) {
  const [editing, setEditing] = useState(false);
  return editing ? (
    <Edit
      p={profile}
      onCancel={() => setEditing(false)}
      onSaved={(p) => {
        onSaved(p);
        setEditing(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    />
  ) : (
    <View p={profile} onEdit={() => setEditing(true)} />
  );
}
