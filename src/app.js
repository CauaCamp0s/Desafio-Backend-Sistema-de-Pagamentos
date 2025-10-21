import express from 'express';
import cors from 'cors';
import customerRoutes from './routes/customerRoutes.js';
import chargeRoutes from './routes/chargeRoutes.js';

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

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor'
  });
});

export default app;

