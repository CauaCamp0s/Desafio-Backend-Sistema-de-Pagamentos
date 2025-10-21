import { ValidationError } from '../utils/errors.js';

const validateCustomerCreate = (req, res, next) => {
  const { nome, email, documento, telefone } = req.body;
  const errors = [];

  if (!nome || typeof nome !== 'string' || nome.trim() === '') {
    errors.push('Nome é obrigatório');
  } else if (nome.trim().length < 3) {
    errors.push('Nome deve ter pelo menos 3 caracteres');
  } else if (nome.trim().length > 100) {
    errors.push('Nome deve ter no máximo 100 caracteres');
  }

  if (!email || typeof email !== 'string' || email.trim() === '') {
    errors.push('Email é obrigatório');
  } else if (!isValidEmail(email)) {
    errors.push('Email inválido');
  }

  if (!documento || typeof documento !== 'string' || documento.trim() === '') {
    errors.push('Documento é obrigatório');
  } else {
    const docClean = documento.replace(/\D/g, '');
    if (docClean.length !== 11 && docClean.length !== 14) {
      errors.push('Documento deve ser CPF (11 dígitos) ou CNPJ (14 dígitos)');
    }
  }

  if (!telefone || typeof telefone !== 'string' || telefone.trim() === '') {
    errors.push('Telefone é obrigatório');
  } else {
    const phoneClean = telefone.replace(/\D/g, '');
    if (phoneClean.length < 10 || phoneClean.length > 11) {
      errors.push('Telefone deve ter 10 ou 11 dígitos');
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('Dados inválidos', errors);
  }

  next();
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateCustomerId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || !isValidUUID(id)) {
    throw new ValidationError('ID do cliente inválido');
  }
  
  next();
};

const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export {
  validateCustomerCreate,
  validateCustomerId
};

