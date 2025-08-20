import mongoose from 'mongoose';
const { Schema } = mongoose;
const FaultSchema = new  Schema({
  elevatorId:  { type: Schema.Types.ObjectId, ref: 'Elevator', required: true, index: true },
  code: { type: String, required: true },
  severity: { type: String, enum: ['INFO','WARN','ERROR','CRITICAL'], default: 'WARN' },
  data: { type: Object, default: {} },
  active: { type: Boolean, default: true },
  ts: { type: Date, default: () => new Date(), index: true }
});

export const Fault = mongoose.model('Fault', FaultSchema);
