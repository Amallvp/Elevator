import { Router } from 'express';
import * as elevatorCtl from '../controllers/elevatorController.js';
import { auth } from '../middleware/auth.js';

const r = Router();
r.get('/:id/log', auth(), elevatorCtl.getAuditLog);
export default r;   