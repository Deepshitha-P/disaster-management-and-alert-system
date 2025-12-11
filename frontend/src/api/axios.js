// src/api/axios.js
import axios from "axios";

/**
 * Prefer configuring baseURL from .env
 * Example in frontend/.env:
 *   VITE_API_BASE_URL=http://localhost:5000/api
 * If not set, we fall back to localhost:5000/api.
 */
const baseURL =
  import.meta?.env?.VITE_API_BASE_URL?.trim() ||
  "http://localhost:5000/api";

const api = axios.create({ baseURL });

// Attach token if present (won't crash if localStorage missing)
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

// Centralized error logging (prevents unhandled rejections from crashing UI)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Useful debug in DevTools if a request fails
    console.error(
      "[API ERROR]",
      error?.response?.status,
      error?.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

export default api;
