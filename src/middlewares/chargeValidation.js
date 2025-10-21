import { ValidationError } from '../utils/errors.js';

const validateChargeCreate = (req, res, next) => {
  const { customerId, valor, moeda, metodo_pagamento, parcelas, data_vencimento } = req.body;
  const errors = [];

  if (!customerId || typeof customerId !== 'string' || customerId.trim() === '') {
    errors.push('Cliente é obrigatório');
  } else if (!isValidUUID(customerId)) {
    errors.push('ID do cliente inválido');
  }

  if (valor === undefined || valor === null) {
    errors.push('Valor é obrigatório');
  } else if (typeof valor !== 'number') {
    errors.push('Valor deve ser um número');
  } else if (valor <= 0) {
    errors.push('Valor deve ser maior que 0');
  } else if (valor > 999999999.99) {
    errors.push('Valor máximo excedido');
  }

  if (!moeda || typeof moeda !== 'string' || moeda.trim() === '') {
    errors.push('Moeda é obrigatória');
  } else if (moeda.length !== 3) {
    errors.push('Moeda deve ter 3 caracteres (ex: BRL, USD)');
  }

  const metodosValidos = ['PIX', 'CARTAO', 'BOLETO'];
  if (!metodo_pagamento || typeof metodo_pagamento !== 'string') {
    errors.push('Método de pagamento é obrigatório');
  } else if (!metodosValidos.includes(metodo_pagamento)) {
    errors.push(`Método de pagamento deve ser um dos seguintes: ${metodosValidos.join(', ')}`);
  } else {
    validatePaymentMethod(metodo_pagamento, parcelas, data_vencimento, errors);
  }

  if (errors.length > 0) {
    throw new ValidationError('Dados inválidos', errors);
  }

  next();
};

const validatePaymentMethod = (metodo, parcelas, dataVencimento, errors) => {
  switch (metodo) {
    case 'PIX':
      if (parcelas !== undefined && parcelas !== null) {
        errors.push('Pagamento via PIX não aceita parcelas');
      }
      if (dataVencimento !== undefined && dataVencimento !== null) {
        errors.push('Pagamento via PIX não aceita data de vencimento');
      }
      break;

    case 'CARTAO':
      if (parcelas !== undefined && parcelas !== null) {
        if (typeof parcelas !== 'number') {
          errors.push('Parcelas deve ser um número');
        } else if (!Number.isInteger(parcelas)) {
          errors.push('Parcelas deve ser um número inteiro');
        } else if (parcelas < 1) {
          errors.push('Parcelas deve ser maior ou igual a 1');
        } else if (parcelas > 12) {
          errors.push('Número máximo de parcelas é 12');
        }
      }
      break;

    case 'BOLETO':
      if (!dataVencimento) {
        errors.push('Data de vencimento é obrigatória para pagamento via boleto');
      } else {
        const vencimento = new Date(dataVencimento);
        if (isNaN(vencimento.getTime())) {
          errors.push('Data de vencimento inválida');
        } else {
          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);
          if (vencimento < hoje) {
            errors.push('Data de vencimento não pode ser no passado');
          }
        }
      }
      if (parcelas !== undefined && parcelas !== null) {
        errors.push('Pagamento via boleto não aceita parcelas');
      }
      break;
  }
};

const validateChargeId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || !isValidUUID(id)) {
    throw new ValidationError('ID da cobrança inválido');
  }
  
  next();
};

const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export {
  validateChargeCreate,
  validateChargeId
};

