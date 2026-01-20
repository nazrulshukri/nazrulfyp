import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import userLocationIcon from "../img/assets/maps/images.png";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder";
import "./map.css";

import markerImage from "../img/assets/maps/istockphoto-1148705812-612x612.jpg";

const Maps = ({ height = "500px", width = "100%", markerText = "Hotel Location" }) => {
  const location = useLocation();
  const { location: hotelLocation } = location.state || {};



  // const [userLocation, setUserLocation] = useState(null);
    const [setUserLocation] = useState(null);

  // Default position for London
  const defaultPosition = [51.5074, -0.1272];
  const position =
    Array.isArray(hotelLocation?.coordinates) && hotelLocation.coordinates.length === 2
      ? hotelLocation.coordinates
      : defaultPosition;

  return (
    <div className="map-container" style={{ height, width }}>
      <h2 className="map-title">{hotelLocation?.name || "Selected Location"}</h2>

      <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <Marker position={position} icon={customIcon()}>
          <Popup>{markerText}</Popup>
        </Marker>

        {/* ✅ no setUserLocation needed */}
        <MapTools />
        <SearchControl />
      </MapContainer>
    </div>
  );
};

// Hotel marker icon
const customIcon = () =>
  L.icon({
    iconUrl: markerImage,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

const MapTools = () => {
  const map = useMap();

  // User icon
  const userIcon = new L.Icon({
    iconUrl: userLocationIcon,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const handleZoomIn = () => map.zoomIn();
  const handleZoomOut = () => map.zoomOut();
  const resetView = () => map.setView([51.5074, -0.1272], 13);

  const locateUser = () => {
    map
      .locate({ setView: true, maxZoom: 16 })
      .on("locationfound", (e) => {
        const userPos = [e.latlng.lat, e.latlng.lng];
        map.setView(userPos, 16);

        // Add marker for user location
        L.marker(userPos, { icon: userIcon }).addTo(map).bindPopup("You are here!").openPopup();
      })
      .on("locationerror", () => {
        alert("Location access denied. Please enable location services.");
      });
  };

  return (
    <div className="map-tools">
      <button type="button" onClick={handleZoomIn}>+ Zoom In</button>
      <button type="button" onClick={handleZoomOut}>- Zoom Out</button>
      <button type="button" onClick={resetView}>Reset to London</button>
      <button type="button" onClick={locateUser}>Locate Me</button>
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
      L.marker(center).addTo(map);
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
