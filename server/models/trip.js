import mongoose from "mongoose";
const { Schema } = mongoose;   // ✅ this line fixes the error

const TripSchema = new Schema({
 elevatorId: { type: String, ref: "Elevator", required: true, index: true },
  start_ts: { type: Date, required: true },
  end_ts: { type: Date },
  stops: { type: [Number], default: [] },
  passengers_in: { type: Number, default: 0 },
  passengers_out: { type: Number, default: 0 },
  energy_kWh: { type: Number, default: 0 },
  max_speed_mps: Number,
  max_accel_mps2: Number,
  max_jerk_mps3: Number,
  wait_time_ms: Number,
  travel_time_ms: Number,
  door_dwell_ms: Number
}, { timestamps: true });

export const Trip = mongoose.model("Trip", TripSchema);
