import React, { useMemo, useState } from "react";
import "./flightstatus.css";
import axios from "axios";
import {
  FaPlaneDeparture,
  FaPlaneArrival,
  FaPlane,
  FaSearch,
  FaBuilding,
  FaSignal,
  FaClock,
  FaMapMarkerAlt,
  FaTachometerAlt,
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";

function FlightStatus() {
  const [flightId, setFlightId] = useState("");
  const [flightData, setFlightData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const disabled = useMemo(() => !flightId.trim() || loading, [flightId, loading]);

  const handleTrackFlight = async () => {
    setLoading(true);
    setError(null);
    setFlightData(null);

    try {
      const response = await axios.get("https://api.aviationstack.com/v1/flights", {
        params: {
          access_key: "9287f2a8724133b001f230ca478b6c9c",
          flight_iata: flightId.trim(),
        },
      });

      const flight = response.data?.data?.[0];

      if (!flight) {
        setError("Flight not found. Please check the ID and try again.");
      } else {
        setFlightData(flight);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch flight data. Please try again later.");
    }

    setLoading(false);
  };

  const fmtTime = (value) => {
    if (!value) return "N/A";
    try {
      return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "N/A";
    }
  };

  const statusLabel = (s) => {
    const st = (s || "").toLowerCase();
    if (st.includes("active") || st.includes("en-route") || st.includes("air")) return "Airborne";
    if (st.includes("land")) return "Landed";
    if (st.includes("cancel")) return "Cancelled";
    if (st.includes("delay")) return "Delayed";
    return s || "Unknown";
  };

  return (
    <div className="fs-shell">
      <motion.div
        className="fs-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div className="fs-header">
          <div className="fs-badge">
            <FaSignal />
            <span>Live Tracker</span>
          </div>
          <h1 className="fs-title">
            <FaPlane className="fs-titleIcon" />
            Flight Tracker
          </h1>
          <p className="fs-subtitle">
            Track your flight in a premium dashboard view — fast, clean, mobile-ready.
          </p>
        </div>

        {/* Search row */}
        <div className="fs-searchRow">
          <div className="fs-inputWrap">
            <FaSearch className="fs-inputIcon" />
            <input
              type="text"
              placeholder="Enter Flight ID (e.g., AA100)"
              value={flightId}
              onChange={(e) => setFlightId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !disabled && handleTrackFlight()}
            />
          </div>

          <button className="fs-btn" onClick={handleTrackFlight} disabled={disabled}>
            {loading ? "Tracking..." : "Track"}
          </button>
        </div>

        {/* Loading skeleton */}
        <AnimatePresence>
          {loading && (
            <motion.div
              className="fs-skeleton"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
            >
              <div className="sk-line" />
              <div className="sk-grid">
                <div className="sk-box" />
                <div className="sk-box" />
                <div className="sk-box" />
                <div className="sk-box" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error modal */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="fs-modalOverlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setError(null)}
            >
              <motion.div
                className="fs-modal"
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="fs-modalTop">
                  <span className="fs-modalTitle">⚠️ Error</span>
                  <button className="fs-x" onClick={() => setError(null)}>
                    ✖
                  </button>
                </div>
                <p className="fs-modalText">{error}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {flightData && !loading && (
            <motion.div
              className="fs-result"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 14 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <div className="fs-resultTop">
                <h2 className="fs-resultTitle">
                  <FaPlane /> Flight Details
                </h2>

                <span className={`fs-pill ${String(flightData.flight_status || "").toLowerCase()}`}>
                  {statusLabel(flightData.flight_status)}
                </span>
              </div>

              {/* Route */}
              <div className="fs-route">
                <div className="fs-airport">
                  <div className="fs-airportIcon">
                    <FaPlaneDeparture />
                  </div>
                  <div className="fs-airportName">{flightData.departure?.airport || "N/A"}</div>
                  <div className="fs-airportMeta">
                    <span>{fmtTime(flightData.departure?.scheduled)}</span>
                    <span>Terminal: {flightData.departure?.terminal || "N/A"}</span>
                  </div>
                </div>

                <div className="fs-mid">
                  <div className="fs-line">
                    <motion.span
                      className="fs-planeDot"
                      animate={{ x: ["0%", "100%"] }}
                      transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}
                    >
                      <FaPlane />
                    </motion.span>
                  </div>
                  <div className="fs-midMeta">
                    <span className="fs-code">{flightData.flight?.iata || "—"}</span>
                    <span className="fs-airline">{flightData.airline?.name || "—"}</span>
                  </div>
                </div>

                <div className="fs-airport">
                  <div className="fs-airportIcon">
                    <FaPlaneArrival />
                  </div>
                  <div className="fs-airportName">{flightData.arrival?.airport || "N/A"}</div>
                  <div className="fs-airportMeta">
                    <span>{fmtTime(flightData.arrival?.scheduled)}</span>
                    <span>Terminal: {flightData.arrival?.terminal || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Info tiles */}
              <div className="fs-tiles">
                <div className="fs-tile">
                  <FaPlane />
                  <div>
                    <div className="fs-tileLabel">Flight</div>
                    <div className="fs-tileValue">{flightData.flight?.iata || "N/A"}</div>
                  </div>
                </div>

                <div className="fs-tile">
                  <FaBuilding />
                  <div>
                    <div className="fs-tileLabel">Airline</div>
                    <div className="fs-tileValue">{flightData.airline?.name || "N/A"}</div>
                  </div>
                </div>

                <div className="fs-tile">
                  <FaClock />
                  <div>
                    <div className="fs-tileLabel">Delay</div>
                    <div className="fs-tileValue">
                      {flightData.departure?.delay ? `${flightData.departure.delay} min` : "0 min"}
                    </div>
                  </div>
                </div>

                <div className="fs-tile">
                  <FaSignal />
                  <div>
                    <div className="fs-tileLabel">Status</div>
                    <div className="fs-tileValue">{flightData.flight_status || "N/A"}</div>
                  </div>
                </div>

                {flightData.live && (
                  <div className="fs-tile">
                    <FaMapMarkerAlt />
                    <div>
                      <div className="fs-tileLabel">Location</div>
                      <div className="fs-tileValue">
                        {flightData.live.latitude}, {flightData.live.longitude}
                      </div>
                    </div>
                  </div>
                )}

                {flightData.live && (
                  <div className="fs-tile">
                    <FaTachometerAlt />
                    <div>
                      <div className="fs-tileLabel">Speed</div>
                      <div className="fs-tileValue">
                        {flightData.live.speed_horizontal
                          ? `${flightData.live.speed_horizontal.toFixed(1)} km/h`
                          : "0 km/h"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default FlightStatus;