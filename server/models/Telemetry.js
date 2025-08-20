import mongoose from "mongoose";
const { Schema } = mongoose;   // <-- you need this line

const TelemetrySchema = new Schema({
  elevatorId: { type: String, ref: "Elevator", required: true, index: true },
  ts: { type: Date, default: () => new Date(), index: true },

  // Core sampled signals (RO)
  position_m_above_pit: Number,
  floor_index: Number,
  velocity_mps: Number,
  acceleration_mps2: Number,
  door_state: { type: String, enum: ["OPEN","CLOSING","CLOSED","OPENING","OBSTRUCTED"] },
  travel_direction: { type: String, enum: ["UP","DOWN","IDLE"] },
  occupancy_count: Number,
  load_kg: Number,
  overload: Boolean,
  motor_temp_C: Number,
  vfd_state: { type: String, enum: ["READY","RUN","FAULT","TRIP"] },
  energy_kWh_total: Number,
  power_demand_kW: Number,

  // Safety references (RO)
  safety: {
    e_stop: Boolean,
    door_interlock_ok: Boolean,
    overspeed_trip: Boolean,
    brake_status: { type: String, enum: ["APPLIED","RELEASING","RELEASED"] }
  }
}, { timestamps: false });

TelemetrySchema.index({ elevator: 1, ts: -1 });

export const Telemetry = mongoose.model("Telemetry", TelemetrySchema);
