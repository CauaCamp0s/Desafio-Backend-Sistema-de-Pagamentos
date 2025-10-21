import { PrismaClient } from '@prisma/client';
import { ValidationError } from '../utils/errors.js';

const prisma = new PrismaClient();

const idempotencyMiddleware = async (req, res, next) => {
  if (req.method !== 'POST') {
    return next();
  }

  const idempotencyKey = req.headers['idempotency-key'];
  if (!idempotencyKey) {
    return next();
  }

  if (typeof idempotencyKey !== 'string' || idempotencyKey.trim() === '') {
    throw new ValidationError('Header Idempotency-Key inválido');
  }

  if (idempotencyKey.length > 255) {
    throw new ValidationError('Header Idempotency-Key muito longo (máximo 255 caracteres)');
  }

  try {
    const existingRequest = await prisma.idempotencyKey.findUnique({
      where: { requestKey: idempotencyKey }
    });

    if (existingRequest) {
      console.log(`Requisição duplicada detectada: ${idempotencyKey}`);
      
      if (new Date() > existingRequest.expiresAt) {
        await prisma.idempotencyKey.delete({
          where: { requestKey: idempotencyKey }
        });
        return next();
      }

      return res
        .status(existingRequest.responseStatus)
        .json(JSON.parse(existingRequest.responseBody));
    }

    const originalJson = res.json;
    res.json = function (data) {
      storeIdempotencyKey(idempotencyKey, res.statusCode, data)
        .catch(err => console.error('Erro ao armazenar chave de idempotência:', err));

      return originalJson.call(this, data);
    };

    next();
  } catch (error) {
    console.error('Erro no middleware de idempotência:', error);
    next(error);
  }
};

const storeIdempotencyKey = async (requestKey, responseStatus, responseBody) => {
  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await prisma.idempotencyKey.create({
      data: {
        requestKey,
        responseStatus,
        responseBody: JSON.stringify(responseBody),
        expiresAt
      }
    });
  } catch (error) {
    if (error.code !== 'P2002') {
      throw error;
    }
  }
};

const cleanupExpiredKeys = async () => {
  try {
    const result = await prisma.idempotencyKey.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });
    console.log(`Limpeza de idempotência: ${result.count} chaves removidas`);
    return result.count;
  } catch (error) {
    console.error('Erro ao limpar chaves expiradas:', error);
    throw error;
  }
};

export {
  idempotencyMiddleware,
  cleanupExpiredKeys
};

