import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Loader2, MinusCircle, PiggyBank, Plane, Plus, Target, Trash2, TrendingUp } from "lucide-react";
import { api } from "../../lib/social";
import { formatPrice } from "../../lib/currency";
import { WORLD_AIRPORTS, airportByCode, fitFlightsToRoute } from "../../lib/airports";
import { generateMockFlights } from "../../mockdata/flights";
import { DESTINATIONS } from "../body";

const money = (v) => formatPrice(v, { whole: true });
const isoDay = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

// A photo and a typical flight price for the destination, when we know it.
function useTripInfo(destination) {
  return useMemo(() => {
    const q = (destination || "").trim().toLowerCase();
    if (!q) return {};
    const d = DESTINATIONS.find((x) => x.name.toLowerCase() === q || q.includes(x.name.toLowerCase()));
    const airport = WORLD_AIRPORTS.find((a) => a.city.toLowerCase() === q || a.code.toLowerCase() === q) || (d && WORLD_AIRPORTS.find((a) => a.value === d.airport));
    let flight = null;
    const kul = airportByCode("KUL");
    if (airport && airport.code !== "KUL") {
      const list = fitFlightsToRoute(generateMockFlights(isoDay(30), "", kul.value, airport.value), kul.value, airport.value);
      flight = Math.min(...list.map((f) => f.price));
    }
    return { image: d && d.image, flight, code: airport && airport.code };
  }, [destination]);
}

function monthsUntil(date) {
  if (!date) return null;
  const ms = new Date(date).getTime() - Date.now();
  return ms > 0 ? Math.max(1, Math.ceil(ms / (30.44 * 86400000))) : 0;
}

