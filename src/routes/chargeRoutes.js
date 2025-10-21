import { Router } from 'express';
import chargeController from '../controllers/chargeController.js';

const router = Router();

router.post('/charges', chargeController.create);
router.get('/charges', chargeController.findAll);
router.get('/charges/:id', chargeController.findById);

export default router;

