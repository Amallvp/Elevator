import { Router } from 'express';
import elevators from './elevatorRoute.js';
import trips from './tripRoute.js';
import maintenance from './maintainanceRoute.js';
import auth from './authRoute.js';
import audit from './auditRoute.js';

const router = Router();
router.use('/auth', auth);
router.use('/elevators', elevators);
router.use('/trips', trips);
router.use('/maintenance', maintenance);
router.use ('/audit',audit)

export default router;
