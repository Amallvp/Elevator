import { Elevator } from "../models/elevator.js";
import { Fault } from "../models/faults.js";

export async function listFaults(req, res, next) {
  try {
    const { elevatorId } = req.query;
    const q = elevatorId ? { elevatorId, active: true } : { active: true };
    const rows = await Fault.find(q).sort({ ts: -1 }).limit(200);
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

export async function setMaintenanceMode(req, res, next) {
  try {
    const { elevatorId, mode } = req.body; // e.g., 'MAINTENANCE' / 'NORMAL'
    await Elevator.updateOne({ elevatorId }, { $set: { "status.mode": mode } });
    res.json({ updated: true });
  } catch (e) {
    next(e);
  }
}
