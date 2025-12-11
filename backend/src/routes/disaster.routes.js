// routes/disaster.routes.js
import express from "express";
import Disaster from "../models/Disaster.js";
import { auth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";

const router = express.Router();

/**
 * Admin creates or updates a disaster alert
 */
router.post("/", auth, allowRoles("admin"), async (req, res) => {
  try {
    const { type, description, coordinates, address, radius = 10000, severity = "medium", active = true } = req.body;
    if (!coordinates || coordinates.length !== 2) {
      return res.status(400).json({ message: "coordinates [lng, lat] required" });
    }

    const disaster = await Disaster.create({
      type, description,
      location: { type: "Point", coordinates, address },
      radius, severity, source: "admin", active
    });

    // 🔔 push to clients (broadcast; clients filter by distance)
    const io = req.app.get("io");
if (io) {
  io.emit("disaster:new", {
    id: disaster._id,
    type, description, radius, severity, active,
    location: { coordinates, address },
    createdAt: disaster.createdAt,
  });
}


    res.status(201).json(disaster);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Public: active disasters near a point
 * GET /api/disasters/active?lng=...&lat=...&within=10000
 */
router.get("/active", async (req, res) => {
  try {
    const { lng, lat, within = 20000 } = req.query;
    if (!lng || !lat) return res.status(400).json({ message: "lng & lat required" });

    const list = await Disaster.find({
      active: true,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(within)
        }
      }
    }).sort({ createdAt: -1 });

    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Admin: toggle or update active/severity/etc.
 */
router.patch("/:id", auth, allowRoles("admin"), async (req, res) => {
  try {
    const updated = await Disaster.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Not found" });
    req.io.emit("disaster:update", { id: updated._id, ...req.body });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
