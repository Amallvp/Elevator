import { Trip } from '../models/trip.js';
import createError from 'http-errors';

export async function list(req, res, next) {
  try {
    const { elevatorId, limit = 50 } = req.query;
    const q = elevatorId ? { elevatorId } : {};
    const rows = await Trip.find(q).sort({ start_ts: -1 }).limit(Number(limit));
    res.json(rows);
  } catch (e) { next(e); }
}

export async function get(req, res, next) {
  try {
    const row = await Trip.findById(req.params.id);
    if (!row) return next(createError(404, 'Trip not found'));
    res.json(row);
  } catch (e) { next(e); }
}
