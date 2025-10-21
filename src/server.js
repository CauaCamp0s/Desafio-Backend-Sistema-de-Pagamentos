import app from './app.js';
import { config } from './config/config.js';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Ambiente: ${config.nodeEnv}`);
  console.log(`API disponível em: http://localhost:${PORT}/api`);
});
