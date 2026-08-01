import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import {
  FaArrowLeft,
  FaCrosshairs,
  FaHotel,
  FaMinus,
  FaPlus,
  FaRedoAlt,
  FaStar,
} from "react-icons/fa";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder";
import "./map.css";

const defaultPosition = [51.5074, -0.1272];

const Maps = ({ height = "calc(100vh - 275px)", width = "100%", markerText = "Hotel Location" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { location: hotelLocation, from } = location.state || {};

  const coordinates =
    Array.isArray(hotelLocation?.coordinates) && hotelLocation.coordinates.length === 2
      ? hotelLocation.coordinates.map(Number)
      : defaultPosition;

  const position = coordinates.every(Number.isFinite) ? coordinates : defaultPosition;

  const handleBack = () => {
    if (location.key && location.key !== "default") {
      navigate(-1);
      return;
    }

    navigate(from || "/hotel");
  };

  return (
    <section className="maps-page">
      <div className="maps-hero-panel">
        <button type="button" className="maps-back-btn" onClick={handleBack}>
          <FaArrowLeft />
          <span>Back to hotels</span>
        </button>
        <div className="maps-title-block">
          <span className="maps-kicker"><FaHotel /> Hotel map view</span>
          <h1>{hotelLocation?.name || "Selected Location"}</h1>
          <p>
            Explore the surrounding area, nearby streets, and live map controls in one focused view.
          </p>
        </div>
        <div className="maps-meta-panel">
          {hotelLocation?.rating && (
            <span><FaStar /> {hotelLocation.rating} rating</span>
          )}
          {hotelLocation?.roomsAvailable && (
            <span>{hotelLocation.roomsAvailable} rooms left</span>
          )}
          {hotelLocation?.pricePerNight && (
            <strong>MYR {hotelLocation.pricePerNight}<small>/night</small></strong>
          )}
        </div>
      </div>

      <div className="map-container modern-map-container" style={{ "--map-height": height, width }}>
        <MapContainer center={position} zoom={13} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          <Marker position={position} icon={hotelGlassIcon()}>
            <Popup className="hotel-map-popup">
              <div className="hotel-map-popup-card">
                <span className="hotel-map-popup-kicker"><FaHotel /> Featured stay</span>
                <h3>{hotelLocation?.name || markerText}</h3>
                {hotelLocation?.brand && <p>{hotelLocation.brand}</p>}
                <div className="hotel-map-popup-grid">
                  {hotelLocation?.rating && <span>{hotelLocation.rating} rating</span>}
                  {hotelLocation?.distanceFromCenter && <span>{hotelLocation.distanceFromCenter} km from centre</span>}
                  {hotelLocation?.roomsAvailable && <span>{hotelLocation.roomsAvailable} rooms left</span>}
                </div>
                {hotelLocation?.pricePerNight && (
                  <strong>MYR {hotelLocation.pricePerNight}<small>per night</small></strong>
                )}
              </div>
            </Popup>
          </Marker>

          <MapResize />
          <MapTools resetPosition={position} />
          <SearchControl />
        </MapContainer>
      </div>
    </section>
  );
};

const hotelGlassIcon = () =>
  L.divIcon({
    className: "glass-marker-host",
    html: `
      <div class="glass-map-pin" aria-hidden="true">
        <span class="glass-map-pin-core">
          <span class="glass-map-pin-dot"></span>
        </span>
        <span class="glass-map-pin-point"></span>
        <span class="glass-map-pin-pulse"></span>
      </div>
    `,
    iconSize: [58, 68],
    iconAnchor: [29, 56],
    popupAnchor: [0, -50],
  });

const userGlassIcon = () =>
  L.divIcon({
    className: "glass-marker-host user-marker-host",
    html: `
      <div class="glass-map-pin user-glass-pin" aria-hidden="true">
        <span class="glass-map-pin-core">
          <span class="glass-map-user-dot"></span>
        </span>
        <span class="glass-map-pin-pulse"></span>
      </div>
    `,
    iconSize: [46, 46],
    iconAnchor: [23, 23],
    popupAnchor: [0, -24],
  });

const searchGlassIcon = () =>
  L.divIcon({
    className: "glass-marker-host search-marker-host",
    html: `
      <div class="glass-map-pin search-glass-pin" aria-hidden="true">
        <span class="glass-map-pin-core">
          <span class="glass-map-search-dot"></span>
        </span>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
  });

const MapResize = () => {
  const map = useMap();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => map.invalidateSize(), 150);
    return () => window.clearTimeout(timeoutId);
  }, [map]);

  return null;
};

const MapTools = ({ resetPosition }) => {
  const map = useMap();

  const handleZoomIn = () => map.zoomIn();
  const handleZoomOut = () => map.zoomOut();
  const resetView = () => map.setView(resetPosition || defaultPosition, 13);

  const locateUser = () => {
    map
      .locate({ setView: true, maxZoom: 16 })
      .on("locationfound", (e) => {
        const userPos = [e.latlng.lat, e.latlng.lng];
        map.setView(userPos, 16);

        L.marker(userPos, { icon: userGlassIcon() }).addTo(map).bindPopup("You are here").openPopup();
      })
      .on("locationerror", () => {
        alert("Location access denied. Please enable location services.");
      });
  };

  return (
    <div className="map-tools">
      <button type="button" onClick={handleZoomIn}><FaPlus /><span>Zoom In</span></button>
      <button type="button" onClick={handleZoomOut}><FaMinus /><span>Zoom Out</span></button>
      <button type="button" onClick={resetView}><FaRedoAlt /><span>Reset View</span></button>
      <button type="button" onClick={locateUser}><FaCrosshairs /><span>Locate Me</span></button>
    </div>
  );
};

const SearchControl = () => {
  const map = useMap();

  useEffect(() => {
    const geocoder = new L.Control.Geocoder.Nominatim();
    const control = new L.Control.Geocoder({
      geocoder,
      collapsed: false,
    }).addTo(map);

    control.on("markgeocode", (e) => {
      const { center } = e.geocode;
      map.setView(center, 13);
      L.marker(center, { icon: searchGlassIcon() }).addTo(map).bindPopup("Search result").openPopup();
    });

    return () => {
      // remove control on unmount
      try {
        map.removeControl(control);
      } catch {}
    };
  }, [map]);

  return null;
};

export default Maps;

