import { jest } from '@jest/globals';
import { ValidationError, ConflictError, NotFoundError } from '../../utils/errors.js';

const mockCustomerRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findByDocumento: jest.fn(),
  delete: jest.fn(),
  disconnect: jest.fn()
};

jest.unstable_mockModule('../../repositories/customerRepository.js', () => ({
  default: mockCustomerRepository
}));

const { default: customerService } = await import('../../services/customerService.js');

describe('CustomerService - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateCustomerData', () => {
    it('deve retornar array vazio para dados válidos', () => {
      const validData = {
        nome: 'João Silva',
        email: 'joao@example.com',
        documento: '12345678901',
        telefone: '11999999999'
      };

      const errors = customerService.validateCustomerData(validData);
      expect(errors).toEqual([]);
    });

    it('deve retornar erro quando nome está vazio', () => {
      const invalidData = {
        nome: '',
        email: 'joao@example.com',
        documento: '12345678901',
        telefone: '11999999999'
      };

      const errors = customerService.validateCustomerData(invalidData);
      expect(errors).toContain('Nome é obrigatório');
    });

    it('deve retornar erro quando nome não está presente', () => {
      const invalidData = {
        email: 'joao@example.com',
        documento: '12345678901',
        telefone: '11999999999'
      };

      const errors = customerService.validateCustomerData(invalidData);
      expect(errors).toContain('Nome é obrigatório');
    });

    it('deve retornar erro quando email está vazio', () => {
      const invalidData = {
        nome: 'João Silva',
        email: '',
        documento: '12345678901',
        telefone: '11999999999'
      };

      const errors = customerService.validateCustomerData(invalidData);
      expect(errors).toContain('Email é obrigatório');
    });

    it('deve retornar erro quando email é inválido', () => {
      const invalidData = {
        nome: 'João Silva',
        email: 'email-invalido',
        documento: '12345678901',
        telefone: '11999999999'
      };

      const errors = customerService.validateCustomerData(invalidData);
      expect(errors).toContain('Email inválido');
    });

    it('deve retornar erro quando documento está vazio', () => {
      const invalidData = {
        nome: 'João Silva',
        email: 'joao@example.com',
        documento: '',
        telefone: '11999999999'
      };

      const errors = customerService.validateCustomerData(invalidData);
      expect(errors).toContain('Documento é obrigatório');
    });

    it('deve retornar erro quando telefone está vazio', () => {
      const invalidData = {
        nome: 'João Silva',
        email: 'joao@example.com',
        documento: '12345678901',
        telefone: ''
      };

      const errors = customerService.validateCustomerData(invalidData);
      expect(errors).toContain('Telefone é obrigatório');
    });

    it('deve retornar múltiplos erros quando há múltiplas falhas de validação', () => {
      const invalidData = {
        nome: '',
        email: 'email-invalido',
        documento: '',
        telefone: ''
      };

      const errors = customerService.validateCustomerData(invalidData);
      expect(errors.length).toBeGreaterThan(1);
      expect(errors).toContain('Nome é obrigatório');
      expect(errors).toContain('Email inválido');
      expect(errors).toContain('Documento é obrigatório');
      expect(errors).toContain('Telefone é obrigatório');
    });
  });

  describe('isValidEmail', () => {
    it('deve retornar true para email válido', () => {
      expect(customerService.isValidEmail('teste@example.com')).toBe(true);
      expect(customerService.isValidEmail('usuario.nome@dominio.com.br')).toBe(true);
      expect(customerService.isValidEmail('user123@test.org')).toBe(true);
    });

    it('deve retornar false para email inválido', () => {
      expect(customerService.isValidEmail('email-sem-arroba')).toBe(false);
      expect(customerService.isValidEmail('email@sem-dominio')).toBe(false);
      expect(customerService.isValidEmail('@dominio.com')).toBe(false);
      expect(customerService.isValidEmail('email@')).toBe(false);
    });
  });

  describe('create', () => {
    const validCustomerData = {
      nome: 'João Silva',
      email: 'joao@example.com',
      documento: '12345678901',
      telefone: '11999999999'
    };

    it('deve criar um cliente com dados válidos', async () => {
      const createdCustomer = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...validCustomerData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockCustomerRepository.findByEmail.mockResolvedValue(null);
      mockCustomerRepository.findByDocumento.mockResolvedValue(null);
      mockCustomerRepository.create.mockResolvedValue(createdCustomer);

      const result = await customerService.create(validCustomerData);

      expect(mockCustomerRepository.findByEmail).toHaveBeenCalledWith(validCustomerData.email);
      expect(mockCustomerRepository.findByDocumento).toHaveBeenCalledWith(validCustomerData.documento);
      expect(mockCustomerRepository.create).toHaveBeenCalledWith(validCustomerData);
      expect(result).toEqual(createdCustomer);
    });

    it('deve lançar ValidationError para dados inválidos', async () => {
      const invalidData = {
        nome: '',
        email: 'email-invalido',
        documento: '',
        telefone: ''
      };

      await expect(customerService.create(invalidData))
        .rejects.toThrow(ValidationError);
      
      expect(mockCustomerRepository.create).not.toHaveBeenCalled();
    });

    it('deve lançar ConflictError se email já existe', async () => {
      const existingCustomer = { id: '123', ...validCustomerData };
      mockCustomerRepository.findByEmail.mockResolvedValue(existingCustomer);

      await expect(customerService.create(validCustomerData))
        .rejects.toThrow(ConflictError);
      
      await expect(customerService.create(validCustomerData))
        .rejects.toThrow('Email já cadastrado');

      expect(mockCustomerRepository.create).not.toHaveBeenCalled();
    });

    it('deve lançar ConflictError se documento já existe', async () => {
      const existingCustomer = { id: '123', ...validCustomerData };
      mockCustomerRepository.findByEmail.mockResolvedValue(null);
      mockCustomerRepository.findByDocumento.mockResolvedValue(existingCustomer);

      await expect(customerService.create(validCustomerData))
        .rejects.toThrow(ConflictError);
      
      await expect(customerService.create(validCustomerData))
        .rejects.toThrow('Documento já cadastrado');

      expect(mockCustomerRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar lista de clientes', async () => {
      const customers = [
        {
          id: '1',
          nome: 'João Silva',
          email: 'joao@example.com',
          documento: '12345678901',
          telefone: '11999999999'
        },
        {
          id: '2',
          nome: 'Maria Santos',
          email: 'maria@example.com',
          documento: '98765432100',
          telefone: '11988888888'
        }
      ];

      mockCustomerRepository.findAll.mockResolvedValue(customers);

      const result = await customerService.findAll();

      expect(mockCustomerRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(customers);
      expect(result).toHaveLength(2);
    });

    it('deve retornar lista vazia quando não há clientes', async () => {
      mockCustomerRepository.findAll.mockResolvedValue([]);

      const result = await customerService.findAll();

      expect(mockCustomerRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findById', () => {
    const customerId = '123e4567-e89b-12d3-a456-426614174000';

    it('deve retornar cliente quando encontrado', async () => {
      const customer = {
        id: customerId,
        nome: 'João Silva',
        email: 'joao@example.com',
        documento: '12345678901',
        telefone: '11999999999'
      };

      mockCustomerRepository.findById.mockResolvedValue(customer);

      const result = await customerService.findById(customerId);

      expect(mockCustomerRepository.findById).toHaveBeenCalledWith(customerId);
      expect(result).toEqual(customer);
    });

    it('deve lançar NotFoundError quando cliente não encontrado', async () => {
      mockCustomerRepository.findById.mockResolvedValue(null);

      await expect(customerService.findById(customerId))
        .rejects.toThrow(NotFoundError);
      
      await expect(customerService.findById(customerId))
        .rejects.toThrow('Cliente não encontrado');

      expect(mockCustomerRepository.findById).toHaveBeenCalledWith(customerId);
    });
  });

  describe('delete', () => {
    const customerId = '123e4567-e89b-12d3-a456-426614174000';

    it('deve deletar cliente quando encontrado', async () => {
      const customer = {
        id: customerId,
        nome: 'João Silva',
        email: 'joao@example.com',
        documento: '12345678901',
        telefone: '11999999999'
      };

      mockCustomerRepository.findById.mockResolvedValue(customer);
      mockCustomerRepository.delete.mockResolvedValue(customer);

      const result = await customerService.delete(customerId);

      expect(mockCustomerRepository.findById).toHaveBeenCalledWith(customerId);
      expect(mockCustomerRepository.delete).toHaveBeenCalledWith(customerId);
      expect(result).toEqual(customer);
    });

    it('deve lançar NotFoundError quando cliente não encontrado', async () => {
      mockCustomerRepository.findById.mockResolvedValue(null);

      await expect(customerService.delete(customerId))
        .rejects.toThrow(NotFoundError);
      
      await expect(customerService.delete(customerId))
        .rejects.toThrow('Cliente não encontrado');

      expect(mockCustomerRepository.findById).toHaveBeenCalledWith(customerId);
      expect(mockCustomerRepository.delete).not.toHaveBeenCalled();
    });
  });
});

