import { AppError } from '../utils/errors.js';


const errorHandler = (err, req, res, next) => {
  console.error('Erro capturado:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || []
    });
  }

  if (err.code) {
    return handlePrismaError(err, res);
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'JSON inválido no corpo da requisição'
    });
  }

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'development' 
    ? err.message 
    : 'Erro interno do servidor';

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

const handlePrismaError = (err, res) => {
  switch (err.code) {
    case 'P2002':
      const field = err.meta?.target?.[0] || 'campo';
      return res.status(409).json({
        success: false,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} já cadastrado`
      });

    case 'P2025':
      return res.status(404).json({
        success: false,
        message: 'Registro não encontrado'
      });

    case 'P2003':
      return res.status(400).json({
        success: false,
        message: 'Referência inválida em relacionamento'
      });

    case 'P2014':
      return res.status(400).json({
        success: false,
        message: 'Operação violaria restrição de relacionamento'
      });

    default:
      return res.status(500).json({
        success: false,
        message: 'Erro de banco de dados',
        ...(process.env.NODE_ENV === 'development' && { code: err.code })
      });
  }
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    path: req.url
  });
};

export { errorHandler, notFoundHandler };

