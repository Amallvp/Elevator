
import { Audit } from "../models/audit.js";
import { emitToElevator } from "../config/socket.js";

export async function auditLog({ action, elevatorId, payload = {}, user = null }) {
  const entry = await Audit.create({
    action,
    elevatorId,
    payload,
    uid: user?.uid,
    email: user?.email,
    role: user?.role,
    ts: new Date()
  });
  try {
    emitToElevator(elevatorId || "GLOBAL", "audit:new", {
      _id: entry._id,
      action,
      elevatorId,
      payload,
      uid: entry.uid,
      email: entry.email,
      role: entry.role,
      ts: entry.ts
    });
  } catch (_) {}
  return entry;
}
