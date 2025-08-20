import mongoose from 'mongoose';

const AuditSchema = new mongoose.Schema({
  ts: { type: Date, default: () => new Date(), index: true },
  uid: { type: String },
  email: { type: String },
  role: { type: String },
  action: { type: String, required: true }, // e.g., COMMAND_ISSUED, MODE_CHANGED
  elevatorId: { type: String },
  payload: { type: Object, default: {} }
});

export const Audit = mongoose.model('Audit', AuditSchema);
