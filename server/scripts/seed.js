import dotenv from "dotenv";
dotenv.config();
import { connectMongo } from "../config/db.js";
import { Elevator } from "../models/elevator.js";
import { TelemetryIngestor } from "../telemetry/ingestor.js";

await connectMongo();

const elevatorId = "ELEV-001";
await Elevator.updateOne(
  { elevatorId },
  {
    $set: {
      elevatorId,
      building: {
        buildingId: "BLDG-01",
        address: "123 Main St",
        geolocation: { lat: 10, lon: 76, alt: 10 },
        floors_total: 12,
        floor_heights_m: Array.from({ length: 12 }, () => 3.2),
      },
      shaft: { height_m: 40, pit_depth_m: 2, top_clearance_m: 3 },
      status: {
        floor_index: 0,
        door_state: "OPEN",
        travel_direction: "IDLE",
        occupancy_count: 0,
        load_kg: 0,
        energy_kWh_total: 0,
      },
    },
  },
  { upsert: true }
);

console.log("[seed] elevator created");

let floor = 0,
  dir = 1;
setInterval(async () => {
  // simulate motion between 0 and 11
  if (floor === 11) dir = -1;
  if (floor === 0) dir = 1;
  const travel_direction = dir === 1 ? "UP" : "DOWN";
  const door_state = "CLOSED";
  const velocity_mps = 1.5;
  floor += dir * (Math.random() > 0.7 ? 1 : 0);
  const d = {
    floor_index: floor,
    position_m_above_pit: floor * 3.2,
    velocity_mps,
    acceleration_mps2: 0.5,
    door_state,
    travel_direction,
    occupancy_count: Math.floor(Math.random() * 6),
    load_kg: Math.floor(Math.random() * 400),
    overload: false,
    motor_temp_C: 50 + Math.random() * 10,
    vfd_state: "RUN",
    energy_kWh_total: Math.random() * 100,
    safety: {
      e_stop: false,
      door_interlock_ok: true,
      overspeed_trip: false,
      brake_status: "RELEASED",
    },
  };
  await TelemetryIngestor.ingest(elevatorId, d);
}, 1000);
