import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "user",
    homeLocation: { latitude: null, longitude: null, address: "" }
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm((prev) => ({
            ...prev,
            homeLocation: {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              address: "" // can fill with reverse geocode if you want
            }
          }));
        },
        () => {
          console.warn("Location access denied");
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!form.homeLocation.latitude || !form.homeLocation.longitude) {
      setError("Please allow location or enter address manually");
      setLoading(false);
      return;
    }

    try {
      await api.post("/auth/register", form);
      navigate("/login");
    } catch (err) {
      console.error(err.response?.data || err);
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-bold">Register</h1>

      <input className="input" placeholder="Name" value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input className="input" type="email" placeholder="Email" value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input className="input" type="password" placeholder="Password" value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <input className="input" placeholder="Phone" value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })} />

      <select className="input" value={form.role}
        onChange={(e) => setForm({ ...form, role: e.target.value })}>
        <option value="user">User</option>
        <option value="volunteer">Volunteer</option>
        <option value="admin">Admin</option>
      </select>

      <button type="button" className="btn-secondary w-full" onClick={getLocation}>
        Use My Current Location
      </button>

      <div>
        <label className="label">Or enter your address</label>
        <input className="input"
          placeholder="123 Main St, City"
          value={form.homeLocation.address}
          onChange={(e) => setForm({
            ...form,
            homeLocation: { ...form.homeLocation, address: e.target.value }
          })}
        />
      </div>

      {isLoaded && (
        <div className="h-64">
          <GoogleMap
            center={form.homeLocation.latitude
              ? { lat: form.homeLocation.latitude, lng: form.homeLocation.longitude }
              : { lat: 20.5937, lng: 78.9629 }}
            zoom={form.homeLocation.latitude ? 14 : 4}
            mapContainerStyle={{ width: "100%", height: "100%" }}
            onClick={(e) =>
              setForm({
                ...form,
                homeLocation: {
                  latitude: e.latLng.lat(),
                  longitude: e.latLng.lng(),
                  address: ""
                }
              })
            }
          >
            {form.homeLocation.latitude && (
              <Marker position={{ lat: form.homeLocation.latitude, lng: form.homeLocation.longitude }} />
            )}
          </GoogleMap>
        </div>
      )}

      <button className="btn-primary w-full" disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </button>
      {error && <p className="text-red-600">{error}</p>}
    </form>
  );
} 