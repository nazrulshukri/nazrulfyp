import React, { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Bot,
  CloudCog,
  CreditCard,
  Database,
  FileText,
  Github,
  Globe,
  KeyRound,
  LayoutDashboard,
  Lock,
  Mail,
  MonitorSmartphone,
  Newspaper,
  PiggyBank,
  Plane,
  Radar,
  Search,
  Server,
  ShieldCheck,
  Ticket,
  UserPlus,
  Users,
} from "lucide-react";

/* A row of steps joined by arrows (stacks vertically on phones). */
function Flow({ steps }) {
  return (
    <ol className="ad-flow">
      {steps.map((s, i) => (
        <React.Fragment key={s.title}>
          <li className={`ad-flow-step ${s.tone ? `is-${s.tone}` : ""}`}>
            <span className="ad-flow-icon">
              <s.icon size={18} />
            </span>
            <b className="ad-flow-no">{i + 1}</b>
            <strong>{s.title}</strong>
            <p>{s.detail}</p>
            {s.tech && <code>{s.tech}</code>}
          </li>
          {i < steps.length - 1 && (
            <li className="ad-flow-arrow" aria-hidden="true">
              <ArrowRight className="is-h" size={18} />
              <ArrowDown className="is-v" size={18} />
            </li>
          )}
        </React.Fragment>
      ))}
    </ol>
  );
}

