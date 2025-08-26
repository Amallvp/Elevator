import mongoose from "mongoose";
const { Schema } = mongoose;

const ElevatorSchema = new Schema({
  elevatorId: { type: String, unique: true },  // not required, auto-generated if missing
  building: {
    buildingId: String,
    address: String,
    geolocation: { lat: Number, lon: Number, alt: Number },
    floors_total: Number,
    floor_heights_m: { type: [Number], default: [] }
  },
  shaft: {
    height_m: Number,
    pit_depth_m: Number,
    top_clearance_m: Number,
    ventilation_rate_m3h: Number // RC in sim only
  },
  // Live status snapshot (quick read for UI)
  status: {
    position_m_above_pit: Number, 
    floor_index: Number,          
    velocity_mps: Number,         
    acceleration_mps2: Number,    
    travel_direction: { type: String, enum: ['UP','DOWN','IDLE'], default: 'IDLE' },
    mode: { type: String, enum: ['NORMAL','IN_SERVICE','INSPECTION','FIRE_SERVICE','EMERGENCY_POWER','INDEPENDENT','MAINTENANCE','OUT_OF_SERVICE'], default: 'NORMAL' },
    door_state: { type: String, enum: ['OPEN','CLOSING','CLOSED','OPENING','OBSTRUCTED'], default: 'CLOSED' },
    occupancy_count: { type: Number, default: 0 },
    load_kg: { type: Number, default: 0 },
    overload_Kg : { type: Number, default: 0 },
    overload: { type: Boolean, default: false },
    motor_temp_C: Number,
    vfd_state: { type: String, enum: ['READY','RUN','FAULT','TRIP'], default: 'READY' },
    energy_kWh_total: { type: Number, default: 0 },
    ui: {
      car_indicator_floor: Number,
      direction_arrow: { type: String, enum: ['UP','DOWN','OFF'], default: 'OFF' }
    }
  },
  // Tunable settings (RC)
  settings: {
    setpoints: {
      speed_mps: { type: Number, default: 1.5 },
      accel_mps2: { type: Number, default: 1.0 },
      stopping_profile: { type: String, enum: ['COMFORT','FAST','ENERGY_SAVE'], default: 'COMFORT' }
    },
    doors: {
      hold_open_ms: { type: Number, default: 2500 },
      speed_pct: { type: Number, default: 100 },
      reopen_sensitivity_pct: { type: Number, default: 50 },
      nudge_mode: { type: Boolean, default: false }
    },
    ui: {
      display_message: { type: String, default: '' },
      lighting_level_pct: { type: Number, default: 80 },
      fan_speed_pct: { type: Number, default: 50 }
    },
    power_mode: { type: String, enum: ['NORMAL','LIMITED','ECO'], default: 'NORMAL' }
  },
  usage: {
    cycle_count: { type: Number, default: 0 },
    rope_runtime_hours: { type: Number, default: 0 },
    wear: {
      traction_rope_pct: Number,
      brake_lining_pct: Number
    }
  },
  comms: {
    ipv4: String,
    ipv6: String,
    rssi_dBm: Number,
    latency_ms: Number
  }
}, { timestamps: true });

// Index for faster queries
// ElevatorSchema.index({ elevatorId: 1 });

/**
 * Auto-generate elevatorId like ELEV-001, ELEV-002, ...
 */
ElevatorSchema.pre("save", async function (next) {
  if (!this.elevatorId) {
    const count = await mongoose.model("Elevator").countDocuments();
    this.elevatorId = `ELEV-${String(count + 1).padStart(3, "0")}`;
  }
  next();
});

export const Elevator = mongoose.model("Elevator", ElevatorSchema);
