import express from 'express';
import cors from 'cors';
import customerRoutes from './routes/customerRoutes.js';
import chargeRoutes from './routes/chargeRoutes.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Sistema de Pagamentos',
    version: '1.0.0'
  });
});

app.use('/api', customerRoutes);
app.use('/api', chargeRoutes);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;

