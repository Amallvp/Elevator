import { Router } from 'express';
import * as ElevatorController from '../controllers/elevatorController.js';
import { auth, requireRole } from '../middleware/auth.js';

const r = Router();

r.post('/', auth(), requireRole('ADMIN'), ElevatorController.create);
r.get('/', auth(false), ElevatorController.elevatorList);
r.get('/:id', auth(false), ElevatorController.get);
r.get('/:id/status', auth(false), ElevatorController.getStatus);
r.get('/:id/history', auth(false), ElevatorController.getHistory);
r.get ('/:id/live', auth(false), ElevatorController.getLiveOccupancy);
r.post('/:id/move', auth(), requireRole('OPERATOR','TECH','ADMIN'), ElevatorController.moveToFloor);
r.post('/:id/stop', auth(), requireRole('OPERATOR','TECH','ADMIN'), ElevatorController.emergencyStop);
r.post ('/:id/start', auth(), requireRole('OPERATOR','TECH','ADMIN'), ElevatorController.startElevator);
r.post('/:id/door', auth(), requireRole('OPERATOR','TECH','ADMIN'), ElevatorController.doorCommand);
r.put('/:id/settings', auth(), requireRole('OPERATOR','TECH','ADMIN'), ElevatorController.updateSettings);

export default r;