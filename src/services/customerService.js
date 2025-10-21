import customerRepository from '../repositories/customerRepository.js';
import { ValidationError, ConflictError, NotFoundError } from '../utils/errors.js';

class CustomerService {
  validateCustomerData(data) {
    const errors = [];

    if (!data.nome || data.nome.trim() === '') {
      errors.push('Nome é obrigatório');
    }

    if (!data.email || data.email.trim() === '') {
      errors.push('Email é obrigatório');
    } else if (!this.isValidEmail(data.email)) {
      errors.push('Email inválido');
    }

    if (!data.documento || data.documento.trim() === '') {
      errors.push('Documento é obrigatório');
    }

    if (!data.telefone || data.telefone.trim() === '') {
      errors.push('Telefone é obrigatório');
    }

    return errors;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async create(customerData) {
    const validationErrors = this.validateCustomerData(customerData);
    if (validationErrors.length > 0) {
      throw new ValidationError('Dados inválidos', validationErrors);
    }

    const existingEmail = await customerRepository.findByEmail(customerData.email);
    if (existingEmail) {
      throw new ConflictError('Email já cadastrado');
    }

    const existingDocumento = await customerRepository.findByDocumento(customerData.documento);
    if (existingDocumento) {
      throw new ConflictError('Documento já cadastrado');
    }

    return await customerRepository.create(customerData);
  }

  async findAll() {
    return await customerRepository.findAll();
  }

  async findById(id) {
    const customer = await customerRepository.findById(id);
    
    if (!customer) {
      throw new NotFoundError('Cliente não encontrado');
    }

    return customer;
  }

  async delete(id) {
    const customer = await customerRepository.findById(id);
    
    if (!customer) {
      throw new NotFoundError('Cliente não encontrado');
    }

    return await customerRepository.delete(id);
  }
}

export default new CustomerService();

