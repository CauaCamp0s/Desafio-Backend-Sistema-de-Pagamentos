import chargeRepository from '../repositories/chargeRepository.js';
import customerRepository from '../repositories/customerRepository.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

class ChargeService {
  validateChargeData(data) {
    const errors = [];

    if (!data.customerId || data.customerId.trim() === '') {
      errors.push('Cliente é obrigatório');
    }

    if (!data.valor || typeof data.valor !== 'number') {
      errors.push('Valor é obrigatório e deve ser um número');
    } else if (data.valor <= 0) {
      errors.push('Valor deve ser maior que 0');
    }

    if (!data.moeda || data.moeda.trim() === '') {
      errors.push('Moeda é obrigatória');
    }

    const metodosValidos = ['PIX', 'CARTAO', 'BOLETO'];
    if (!data.metodo_pagamento) {
      errors.push('Método de pagamento é obrigatório');
    } else if (!metodosValidos.includes(data.metodo_pagamento)) {
      errors.push(`Método de pagamento deve ser um dos seguintes: ${metodosValidos.join(', ')}`);
    }

    if (data.metodo_pagamento === 'BOLETO') {
      if (!data.data_vencimento) {
        errors.push('Data de vencimento é obrigatória para pagamento via boleto');
      } else {
        const dataVencimento = new Date(data.data_vencimento);
        if (isNaN(dataVencimento.getTime())) {
          errors.push('Data de vencimento inválida');
        }
      }
    }

    if (data.metodo_pagamento === 'CARTAO') {
      if (data.parcelas) {
        if (typeof data.parcelas !== 'number' || data.parcelas < 1) {
          errors.push('Parcelas deve ser um número maior ou igual a 1');
        }
      }
    }

    if (data.metodo_pagamento === 'PIX') {
      if (data.parcelas) {
        errors.push('Pagamento via PIX não aceita parcelas');
      }
      if (data.data_vencimento) {
        errors.push('Pagamento via PIX não aceita data de vencimento');
      }
    }

    return errors;
  }

  async create(chargeData) {
    const validationErrors = this.validateChargeData(chargeData);
    if (validationErrors.length > 0) {
      throw new ValidationError('Dados inválidos', validationErrors);
    }

    const customer = await customerRepository.findById(chargeData.customerId);
    if (!customer) {
      throw new NotFoundError('Cliente não encontrado');
    }

    const chargeToCreate = {
      customerId: chargeData.customerId,
      valor: chargeData.valor,
      moeda: chargeData.moeda,
      metodo_pagamento: chargeData.metodo_pagamento,
      status: 'PENDENTE'
    };

    if (chargeData.metodo_pagamento === 'BOLETO' && chargeData.data_vencimento) {
      chargeToCreate.data_vencimento = new Date(chargeData.data_vencimento);
    }

    if (chargeData.metodo_pagamento === 'CARTAO' && chargeData.parcelas) {
      chargeToCreate.parcelas = chargeData.parcelas;
    }

    return await chargeRepository.create(chargeToCreate);
  }

  async findAll() {
    return await chargeRepository.findAll();
  }

  async findById(id) {
    const charge = await chargeRepository.findById(id);
    
    if (!charge) {
      throw new NotFoundError('Cobrança não encontrada');
    }

    return charge;
  }

  async findByCustomerId(customerId) {
    const customer = await customerRepository.findById(customerId);
    if (!customer) {
      throw new NotFoundError('Cliente não encontrado');
    }

    return await chargeRepository.findByCustomerId(customerId);
  }
}

export default new ChargeService();

