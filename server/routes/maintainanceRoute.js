import { Router } from 'express';
import * as MaintCtl from '../controllers/maintainence.js';
import { auth, requireRole } from '../middleware/auth.js';

const r = Router();
r.get('/faults', auth(), requireRole('TECH','ADMIN'), MaintCtl.listFaults);
r.post('/:id/mode', auth(), requireRole('TECH','ADMIN'), MaintCtl.setMaintenanceMode);
export default r;