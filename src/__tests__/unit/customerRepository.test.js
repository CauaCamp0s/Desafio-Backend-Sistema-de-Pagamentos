import { jest } from '@jest/globals';

const mockPrismaClient = {
  customer: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn()
  },
  $disconnect: jest.fn()
};

jest.unstable_mockModule('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient)
}));

const { default: customerRepository } = await import('../../repositories/customerRepository.js');

describe('CustomerRepository - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar um novo cliente no banco de dados', async () => {
      const customerData = {
        nome: 'João Silva',
        email: 'joao@example.com',
        documento: '12345678901',
        telefone: '11999999999'
      };

      const createdCustomer = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...customerData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrismaClient.customer.create.mockResolvedValue(createdCustomer);

      const result = await customerRepository.create(customerData);

      expect(mockPrismaClient.customer.create).toHaveBeenCalledWith({
        data: customerData
      });
      expect(result).toEqual(createdCustomer);
    });

    it('deve repassar erro do Prisma ao falhar', async () => {
      const customerData = {
        nome: 'João Silva',
        email: 'joao@example.com',
        documento: '12345678901',
        telefone: '11999999999'
      };

      const prismaError = new Error('Prisma error');
      mockPrismaClient.customer.create.mockRejectedValue(prismaError);

      await expect(customerRepository.create(customerData))
        .rejects.toThrow('Prisma error');
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os clientes ordenados por data de criação', async () => {
      const customers = [
        {
          id: '1',
          nome: 'João Silva',
          email: 'joao@example.com',
          documento: '12345678901',
          telefone: '11999999999',
          createdAt: new Date('2025-01-02'),
          updatedAt: new Date()
        },
        {
          id: '2',
          nome: 'Maria Santos',
          email: 'maria@example.com',
          documento: '98765432100',
          telefone: '11988888888',
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date()
        }
      ];

      mockPrismaClient.customer.findMany.mockResolvedValue(customers);

      const result = await customerRepository.findAll();

      expect(mockPrismaClient.customer.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' }
      });
      expect(result).toEqual(customers);
      expect(result).toHaveLength(2);
    });

    it('deve retornar array vazio quando não há clientes', async () => {
      mockPrismaClient.customer.findMany.mockResolvedValue([]);

      const result = await customerRepository.findAll();

      expect(mockPrismaClient.customer.findMany).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('deve retornar cliente quando encontrado por ID', async () => {
      const customerId = '123e4567-e89b-12d3-a456-426614174000';
      const customer = {
        id: customerId,
        nome: 'João Silva',
        email: 'joao@example.com',
        documento: '12345678901',
        telefone: '11999999999',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrismaClient.customer.findUnique.mockResolvedValue(customer);

      const result = await customerRepository.findById(customerId);

      expect(mockPrismaClient.customer.findUnique).toHaveBeenCalledWith({
        where: { id: customerId }
      });
      expect(result).toEqual(customer);
    });

    it('deve retornar null quando cliente não encontrado', async () => {
      const customerId = '123e4567-e89b-12d3-a456-426614174000';
      mockPrismaClient.customer.findUnique.mockResolvedValue(null);

      const result = await customerRepository.findById(customerId);

      expect(mockPrismaClient.customer.findUnique).toHaveBeenCalledWith({
        where: { id: customerId }
      });
      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('deve retornar cliente quando encontrado por email', async () => {
      const email = 'joao@example.com';
      const customer = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        nome: 'João Silva',
        email: email,
        documento: '12345678901',
        telefone: '11999999999',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrismaClient.customer.findUnique.mockResolvedValue(customer);

      const result = await customerRepository.findByEmail(email);

      expect(mockPrismaClient.customer.findUnique).toHaveBeenCalledWith({
        where: { email }
      });
      expect(result).toEqual(customer);
    });

    it('deve retornar null quando email não encontrado', async () => {
      const email = 'naoexiste@example.com';
      mockPrismaClient.customer.findUnique.mockResolvedValue(null);

      const result = await customerRepository.findByEmail(email);

      expect(mockPrismaClient.customer.findUnique).toHaveBeenCalledWith({
        where: { email }
      });
      expect(result).toBeNull();
    });
  });

  describe('findByDocumento', () => {
    it('deve retornar cliente quando encontrado por documento', async () => {
      const documento = '12345678901';
      const customer = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        nome: 'João Silva',
        email: 'joao@example.com',
        documento: documento,
        telefone: '11999999999',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrismaClient.customer.findUnique.mockResolvedValue(customer);

      const result = await customerRepository.findByDocumento(documento);

      expect(mockPrismaClient.customer.findUnique).toHaveBeenCalledWith({
        where: { documento }
      });
      expect(result).toEqual(customer);
    });

    it('deve retornar null quando documento não encontrado', async () => {
      const documento = '99999999999';
      mockPrismaClient.customer.findUnique.mockResolvedValue(null);

      const result = await customerRepository.findByDocumento(documento);

      expect(mockPrismaClient.customer.findUnique).toHaveBeenCalledWith({
        where: { documento }
      });
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('deve deletar cliente e retornar dados do cliente deletado', async () => {
      const customerId = '123e4567-e89b-12d3-a456-426614174000';
      const deletedCustomer = {
        id: customerId,
        nome: 'João Silva',
        email: 'joao@example.com',
        documento: '12345678901',
        telefone: '11999999999',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrismaClient.customer.delete.mockResolvedValue(deletedCustomer);

      const result = await customerRepository.delete(customerId);

      expect(mockPrismaClient.customer.delete).toHaveBeenCalledWith({
        where: { id: customerId }
      });
      expect(result).toEqual(deletedCustomer);
    });

    it('deve repassar erro do Prisma quando cliente não encontrado', async () => {
      const customerId = 'id-inexistente';
      const prismaError = new Error('Record not found');
      mockPrismaClient.customer.delete.mockRejectedValue(prismaError);

      await expect(customerRepository.delete(customerId))
        .rejects.toThrow('Record not found');
    });
  });

  describe('disconnect', () => {
    it('deve desconectar do Prisma', async () => {
      mockPrismaClient.$disconnect.mockResolvedValue(undefined);

      await customerRepository.disconnect();

      expect(mockPrismaClient.$disconnect).toHaveBeenCalled();
    });

    it('deve repassar erro ao falhar ao desconectar', async () => {
      const disconnectError = new Error('Disconnect error');
      mockPrismaClient.$disconnect.mockRejectedValue(disconnectError);

      await expect(customerRepository.disconnect())
        .rejects.toThrow('Disconnect error');
    });
  });
});

