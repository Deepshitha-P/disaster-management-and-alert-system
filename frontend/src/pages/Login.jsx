import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../state/AuthContext";

export default function Login() {
  const nav = useNavigate();
  const { setToken, setUser } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    let currentLocation = null;
    if ("geolocation" in navigator) {
      try {
        const pos = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject)
        );
        currentLocation = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
      } catch {
        console.warn("User denied geolocation.");
      }
    }

    try {
      const { data } = await api.post("/auth/login", { ...form, currentLocation });

      // ✅ Save token to localStorage so it persists
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ Update AuthContext
      setToken(data.token);
      setUser(data.user);

      // Redirect to role-based dashboard
      nav(`/dashboard/${data.user.role}`);
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <h1 className="text-2xl font-semibold mb-1">Welcome back</h1>
        <form onSubmit={submit} className="space-y-3">
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {error && <p className="text-danger text-sm">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="text-sm text-gray-600 mt-4">
          New here?{" "}
          <Link to="/register" className="text-brand-700 font-medium">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