function TripCard({ trip, onUpdate, onDelete }) {
  const info = useTripInfo(trip.destination);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [withdraw, setWithdraw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const pct = trip.budgetMyr > 0 ? Math.min(100, Math.round((trip.savedMyr / trip.budgetMyr) * 100)) : 0;
  const left = Math.max(0, trip.budgetMyr - trip.savedMyr);
  const months = monthsUntil(trip.targetDate);
  const perMonth = months ? left / months : null;
  const done = trip.budgetMyr > 0 && trip.savedMyr >= trip.budgetMyr;

  async function addSavings(e) {
    e.preventDefault();
    const n = Number(amount);
    if (!n) return;
    setBusy(true);
    try {
      const { trip: t } = await api(`/trips/${trip.id}/deposits`, { method: "POST", body: { amount: withdraw ? -Math.abs(n) : Math.abs(n), note } });
      onUpdate(t);
      setAmount("");
      setNote("");
      setWithdraw(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className={`hub-card hub-trip ${done ? "is-done" : ""}`}>
      <div className="hub-trip-photo" style={info.image ? { backgroundImage: `url(${info.image})` } : undefined}>
        <div>
          <span className="hub-trip-kicker">{done ? "Goal reached 🎉" : "Saving for"}</span>
          <h3>{trip.destination}</h3>
          {trip.targetDate && (
            <small>
              <CalendarDays size={13} /> {new Date(trip.targetDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              {months > 0 ? ` · ${months} month${months === 1 ? "" : "s"} to go` : months === 0 ? " · it's time!" : ""}
            </small>
          )}
        </div>
        <button type="button" className="hub-icon-btn hub-trip-delete" aria-label={`Delete ${trip.destination} plan`} onClick={() => window.confirm(`Delete your ${trip.destination} plan?`) && onDelete(trip)}>
          <Trash2 size={16} />
        </button>
      </div>

      <div className="hub-trip-body">
        <div className="hub-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={`${pct}% saved`}>
          <span style={{ width: `${pct}%` }} />
        </div>
        <dl className="hub-trip-stats">
          <div>
            <dt>Saved</dt>
            <dd>{money(trip.savedMyr)}</dd>
          </div>
          <div>
            <dt>Goal</dt>
            <dd>{money(trip.budgetMyr)}</dd>
          </div>
          <div>
            <dt>Still needed</dt>
            <dd>{money(left)}</dd>
          </div>
          <div>
            <dt>Progress</dt>
            <dd>{pct}%</dd>
          </div>
        </dl>

        {!done && perMonth != null && perMonth > 0 && (
          <p className="hub-tip">
            <TrendingUp size={15} />
            <span>
              Save about <strong>{money(perMonth)}</strong> a month to make it in time.
            </span>
          </p>
        )}
        {info.flight && (
          <p className="hub-tip is-quiet">
            <Plane size={15} />
            <span>
              Flights KUL → {info.code} from about <strong>{money(info.flight)}</strong> per person. <Link to="/">Search flights</Link>
            </span>
          </p>
        )}
        {trip.note && <p className="hub-muted">{trip.note}</p>}

        <form className="hub-deposit" onSubmit={addSavings}>
          <div className="hub-seg" role="group" aria-label="Add or take out">
            <button type="button" className={!withdraw ? "is-on" : ""} aria-pressed={!withdraw} onClick={() => setWithdraw(false)}>
              <Plus size={14} /> Add
            </button>
            <button type="button" className={withdraw ? "is-on" : ""} aria-pressed={withdraw} onClick={() => setWithdraw(true)}>
              <MinusCircle size={14} /> Take out
            </button>
          </div>
          <input className="hub-input" type="number" min="1" step="0.01" placeholder="Amount (RM)" aria-label="Amount in RM" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          <input className="hub-input" maxLength={80} placeholder="Note (optional)" aria-label="Note" value={note} onChange={(e) => setNote(e.target.value)} />
          <button type="submit" className="hub-btn" disabled={busy}>
            {busy ? <Loader2 size={16} className="hub-spin" /> : <PiggyBank size={16} />} Save
          </button>
        </form>
        {error && <p className="hub-error">{error}</p>}

        {trip.deposits.length > 0 && (
          <ul className="hub-deposits">
            {(showAll ? trip.deposits : trip.deposits.slice(0, 4)).map((d) => (
              <li key={d.id}>
                <span className={d.amount < 0 ? "is-out" : "is-in"}>
                  {d.amount < 0 ? "−" : "+"}
                  {money(Math.abs(d.amount))}
                </span>
                <span>{d.note || (d.amount < 0 ? "Taken out" : "Added")}</span>
                <small>{new Date(d.at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</small>
              </li>
            ))}
            {trip.deposits.length > 4 && (
              <li>
                <button type="button" className="hub-link" onClick={() => setShowAll((v) => !v)}>
                  {showAll ? "Show less" : `Show all ${trip.deposits.length}`}
                </button>
              </li>
            )}
          </ul>
        )}
      </div>
    </article>
  );
}

/** Trips people want to take, with a savings goal and progress for each. */
export default function TripsTab({ onChange }) {
  const [trips, setTrips] = useState(null);
  const [form, setForm] = useState({ destination: "", budgetMyr: "", targetDate: "", note: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const info = useTripInfo(form.destination);

  const load = useCallback(async () => {
    try {
      setTrips((await api("/trips")).trips);
    } catch (e) {
      setError(e.message);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const totals = useMemo(() => {
    const list = trips || [];
    return {
      saved: list.reduce((s, t) => s + t.savedMyr, 0),
      goal: list.reduce((s, t) => s + t.budgetMyr, 0),
    };
  }, [trips]);

  async function create(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const { trip } = await api("/trips", { method: "POST", body: { ...form, budgetMyr: Number(form.budgetMyr) || 0 } });
      setTrips((list) => [...(list || []), trip]);
      setForm({ destination: "", budgetMyr: "", targetDate: "", note: "" });
      setError(null);
      onChange && onChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(trip) {
    try {
      await api(`/trips/${trip.id}`, { method: "DELETE" });
      setTrips((list) => list.filter((t) => t.id !== trip.id));
      onChange && onChange();
    } catch (err) {
      setError(err.message);
    }
  }

  // Suggest a budget: flight for one, plus about RM 450 a night for 5 nights.
  const suggested = info.flight ? Math.round((info.flight + 5 * 450) / 50) * 50 : null;

  return (
    <div className="hub-trips">
      {trips && trips.length > 0 && (
        <section className="hub-savings-summary">
          <div>
            <small>Saved for trips</small>
            <strong>{money(totals.saved)}</strong>
          </div>
          <div>
            <small>Total goals</small>
            <strong>{money(totals.goal)}</strong>
          </div>
          <div>
            <small>Trips planned</small>
            <strong>{trips.length}</strong>
          </div>
        </section>
      )}

      <form className="hub-card hub-new-trip" onSubmit={create}>
        <div className="hub-card-head">
          <h2>
            <Target size={18} /> Plan a new trip
          </h2>
        </div>
        <div className="hub-grid">
          <label>
            Where to?
            <input list="hub-destinations" required maxLength={80} value={form.destination} placeholder="e.g. London" onChange={(e) => setForm({ ...form, destination: e.target.value })} />
            <datalist id="hub-destinations">
              {DESTINATIONS.map((d) => (
                <option key={d.name} value={d.name} />
              ))}
            </datalist>
          </label>
          <label>
            When?
            <input type="date" min={isoDay(1)} value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} />
          </label>
          <label>
            Budget (RM)
            <input type="number" min="0" step="50" value={form.budgetMyr} placeholder={suggested ? String(suggested) : "e.g. 6000"} onChange={(e) => setForm({ ...form, budgetMyr: e.target.value })} />
            {suggested && !form.budgetMyr && (
              <button type="button" className="hub-link" onClick={() => setForm({ ...form, budgetMyr: String(suggested) })}>
                Use suggested {money(suggested)} (flight + 5 nights)
              </button>
            )}
          </label>
          <label>
            Note
            <input maxLength={300} value={form.note} placeholder="e.g. with Aina, see Big Ben" onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </label>
        </div>
        {error && <p className="hub-error">{error}</p>}
        <button type="submit" className="hub-btn" disabled={busy}>
          {busy ? <Loader2 size={16} className="hub-spin" /> : <Plus size={16} />} Add trip plan
        </button>
      </form>

      {!trips && !error && <p className="hub-muted">Loading your trips…</p>}
      {trips && trips.length === 0 && (
        <div className="hub-card hub-empty">
          <strong>No trip plans yet</strong>
          <p>Add a dream trip, set a budget, and track your savings until you can book it.</p>
        </div>
      )}
      <div className="hub-trip-grid">
        {(trips || []).map((t) => (
          <TripCard key={t.id} trip={t} onDelete={remove} onUpdate={(nt) => setTrips((list) => list.map((x) => (x.id === nt.id ? nt : x)))} />
        ))}
      </div>
    </div>
  );
}
