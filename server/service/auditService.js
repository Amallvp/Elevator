import { Audit } from "../models/audit.js";

export const AuditService = {
  async getAuditLog(elevatorId) {
    return Audit.find({ elevatorId }).sort({ ts: -1 }).limit(1000);
  },
};
