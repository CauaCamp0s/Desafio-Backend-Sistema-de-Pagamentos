import { Router } from 'express';
import customerController from '../controllers/CustomerController.js';
import { validateCustomerCreate, validateCustomerId } from '../middlewares/customerValidation.js';
import { idempotencyMiddleware } from '../middlewares/idempotency.js';

const router = Router();

router.post('/customers', idempotencyMiddleware, validateCustomerCreate, customerController.create);
router.get('/customers', customerController.findAll);
router.get('/customers/:id', validateCustomerId, customerController.findById);
router.delete('/customers/:id', validateCustomerId, customerController.delete);

export default router;

