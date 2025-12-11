// models/Disaster.js
import mongoose from "mongoose";

const DisasterSchema = new mongoose.Schema({
  type: { type: String, enum: ["flood","earthquake","cyclone","fire","other"], required: true },
  description: { type: String },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true }, // [lng, lat]
    address: String,
  },
  radius: { type: Number, default: 10000 }, // meters
  severity: { type: String, enum: ["low","medium","high"], default: "medium" },
  source: { type: String, enum: ["admin","api"], default: "admin" },
  externalId: { type: String }, // id from GDACS/USGS/OpenWeather (for de-dupe)
  active: { type: Boolean, default: true },
}, { timestamps: true });

DisasterSchema.index({ location: "2dsphere" });

export default mongoose.model("Disaster", DisasterSchema);
