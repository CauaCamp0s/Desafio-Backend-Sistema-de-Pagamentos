import { Router } from 'express';
import chargeController from '../controllers/chargeController.js';
import { validateChargeCreate, validateChargeId } from '../middlewares/chargeValidation.js';
import { idempotencyMiddleware } from '../middlewares/idempotency.js';

const router = Router();

router.post('/charges', idempotencyMiddleware, validateChargeCreate, chargeController.create);
router.get('/charges', chargeController.findAll);
router.get('/charges/:id', validateChargeId, chargeController.findById);

export default router;

