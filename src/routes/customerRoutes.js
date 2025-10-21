import { Router } from 'express';
import customerController from '../controllers/CustomerController.js';

const router = Router();

router.post('/customers', customerController.create);
router.get('/customers', customerController.findAll);
router.get('/customers/:id', customerController.findById);
router.delete('/customers/:id', customerController.delete);

export default router;

