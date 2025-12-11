import mongoose from 'mongoose';

const SOSSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  details: {
    peopleCount: { type: Number, default: 1 },
    issue: { type: String },
    helpType: { type: String }, // food, medical, evacuation, etc.
    phone: { type: String },
    name: { type: String }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: { type: [Number], required: true }, // [lng, lat]
    address: { type: String }
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'rescued', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

SOSSchema.index({ location: '2dsphere' });

export default mongoose.model('SOS', SOSSchema);
