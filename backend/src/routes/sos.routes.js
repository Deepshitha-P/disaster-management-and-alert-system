import express from 'express';
import SOS from '../models/SOS.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { allowRoles } from '../middleware/roles.js';

const router = express.Router();

// Create SOS (user)
router.post('/', auth, allowRoles('user'), async (req, res) => {
  try {
    const { coordinates, address, details } = req.body;
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({ message: 'coordinates [lng, lat] required' });
    }

    const sos = await SOS.create({
      
      user: req.user.id,
      details,
      location: { type: 'Point', coordinates, address }
    });

    // TODO: push notification to nearby volunteers (later)
    res.status(201).json(sos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get nearby SOS for volunteers (within X meters, default 10000 = 10km)
router.get('/nearby', auth, allowRoles('volunteer', 'admin'), async (req, res) => {
  try {
    const { lng, lat, within } = req.query;
    if (!lng || !lat) return res.status(400).json({ message: 'lng & lat required' });
    const radius = Number(within || 10000);

    const sosList = await SOS.find({
      status: { $in: ['pending', 'accepted', 'in_progress'] },
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
          $maxDistance: radius
        }
      }
    }).populate('user', 'name phone');

    res.json(sosList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Volunteer accepts an SOS
router.patch('/:id/accept', auth, allowRoles('volunteer', 'admin'), async (req, res) => {
  try {
    const updated = await SOS.findByIdAndUpdate(req.params.id, { volunteer: req.user.id, status: 'accepted' }, { new: true });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update SOS status (volunteer/admin)
router.patch('/:id/status', auth, allowRoles('volunteer', 'admin'), async (req, res) => {
  try {
    const { status } = req.body; // accepted | in_progress | rescued | cancelled
    const allowed = ['accepted', 'in_progress', 'rescued', 'cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'invalid status' });

    const updated = await SOS.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get("/mine", auth, allowRoles("user"), async (req, res) => {
  try {
    const sosList = await SOS.find({ user: req.user.id })
      .populate("volunteer", "name email phone"); // show assigned volunteer details

    res.json(sosList);
  } catch (err) {
    console.error("Error fetching user SOS:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
