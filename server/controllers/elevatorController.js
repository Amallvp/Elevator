import { Elevator } from "../models/elevator.js";
import { Telemetry } from "../models/Telemetry.js";
import { CommandService } from "../service/commandService.js";
import createError from "http-errors";

export async function create(req, res, next) {
  try {
    const { elevatorId, building, shaft, settings, comms } = req.body;

    // 1. Create elevator
    const elevator = await Elevator.create({
      elevatorId, // "ELEV-001" or auto-generated
      building,
      shaft,
      settings,
      comms,
    });

    // 2. Create initial telemetry linked by elevatorId (string)
    const telemetry = await Telemetry.create({
      elevatorId: elevator.elevatorId, // 🔑 use string, not _id
      floor_index: 0,
      position_m_above_pit: 0,
      velocity_mps: 0,
      acceleration_mps2: 0,
      door_state: "CLOSED",
      travel_direction: "IDLE",
      occupancy_count: 0,
      load_kg: 0,
      overload: false,
      motor_temp_C: 25,
      vfd_state: "READY",
      energy_kWh_total: 0,
      power_demand_kW: 0,
      safety: {
        e_stop: false,
        door_interlock_ok: true,
        overspeed_trip: false,
        brake_status: "APPLIED",
      },
    });

    res.status(201).json({ elevator, telemetry });
  } catch (e) {
    if (e.code === 11000) {
      return next(createError(409, "Elevator ID already exists"));
    }
    next(e);
  }
}
export async function elevatorList(req, res, next) {
  try {
    const rows = await Elevator.find(
      {},
      {
        elevatorId: 1,
        "status.floor_index": 1,
        "status.door_state": 1,
        "status.travel_direction": 1,
        "status.occupancy_count": 1,
        updatedAt: 1,
      }
    ).sort({ elevatorId: 1 });
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

export async function get(req, res, next) {
  try {
    const row = await Elevator.findOne({ elevatorId: req.params.id });
    if (!row) return next(createError(404, "Elevator not found"));
    res.json(row);
  } catch (e) {
    next(e);
  }
}

export async function getStatus(req, res, next) {
  try {
    const row = await Elevator.findOne(
      { elevatorId: req.params.id },
      { status: 1, settings: 1, usage: 1, building: 1, shaft: 1 }
    );

    console.log("Elevator status fetched:", row);
    if (!row) return next(createError(404, "Elevator not found"));
    res.json(row);
  } catch (e) {
    next(e);
  }
}

export async function getHistory(req, res, next) {
  try {
    const { from, to, limit = 500 } = req.query;
    const q = { elevatorId: req.params.id };
    if (from || to) q.ts = {};
    if (from) q.ts.$gte = new Date(from);
    if (to) q.ts.$lte = new Date(to);
    const rows = await Telemetry.find(q).sort({ ts: -1 }).limit(Number(limit));
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

export async function getLiveOccupancy(req, res, next) {
  try {
    const row = await Elevator.findOne(
      { elevatorId: req.params.id },
      {
        "status.floor_index": 1,
        "status.occupancy_count": 1,
        "status.load_kg": 1,
      }
    ).lean();

    if (!row) return next(createError(404, "Elevator not found"));

    res.json({
      elevatorId: req.params.id,
      floor: row.status.floor_index,
      occupancy: row.status.occupancy_count,
    });
  } catch (e) {
    next(e);
  }
}

export async function moveToFloor(req, res, next) {
  try {
    const { targetFloor,occupancy_count } = req.body;
    if (typeof targetFloor !== "number")
      return next(createError(400, "targetFloor required"));
    const user = {
      uid: req.user.uid,
      email: req.user.email,
      role: req.user.role,
    };
    const result = await CommandService.moveToFloor(
      req.params.id,
      targetFloor,
      occupancy_count,
      user
    );
    let response = {
      Accepted: result.Accepted,
      MESSAGE: `Elevator moved to floor ${targetFloor}`,
    };

    res.json(response);
  } catch (e) {
    next(e);
  }
}

export async function emergencyStop(req, res, next) {
  try {
    const user = {
      uid: req.user.uid,
      email: req.user.email,
      role: req.user.role,
    };
    const result = await CommandService.emergencyStop(req.params.id, user);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function startElevator(req, res, next) {
  try {
    const user = {
      uid: req.user.uid,
      email: req.user.email,
      role: req.user.role,
    };
    const result = await CommandService.startElevator(req.params.id, user);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function doorCommand(req, res, next) {
  try {
    const { action } = req.body; // 'open' | 'close'
    const user = {
      uid: req.user.uid,
      email: req.user.email,
      role: req.user.role,
    };
    const result = await CommandService.doorCommand(
      req.params.id,
      action.toLowerCase(),
      user
    );
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function updateSettings(req, res, next) {
  try {
    const patch = req.body;
    const user = {
      uid: req.user.uid,
      email: req.user.email,
      role: req.user.role,
    };
    const result = await CommandService.updateSettings(
      req.params.id,
      patch,
      user
    );
    res.json(result);
  } catch (e) {
    next(e);
  }
}
