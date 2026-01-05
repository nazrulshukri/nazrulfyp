import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import userLocationIcon from '../img/assets/maps/images.png'; // Import user icon
import L from "leaflet"; // Importing Leaflet for creating custom icons
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder"; // Import Geocoder
import "./map.css";

import markerImage from "../img/assets/maps/istockphoto-1148705812-612x612.jpg"; // Hotel marker icon

const Maps = ({ height = "500px", width = "100%", markerText = "Hotel Location" }) => {
  const location = useLocation();
  const { location: hotelLocation } = location.state || {};
  const [userLocation, setUserLocation] = useState(null);

  // Default position for London
  const defaultPosition = [51.5074, -0.1272]; // London coordinates
  const position =
    Array.isArray(hotelLocation?.coordinates) && hotelLocation.coordinates.length === 2
      ? hotelLocation.coordinates
      : defaultPosition;

  return (
    <div className="map-container">
      <h2 className="map-title">{hotelLocation?.name || "Selected Location"}</h2>
      <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <Marker position={position} icon={customIcon()}>
          <Popup>{markerText}</Popup>
        </Marker>
        <MapTools setUserLocation={setUserLocation} />
        <SearchControl /> {/* Geocoder Search Control */}
      </MapContainer>
    </div>
  );
};

// Custom icon for hotel marker
const customIcon = () => {
  return L.icon({
    iconUrl: markerImage,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

const MapTools = ({ setUserLocation }) => {
  const map = useMap();

  // User icon definition
  const userIcon = new L.Icon({
    iconUrl: userLocationIcon, // Custom icon for user's location
    iconSize: [32, 32], // Adjust size
    iconAnchor: [16, 32], // Anchor at the base
    popupAnchor: [0, -32], // Position of the popup
  });

  const handleZoomIn = () => map.zoomIn();
  const handleZoomOut = () => map.zoomOut();
  const resetView = () => map.setView([51.5074, -0.1272], 13); // Reset to London

  const locateUser = () => {
    map.locate({ setView: true, maxZoom: 16 })
      .on("locationfound", (e) => {
        const userPos = [e.latlng.lat, e.latlng.lng];
        setUserLocation(userPos); // Update user location
        map.setView(userPos, 16); // Center map on user's location

        // Add marker for user location
        L.marker(userPos, { icon: userIcon }).addTo(map)
          .bindPopup("You are here!")
          .openPopup();
      })
      .on("locationerror", () => {
        alert("Location access denied. Please enable location services.");
      });
  };

  return (
    <div className="map-tools">
      <button onClick={handleZoomIn}>+ Zoom In</button>
      <button onClick={handleZoomOut}>- Zoom Out</button>
      <button onClick={resetView}>Reset to London</button>
      <button onClick={locateUser}>Locate Me</button>
    </div>
  );
};

const SearchControl = () => {
  const map = useMap();

  useEffect(() => {
    const geocoder = new L.Control.Geocoder.Nominatim(); // Initialize geocoder
    const control = new L.Control.Geocoder({
      geocoder: geocoder,
      collapsed: false, // Keep it always visible
    }).addTo(map);

    control.on("markerselected", (e) => {
      const { latlng } = e;
      map.setView(latlng, 13); // Move map to the selected location
      L.marker(latlng).addTo(map); // Optionally add a marker at the searched location
    });
  }, [map]);

  return null;
};

export default Maps;
