// src/jobs/fetchDisasters.js
import axios from "axios";
import Disaster from "../models/Disaster.js";

/**
 * Fetch disasters from external APIs (OpenWeather, GDACS, USGS, etc.)
 * and store in MongoDB.
 */
export async function fetchDisasters() {
  try {
    console.log("🌍 Running disaster fetch job...");

    // === 1. OpenWeather (One Call 3.0) for severe weather ===
    const weatherRes = await axios.get(
      `https://api.openweathermap.org/data/3.0/onecall`,
      {
        params: {
          lat: 13.0827, // Example: Chennai
          lon: 80.2707,
          appid: process.env.OPENWEATHER_KEY,
        },
      }
    );

    if (weatherRes.data?.alerts?.length) {
      for (const alert of weatherRes.data.alerts) {
        await Disaster.create({
          type: "weather",
          severity: "high",
          description: alert.description || alert.event,
          source: "openweather",
          zone: {
            latitude: 13.0827,
            longitude: 80.2707,
            radiusKm: 50,
          },
          status: "active",
          startsAt: new Date(alert.start * 1000),
        });
      }
    }

    // === 2. GDACS (Global Disaster Alert) ===
    const gdacsRes = await axios.get(
      `https://www.gdacs.org/xml/rss.xml` // GDACS feed
    );
    // TODO: parse XML with xml2js (can integrate later)

    // === 3. USGS Earthquake feed ===
    const usgsRes = await axios.get(
      `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_hour.geojson`
    );
    if (usgsRes.data?.features?.length) {
      for (const eq of usgsRes.data.features) {
        await Disaster.create({
          type: "earthquake",
          severity: "high",
          description: eq.properties.title,
          source: "usgs",
          zone: {
            latitude: eq.geometry.coordinates[1],
            longitude: eq.geometry.coordinates[0],
            radiusKm: 100,
          },
          status: "active",
          startsAt: new Date(eq.properties.time),
        });
      }
    }

    console.log("✅ Disaster job completed");
  } catch (err) {
    console.error("🔥 Disaster fetch failed:", err.message);
  }
}