function Box({ icon: Icon, title, lines, tone }) {
  return (
    <div className={`ad-box ${tone ? `is-${tone}` : ""}`}>
      <strong>
        <Icon size={16} /> {title}
      </strong>
      <ul>
        {lines.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
    </div>
  );
}

function Notes({ items }) {
  return (
    <ul className="ad-notes">
      {items.map(([title, text]) => (
        <li key={title}>
          <strong>{title}</strong> {text}
        </li>
      ))}
    </ul>
  );
}

function SystemView() {
  return (
    <>
      <section className="ad-card">
        <div className="ad-card-head">
          <h2>System overview</h2>
          <small>What runs where</small>
        </div>
        <div className="ad-layers">
          <div className="ad-layer">
            <span className="ad-layer-name">People</span>
            <Box icon={MonitorSmartphone} title="Travellers" lines={["Phone, tablet or laptop browser", "English, Bahasa Melayu, 中文", "24 currencies"]} />
            <Box icon={ShieldCheck} title="Admins" lines={["/admin dashboard", "Super admins manage access"]} />
          </div>
          <ArrowDown className="ad-layer-arrow" size={20} aria-hidden="true" />
          <div className="ad-layer">
            <span className="ad-layer-name">Frontend</span>
            <Box icon={Globe} title="React web app" tone="green" lines={["Single-page app (Create React App)", "Search, booking, tickets, trackers", "Social dashboard and admin", "Served from Vercel's global CDN"]} />
          </div>
          <ArrowDown className="ad-layer-arrow" size={20} aria-hidden="true" />
          <div className="ad-layer">
            <span className="ad-layer-name">Backend</span>
            <Box icon={Server} title="Express API on Vercel" tone="green" lines={["Runs as a serverless function at /api", "Accounts, sessions (JWT), roles", "Orders, tickets, social, admin", "Chat, live data and exchange rates"]} />
          </div>
          <ArrowDown className="ad-layer-arrow" size={20} aria-hidden="true" />
          <div className="ad-layer">
            <span className="ad-layer-name">Data</span>
            <Box icon={Database} title="MongoDB Atlas" tone="green" lines={["users, orders, admins", "profiles, friends, invites, posts, trips", "older payments and searches"]} />
          </div>
        </div>
      </section>

      <div className="ad-grid-2">
        <section className="ad-card">
          <div className="ad-card-head">
            <h2>Outside services</h2>
          </div>
          <div className="ad-box-grid">
            <Box icon={Mail} title="Gmail (SMTP)" lines={["E-tickets with PDF", "Password reset, friend invites"]} />
            <Box icon={KeyRound} title="Firebase" lines={["Google sign-in"]} />
            <Box icon={Bot} title="Claude API (optional)" lines={["Flexi AI assistant", "Free quick answers without it"]} />
            <Box icon={Radar} title="Live data" lines={["KTM trains: data.gov.my", "Aircraft: OpenSky / adsb.lol", "Flight status: AviationStack"]} />
            <Box icon={CreditCard} title="Exchange rates" lines={["ExchangeRate-API, ECB backup", "Cached 6 hours"]} />
          </div>
        </section>
        <section className="ad-card">
          <div className="ad-card-head">
            <h2>How changes go live</h2>
          </div>
          <Flow
            steps={[
              { icon: Github, title: "Pull request", detail: "Every change goes on a branch and a GitHub pull request." },
              { icon: CloudCog, title: "CI checks", detail: "GitHub Actions installs, runs the tests and builds the site.", tech: "ci.yml" },
              { icon: Globe, title: "Preview → live", detail: "Vercel builds a preview per PR and deploys main automatically." },
            ]}
          />
        </section>
      </div>
    </>
  );
}

function AuthView() {
  return (
    <>
      <section className="ad-card">
        <div className="ad-card-head">
          <h2>Sign up</h2>
        </div>
        <Flow
          steps={[
            { icon: UserPlus, title: "Form", detail: "Name, email and password, with strength and match checks in the browser." },
            { icon: Server, title: "POST /signup", detail: "Email normalised and checked for duplicates (409 if taken)." },
            { icon: Lock, title: "Hash password", detail: "Stored only as a bcrypt hash, never in plain text.", tech: "bcrypt, cost 10" },
            { icon: Database, title: "Save user", detail: "New record in users (email is unique).", tone: "data" },
            { icon: KeyRound, title: "Session", detail: "Signed session token returned and kept in the browser.", tech: "JWT, 7 days" },
          ]}
        />
      </section>
      <section className="ad-card">
        <div className="ad-card-head">
          <h2>Log in and every request after</h2>
        </div>
        <Flow
          steps={[
            { icon: KeyRound, title: "POST /signin", detail: "Password compared with the stored hash; same error for wrong email or password." },
            { icon: ShieldCheck, title: "Token", detail: "A new 7-day session token is issued." },
            { icon: Globe, title: "Requests", detail: "The app sends the token with each request.", tech: "Authorization: Bearer …" },
            { icon: Lock, title: "Check", detail: "authz.js verifies the token and the role: user, admin or super admin." },
          ]}
        />
      </section>
      <div className="ad-grid-2">
        <section className="ad-card">
          <div className="ad-card-head">
            <h2>Google sign-in</h2>
          </div>
          <Flow
            steps={[
              { icon: KeyRound, title: "Google popup", detail: "Firebase signs the user in with Google." },
              { icon: ShieldCheck, title: "Verify", detail: "The server checks Google's signature on the ID token.", tech: "/auth/firebase" },
              { icon: Database, title: "Account", detail: "Found or created, then a BookingFlex session token is issued.", tone: "data" },
            ]}
          />
        </section>
        <section className="ad-card">
          <div className="ad-card-head">
            <h2>Forgot password</h2>
          </div>
          <Flow
            steps={[
              { icon: Mail, title: "Request", detail: "Same reply whether or not the email exists, so accounts can't be guessed." },
              { icon: Mail, title: "Email link", detail: "A reset link valid for 1 hour is emailed.", tech: "JWT, purpose: reset" },
              { icon: Lock, title: "New password", detail: "Saved as a new hash; the link works only once." },
            ]}
          />
        </section>
      </div>
      <Notes
        items={[
          ["Roles:", "super admins come from SUPER_ADMIN_EMAILS (server setting); they add admins from the dashboard (admins collection)."],
          ["Safety lock:", "on the live site, anything that trusts a token stays off until JWT_SECRET is set, so tokens can't be forged."],
        ]}
      />
    </>
  );
}

function DashboardView() {
  return (
    <>
      <section className="ad-card">
        <div className="ad-card-head">
          <h2>Traveller dashboard</h2>
          <small>/dashboard, signed in</small>
        </div>
        <div className="ad-box-grid ad-box-grid-5">
          <Box icon={Newspaper} title="Feed" tone="green" lines={["Text and photo posts", "Likes", "Me + friends"]} />
          <Box icon={Users} title="Profile" tone="green" lines={["Photo or character", "Work, education, certificates", "Interests, feeling, status"]} />
          <Box icon={UserPlus} title="Friends" tone="green" lines={["Requests by email", "Invite emails and links", "Accept / decline"]} />
          <Box icon={PiggyBank} title="Trips & savings" tone="green" lines={["Budget and date", "Add / take out savings", "Monthly target"]} />
          <Box icon={Ticket} title="Bookings" tone="green" lines={["Flights, hotels, trains", "Tickets and status"]} />
        </div>
        <div className="ad-arrow-row" aria-hidden="true">
          <ArrowDown size={20} />
        </div>
        <div className="ad-box-grid ad-box-grid-5">
          <Box icon={Server} title="/social API" lines={["Every call needs a session token", "Photos ≤ ~330 KB, JPG/PNG/WebP"]} />
          <Box icon={Database} title="profiles" tone="data" lines={["one per user (email)"]} />
          <Box icon={Database} title="friends + invites" tone="data" lines={["pending → accepted", "single-use invite tokens"]} />
          <Box icon={Database} title="posts" tone="data" lines={["author, text, image, likes"]} />
          <Box icon={Database} title="trips" tone="data" lines={["budget, deposits[]"]} />
        </div>
      </section>
      <section className="ad-card">
        <div className="ad-card-head">
          <h2>Inviting a friend</h2>
        </div>
        <Flow
          steps={[
            { icon: UserPlus, title: "Add by email", detail: "Already a member: friend request. Not a member: invite email with a link." },
            { icon: Mail, title: "Invite link", detail: "Shows who invited them; works before signing in.", tech: "/invite/:token" },
            { icon: KeyRound, title: "Join or sign in", detail: "The invite is remembered while they sign up or sign in." },
            { icon: Users, title: "Friends", detail: "They become friends and see each other's posts.", tone: "data" },
          ]}
        />
      </section>
      <Notes
        items={[
          ["Privacy:", "phone, age and relationship status can each be shown to everyone, friends or only the owner; the server removes hidden fields before sending a profile."],
          ["Ownership:", "people can only edit or delete their own posts and trips, and only friends can like a post."],
        ]}
      />
    </>
  );
}

function BookingView() {
  return (
    <>
      <section className="ad-card">
        <div className="ad-card-head">
          <h2>Booking a flight</h2>
          <small>Hotels and trains follow the same pattern</small>
        </div>
        <Flow
          steps={[
            { icon: Search, title: "Search", detail: "174 airports; dates, travellers, one way or return." },
            { icon: Plane, title: "Results", detail: "Fares and times scaled to the real distance; filter and sort.", tech: "airports.js" },
            { icon: Users, title: "Travellers", detail: "Passenger details, seats and insurance." },
            { icon: CreditCard, title: "Payment", detail: "Card, FPX, e-wallet or PayPal (demo checkout; charged in MYR)." },
            { icon: Database, title: "Order saved", detail: "One record per booking; re-sends update it.", tech: "POST /orders", tone: "data" },
            { icon: FileText, title: "E-ticket", detail: "Boarding-pass PDF built and emailed.", tech: "pdf-lib + Gmail" },
          ]}
        />
      </section>
      <section className="ad-card">
        <div className="ad-card-head">
          <h2>After booking</h2>
        </div>
        <Flow
          steps={[
            { icon: Ticket, title: "Confirmation", detail: "Ticket page with QR, calendar file and download." },
            { icon: LayoutDashboard, title: "My trips & Track", detail: "Status timeline per booking; live trains and flights." },
            { icon: ShieldCheck, title: "Admin", detail: "Revenue, bookings, routes and prices update from orders.", tone: "data" },
          ]}
        />
      </section>
      <Notes
        items={[
          ["Fares:", "sample inventory for the demo; the route engine is ready to swap for a real flight/hotel API (e.g. SerpApi Google Flights & Hotels)."],
          ["Money:", "all prices are stored in MYR and only converted for display."],
        ]}
      />
    </>
  );
}

const VIEWS = [
  ["system", "System", SystemView],
  ["auth", "Sign-up & login", AuthView],
  ["dashboard", "Dashboard", DashboardView],
  ["booking", "Booking", BookingView],
];

/** Architecture diagrams for walking clients and new developers through BookingFlex. */
export default function AdminArchitecture() {
  const [view, setView] = useState("system");
  const Current = VIEWS.find(([id]) => id === view)[2];
  return (
    <div className="ad-arch">
      <div className="ad-tabs ad-tabs-sm" role="tablist" aria-label="Architecture view">
        {VIEWS.map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={view === id} className={view === id ? "is-on" : ""} onClick={() => setView(id)}>
            {label}
          </button>
        ))}
      </div>
      <Current />
    </div>
  );
}
