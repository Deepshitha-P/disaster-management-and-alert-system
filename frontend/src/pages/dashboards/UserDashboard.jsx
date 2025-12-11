// src/pages/dashboards/UserDashboard.jsx
import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import api from "../../api/axios";
import { io } from "socket.io-client";
import L from "leaflet";

// ---------------------- ICONS ----------------------
const userIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  iconSize: [32, 32],
});
const hospitalIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
  iconSize: [32, 32],
});
const schoolIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/purple-dot.png",
  iconSize: [32, 32],
});
const shelterIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
  iconSize: [32, 32],
});
const getSeverityIcon = (severity) =>
  L.icon({
    iconUrl:
      severity === "high"
        ? "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
        : severity === "medium"
        ? "https://maps.google.com/mapfiles/ms/icons/orange-dot.png"
        : "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

// ---------------------- MAP HELPER ----------------------
function FitBounds({ markers }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers, map]);
  return null;
}

// ---------------------- MAIN COMPONENT ----------------------
export default function UserDashboard() {
  const [userLocation, setUserLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [sosForm, setSosForm] = useState({
    name: "",
    phone: "",
    peopleCount: 1,
    helpType: "",
    issue: "",
  });
  const [message, setMessage] = useState("");
  const [mySOS, setMySOS] = useState(null);

  // 📍 Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        (err) => console.warn("Location denied:", err)
      );
    }
  }, []);

  // 🌍 Socket listener for disasters
  useEffect(() => {
    const socket = io("http://localhost:5000");
    socket.on("disaster:new", (disaster) => {
      setDisasters((prev) => [...prev, disaster]);
    });
    socket.on("disaster:update", (updated) => {
      setDisasters((prev) =>
        prev.map((d) => (d._id === updated.id ? { ...d, ...updated } : d))
      );
    });
    return () => socket.disconnect();
  }, []);

  // 🌍 Fetch disasters near user
  useEffect(() => {
    const fetchDisasters = async () => {
      if (!userLocation) return;
      try {
        const backendRes = await api.get(
          `/disasters/active?lng=${userLocation.lng}&lat=${userLocation.lat}&within=20000`
        );
        setDisasters(backendRes.data);
      } catch (err) {
        console.error("Failed to fetch disasters:", err);
      }
    };
    fetchDisasters();
  }, [userLocation]);

  // 🏥 Fetch nearby places
  const fetchPlaces = async (query, type) => {
    if (!userLocation) return;
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=20&bounded=1&viewbox=${
        userLocation.lng - 0.02
      },${userLocation.lat + 0.02},${userLocation.lng + 0.02},${
        userLocation.lat - 0.02
      }`;
      const res = await axios.get(url, {
        headers: { "Accept-Language": "en", "User-Agent": "RescueLink-App" },
      });
      const found = res.data.map((p) => ({
        name: p.display_name,
        lat: parseFloat(p.lat),
        lng: parseFloat(p.lon),
        type,
      }));
      setPlaces(found);
    } catch (err) {
      console.error("Failed to fetch places:", err);
    }
  };

  // ➡️ Fetch route (via backend proxy to ORS)
  const fetchRoute = async (dest) => {
    if (!userLocation) return;
    try {
      const res = await api.post("/map/route", {
        coordinates: [
          [userLocation.lng, userLocation.lat],
          [dest.lng, dest.lat],
        ],
      });
      const coords = res.data.features[0].geometry.coordinates.map((c) => [
        c[1],
        c[0],
      ]);
      setSelectedRoute({ coords });
    } catch (err) {
      console.error("Failed to fetch route:", err);
    }
  };

  // 🚨 Submit SOS
  const sendSOS = async (e) => {
    e.preventDefault();
    if (!userLocation) {
      setMessage("⚠️ Location not available");
      return;
    }
    try {
      const payload = {
        details: { ...sosForm },
        coordinates: [userLocation.lng, userLocation.lat],
        address: "Current Location",
      };
      await api.post("/sos", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setMessage("✅ SOS sent successfully!");
      setSosForm({ name: "", phone: "", peopleCount: 1, helpType: "", issue: "" });
    } catch (err) {
      console.error("❌ SOS error:", err.response?.data || err.message);
      setMessage("❌ Failed to send SOS");
    }
  };

  // 🔄 Poll SOS status every 10s
  useEffect(() => {
    const fetchMySOS = async () => {
      try {
        const { data } = await api.get("/sos/mine", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (data.length > 0) setMySOS(data[data.length - 1]);
      } catch (err) {
        console.error("Failed to fetch my SOS:", err);
      }
    };
    fetchMySOS();
    const interval = setInterval(fetchMySOS, 10000);
    return () => clearInterval(interval);
  }, []);

  // ---------------------- RENDER ----------------------
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">🌍 RescueLink Dashboard</h1>
      </header>

      {/* Map */}
      <div className="rounded-xl overflow-hidden shadow-lg mb-6">
        {userLocation && (
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={15}
            style={{ height: "400px", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            {/* User */}
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup>📍 You are here</Popup>
            </Marker>

            {/* Places */}
            {places.map((p, idx) => (
              <Marker
                key={idx}
                position={[p.lat, p.lng]}
                icon={
                  p.type === "hospital"
                    ? hospitalIcon
                    : p.type === "school"
                    ? schoolIcon
                    : shelterIcon
                }
                eventHandlers={{
                  click: () => {
                    setSelectedRoute(null);
                    fetchRoute(p);
                  },
                }}
              >
                <Popup>
                  <strong>{p.type.toUpperCase()}</strong>
                  <br />
                  {p.name}
                </Popup>
              </Marker>
            ))}

            {/* Disasters */}
            {disasters.map((d, idx) =>
              d.location?.coordinates ? (
                <Marker
                  key={d._id || idx}
                  position={[d.location.coordinates[1], d.location.coordinates[0]]}
                  icon={getSeverityIcon(d.severity)}
                >
                  <Popup>
                    <b>🚨 {d.type.toUpperCase()}</b>
                    <br />
                    {d.description}
                    <br />
                    Severity: {d.severity}
                    <br />
                    Radius: {d.radius / 1000} km
                  </Popup>
                </Marker>
              ) : null
            )}

            {/* Route */}
            {selectedRoute && (
              <Polyline positions={selectedRoute.coords} color="blue" weight={5} />
            )}

            <FitBounds markers={[userLocation, ...places]} />
          </MapContainer>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-4">
        <button
          onClick={() => fetchPlaces("hospital", "hospital")}
          className="px-6 py-2 bg-blue-600 text-white rounded-xl"
        >
          🏥 Nearby Hospitals
        </button>
        <button
          onClick={() => fetchPlaces("school", "school")}
          className="px-6 py-2 bg-green-600 text-white rounded-xl"
        >
          🏫 Nearby Schools
        </button>
        <button
          onClick={() => fetchPlaces("shelter", "shelter")}
          className="px-6 py-2 bg-purple-600 text-white rounded-xl"
        >
          🛡 Safe Shelters
        </button>
      </div>

      {/* SOS Form */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">🚨 Send SOS</h2>
        <form onSubmit={sendSOS} className="space-y-3">
          <input
            className="w-full p-2 border rounded"
            placeholder="Your Name"
            value={sosForm.name}
            onChange={(e) => setSosForm({ ...sosForm, name: e.target.value })}
          />
          <input
            className="w-full p-2 border rounded"
            placeholder="Phone Number"
            value={sosForm.phone}
            onChange={(e) => setSosForm({ ...sosForm, phone: e.target.value })}
          />
          <input
            type="number"
            min="1"
            className="w-full p-2 border rounded"
            placeholder="Number of People"
            value={sosForm.peopleCount}
            onChange={(e) =>
              setSosForm({ ...sosForm, peopleCount: e.target.value })
            }
          />
          <select
            className="w-full p-2 border rounded"
            value={sosForm.helpType}
            onChange={(e) => setSosForm({ ...sosForm, helpType: e.target.value })}
          >
            <option value="">Select Help Type</option>
            <option value="Medical">Medical</option>
            <option value="Food">Food</option>
            <option value="Evacuation">Evacuation</option>
          </select>
          <textarea
            className="w-full p-2 border rounded"
            placeholder="Describe the issue"
            value={sosForm.issue}
            onChange={(e) => setSosForm({ ...sosForm, issue: e.target.value })}
          />
          <button
            type="submit"
            className="bg-red-600 text-white px-4 py-2 rounded-lg w-full"
          >
            Submit SOS
          </button>
        </form>
        {message && <p className="mt-2 text-center">{message}</p>}
      </div>

      {/* SOS Status */}
      {mySOS && (
        <div className="mt-4 bg-gray-100 p-4 rounded shadow">
          <h3 className="font-bold">📌 Your SOS Status</h3>
          <p>
            Status:{" "}
            <span className="text-blue-600 font-semibold">{mySOS.status}</span>
          </p>
          {mySOS.volunteer && (
            <div className="mt-2 p-2 border rounded bg-white">
              <p className="font-semibold">👨‍🚒 Volunteer Assigned</p>
              <p>Name: {mySOS.volunteer.name}</p>
              <p>Phone: {mySOS.volunteer.phone}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
