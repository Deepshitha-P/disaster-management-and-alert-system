import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import axios from "axios";
import api from "../../api/axios";

export default function AdminDashboard() {
  const [form, setForm] = useState({
    type: "fire",
    severity: "medium",
    description: "",
    lat: null,
    lng: null,
    address: ""
  });

  // When admin clicks map, update lat/lng + fetch address
  function LocationPicker() {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        setForm({ ...form, lat, lng });

        // Reverse geocode to get human-readable address
        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          setForm((f) => ({ ...f, address: res.data.display_name }));
        } catch {
          setForm((f) => ({ ...f, address: "" }));
        }
      },
    });
    return form.lat && form.lng ? (
      <Marker position={[form.lat, form.lng]} />
    ) : null;
  }

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        type: form.type,
        description: form.description,
        coordinates: [form.lng, form.lat], // [lng, lat] order
        address: form.address,
        severity: form.severity,
      };
      await api.post("/disasters", payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("✅ Disaster posted successfully");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to post disaster");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Admin Dashboard - Post Disaster</h1>

      {/* Map */}
      <MapContainer
        center={[13.0827, 80.2707]} // Chennai default
        zoom={12}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationPicker />
      </MapContainer>

      {/* Form */}
      <form onSubmit={submit} className="mt-4 space-y-3">
        <select
          className="w-full p-2 border rounded"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="fire">🔥 Fire</option>
          <option value="flood">🌊 Flood</option>
          <option value="earthquake">🌎 Earthquake</option>
          <option value="cyclone">🌪 Cyclone</option>
          <option value="other">❓ Other</option>
        </select>

        <textarea
          className="w-full p-2 border rounded"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <select
          className="w-full p-2 border rounded"
          value={form.severity}
          onChange={(e) => setForm({ ...form, severity: e.target.value })}
        >
          <option value="low">🟢 Low</option>
          <option value="medium">🟠 Medium</option>
          <option value="high">🔴 High</option>
        </select>

        <input
          className="w-full p-2 border rounded"
          placeholder="Address (auto-filled, but can edit)"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />

        <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded w-full">
          🚨 Post Disaster
        </button>
      </form>
    </div>
  );
}
