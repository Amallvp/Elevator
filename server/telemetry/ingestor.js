import { Elevator } from '../models/elevator.js';
import { Telemetry } from '../models/Telemetry.js';
import { Trip } from '../models/trip.js';
import { emitToElevator } from '../config/socket.js';

export const TelemetryIngestor = {
  async fromMqtt(topic, payload) {
    // topic example: elevator/ELEV-001/telemetry
    const parts = String(topic).split('/');
    const elevatorId = parts[1];
    return this.ingest(elevatorId, payload);
  },
  async ingest(elevatorId, d) {
    // 1) Store time-series row (DB-first, regardless of user connections)
    const row = await Telemetry.create({ elevatorId, ...d, ts: d.ts ? new Date(d.ts) : new Date() });

    // 2) Update elevator status snapshot (for fast UI reads)
    const snapshot = {
      'status.position_m_above_pit': d.position_m_above_pit,
      'status.floor_index': d.floor_index,
      'status.velocity_mps': d.velocity_mps,
      'status.acceleration_mps2': d.acceleration_mps2,
      'status.travel_direction': d.travel_direction,
      'status.door_state': d.door_state,
      'status.occupancy_count': d.occupancy_count,
      'status.load_kg': d.load_kg,
      'status.overload': d.overload,
      'status.motor_temp_C': d.motor_temp_C,
      'status.vfd_state': d.vfd_state,
      'status.energy_kWh_total': d.energy_kWh_total,
      'status.ui.car_indicator_floor': d.floor_index
    };
    await Elevator.updateOne({ elevatorId }, { $set: snapshot }, { upsert: true });

    // 3) Emit real-time event
    emitToElevator(elevatorId, 'telemetry:update', { elevatorId, ts: row.ts, ...d });

    // 4) Trip detection (simple example)
    await this._tripDetector(elevatorId, d);
  },
  async _tripDetector(elevatorId, d) {
    // Start a trip on door close + motion; end on door open + idle
    const moving = d.travel_direction === 'UP' || d.travel_direction === 'DOWN';
    const idle = d.travel_direction === 'IDLE';
    const doorClosed = d.door_state === 'CLOSED';
    const doorOpen = d.door_state === 'OPEN';

    const active = await Trip.findOne({ elevatorId, end_ts: { $exists: false } }).sort({ start_ts: -1 });
    if (!active && moving && doorClosed) {
      await Trip.create({ elevatorId, start_ts: new Date(), stops: [d.floor_index] });
      return;
    }
    if (active) {
      // Update last stop when floor changes
      const lastStop = active.stops[active.stops.length - 1];
      if (typeof d.floor_index === 'number' && d.floor_index !== lastStop) {
        active.stops.push(d.floor_index);
      }
      // End conditions
      if (idle && doorOpen) {
        active.end_ts = new Date();
        active.travel_time_ms = active.end_ts - active.start_ts;
        await active.save();
        emitToElevator(elevatorId, 'trip:completed', { tripId: active._id, elevatorId });
      } else {
        await active.save();
      }
    }
  }
};
