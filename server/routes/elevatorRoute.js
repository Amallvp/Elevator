import { Router } from 'express';
import * as ElevatorController from '../controllers/elevatorController.js';
import { auth, requireRole } from '../middleware/auth.js';

const r = Router();

r.post('/', auth(), requireRole('ADMIN'), ElevatorController.create);
r.get('/', auth(), ElevatorController.elevatorList);
r.get('/:id', auth(), ElevatorController.get);
r.get('/:id/history', auth(), ElevatorController.getHistory);
r.get ('/:id/live', auth(), ElevatorController.getLiveOccupancy);
r.post('/:id/move', auth(), requireRole('OPERATOR','TECH','ADMIN'), ElevatorController.moveToFloor);
r.post('/:id/stop', auth(), requireRole('OPERATOR','TECH','ADMIN'), ElevatorController.emergencyStop);
r.post ('/:id/start', auth(), requireRole('OPERATOR','TECH','ADMIN'), ElevatorController.startElevator);
r.post('/:id/door', auth(), requireRole('OPERATOR','TECH','ADMIN'), ElevatorController.doorCommand);
r.put('/:id/settings', auth(), requireRole('OPERATOR','TECH','ADMIN'), ElevatorController.updateSettings);

export default r;