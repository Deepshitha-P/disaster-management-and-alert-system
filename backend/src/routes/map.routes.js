// backend/src/routes/map.routes.js
import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/route", async (req, res) => {
  try {
    const { coordinates } = req.body;
    if (!coordinates || coordinates.length !== 2) {
      return res.status(400).json({ message: "Two coordinates required" });
    }

    const orsRes = await axios.post(
      "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
      { coordinates },
      {
        headers: {
          Authorization: process.env.ORS_API_KEY, // 👈 make sure this matches .env
          "Content-Type": "application/json",
        },
      }
    );

    res.json(orsRes.data);
  } catch (err) {
    console.error("ORS error:", err.response?.data || err.message);
    res.status(500).json({ message: "Route fetch failed" });
  }
});

export default router;
