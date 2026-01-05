import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-polylinedecorator";
import "./maptrain.css";

// Train-specific icons
import destination1 from "../img/assets/train/images (10).png";
import trainstop from "../img/assets/train/images.png";

const startIcon = new L.Icon({
  iconUrl: destination1,
  iconSize: [32, 32],
});

const stopIcon = new L.Icon({
  iconUrl: trainstop,
  iconSize: [50, 50],
});

const endIcon = new L.Icon({
  iconUrl: destination1,
  iconSize: [32, 32],
});

// Component for rendering gradient polyline
const GradientPolyline = ({ route }) => {
  const map = useMap();

  useEffect(() => {
    if (!route || route.length === 0) return;

    const gradientOptions = {
      color: "blue",
      weight: 6,
      opacity: 1.0,
    };

    const gradientPolyline = L.polyline(route, gradientOptions).addTo(map);

    L.polylineDecorator(gradientPolyline, {
      patterns: [
        {
          offset: 0,
          repeat: 10,
          symbol: L.Symbol.dash({
            pixelSize: 8,
            pathOptions: {
              color: "red",
              weight: 6,
              opacity: 0.8,
            },
          }),
        },
      ],
    });

    // Cleanup function to remove the polyline when the component unmounts or rerenders
    return () => {
      map.removeLayer(gradientPolyline);
    };
  }, [map, route]);

  return null;
};

// Train Map Component
const Map = ({ trainRoutes }) => (
  <div className="map-container">
    <MapContainer
      center={[3.139, 101.686]} // Default center
      zoom={12}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {/* Loop through each route and display polyline and markers */}
      {trainRoutes.map((routeData, index) => (
        <React.Fragment key={index}>
          {/* Train Route Polyline */}
          <GradientPolyline route={routeData.route} />
          
          {/* Start and End Points */}
          {routeData.route && routeData.route.length > 0 && (
            <>
              <Marker position={routeData.route[0]} icon={startIcon}>
                <Tooltip>Train Start Point</Tooltip>
              </Marker>
              <Marker position={routeData.route[routeData.route.length - 1]} icon={endIcon}>
                <Tooltip>Train End Point</Tooltip>
              </Marker>
            </>
          )}
          
          {/* Train Stops */}
          {routeData.stops &&
            routeData.stops.map((stop, stopIndex) => (
              <Marker key={stopIndex} position={stop} icon={stopIcon}>
                <Tooltip>Train Stop</Tooltip>
              </Marker>
            ))}
        </React.Fragment>
      ))}
    </MapContainer>
  </div>
);

export default Map;
