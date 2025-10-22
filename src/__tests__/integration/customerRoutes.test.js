import { jest } from '@jest/globals';
import request from 'supertest';

const mockPrismaClient = {
  customer: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn()
  },
  idempotencyKey: {
    findUnique: jest.fn(),
    create: jest.fn()
  },
  $disconnect: jest.fn()
};

jest.unstable_mockModule('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient)
}));

const { default: app } = await import('../../app.js');

describe('Customer Routes - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/customers', () => {
    const validCustomerData = {
      nome: 'João Silva',
      email: 'joao@example.com',
      documento: '12345678901',
      telefone: '11999999999'
    };

    it('deve criar um novo cliente com dados válidos', async () => {
      const createdCustomer = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...validCustomerData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockPrismaClient.idempotencyKey.findUnique.mockResolvedValue(null);
      mockPrismaClient.customer.findUnique.mockResolvedValue(null);
      mockPrismaClient.customer.create.mockResolvedValue(createdCustomer);
      mockPrismaClient.idempotencyKey.create.mockResolvedValue({});

      const response = await request(app)
        .post('/api/customers')
        .set('Idempotency-Key', 'unique-key-123')
        .send(validCustomerData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Cliente criado com sucesso');
      expect(response.body.data).toMatchObject({
        id: expect.any(String),
        nome: validCustomerData.nome,
        email: validCustomerData.email,
        documento: validCustomerData.documento,
        telefone: validCustomerData.telefone
      });
    });

    it('deve retornar 400 quando nome está ausente', async () => {
      const invalidData = {
        email: 'joao@example.com',
        documento: '12345678901',
        telefone: '11999999999'
      };

      mockPrismaClient.idempotencyKey.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/customers')
        .set('Idempotency-Key', 'unique-key-124')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Nome é obrigatório');
    });

    it('deve retornar 400 quando nome é muito curto', async () => {
      const invalidData = {
        ...validCustomerData,
        nome: 'Jo'
      };

      mockPrismaClient.idempotencyKey.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/customers')
        .set('Idempotency-Key', 'unique-key-125')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Nome deve ter pelo menos 3 caracteres');
    });

    it('deve retornar 400 quando email é inválido', async () => {
      const invalidData = {
        ...validCustomerData,
        email: 'email-invalido'
      };

      mockPrismaClient.idempotencyKey.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/customers')
        .set('Idempotency-Key', 'unique-key-126')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Email inválido');
    });

    it('deve retornar 400 quando documento tem formato inválido', async () => {
      const invalidData = {
        ...validCustomerData,
        documento: '123'
      };

      mockPrismaClient.idempotencyKey.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/customers')
        .set('Idempotency-Key', 'unique-key-127')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Documento deve ser CPF (11 dígitos) ou CNPJ (14 dígitos)');
    });

    it('deve retornar 400 quando telefone é inválido', async () => {
      const invalidData = {
        ...validCustomerData,
        telefone: '123'
      };

      mockPrismaClient.idempotencyKey.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/customers')
        .set('Idempotency-Key', 'unique-key-128')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Telefone deve ter 10 ou 11 dígitos');
    });

    it('deve retornar 409 quando email já existe', async () => {
      const existingCustomer = {
        id: 'existing-id',
        ...validCustomerData
      };

      mockPrismaClient.idempotencyKey.findUnique.mockResolvedValue(null);
      mockPrismaClient.customer.findUnique
        .mockResolvedValueOnce(existingCustomer)
        .mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/customers')
        .set('Idempotency-Key', 'unique-key-129')
        .send(validCustomerData);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email já cadastrado');
    });

    it('deve retornar 409 quando documento já existe', async () => {
      const existingCustomer = {
        id: 'existing-id',
        ...validCustomerData
      };

      mockPrismaClient.idempotencyKey.findUnique.mockResolvedValue(null);
      mockPrismaClient.customer.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(existingCustomer);

      const response = await request(app)
        .post('/api/customers')
        .set('Idempotency-Key', 'unique-key-130')
        .send(validCustomerData);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Documento já cadastrado');
    });

    it('deve retornar resposta cacheada para requisições duplicadas (idempotência)', async () => {
      const cachedResponse = {
        requestKey: 'duplicate-key',
        responseStatus: 201,
        responseBody: JSON.stringify({
          success: true,
          message: 'Cliente criado com sucesso',
          data: { id: 'cached-id', ...validCustomerData }
        })
      };

      mockPrismaClient.idempotencyKey.findUnique.mockResolvedValue(cachedResponse);

      const response = await request(app)
        .post('/api/customers')
        .set('Idempotency-Key', 'duplicate-key')
        .send(validCustomerData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(mockPrismaClient.customer.create).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/customers', () => {
    it('deve retornar lista de todos os clientes', async () => {
      const customers = [
        {
          id: '1',
          nome: 'João Silva',
          email: 'joao@example.com',
          documento: '12345678901',
          telefone: '11999999999',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          nome: 'Maria Santos',
          email: 'maria@example.com',
          documento: '98765432100',
          telefone: '11988888888',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      mockPrismaClient.customer.findMany.mockResolvedValue(customers);

      const response = await request(app)
        .get('/api/customers');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.count).toBe(2);
      expect(response.body.data[0]).toMatchObject({
        nome: 'João Silva',
        email: 'joao@example.com'
      });
    });

    it('deve retornar lista vazia quando não há clientes', async () => {
      mockPrismaClient.customer.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/customers');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.count).toBe(0);
    });
  });

  describe('GET /api/customers/:id', () => {
    const validId = '123e4567-e89b-12d3-a456-426614174000';

    it('deve retornar cliente específico quando encontrado', async () => {
      const customer = {
        id: validId,
        nome: 'João Silva',
        email: 'joao@example.com',
        documento: '12345678901',
        telefone: '11999999999',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockPrismaClient.customer.findUnique.mockResolvedValue(customer);

      const response = await request(app)
        .get(`/api/customers/${validId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: validId,
        nome: 'João Silva',
        email: 'joao@example.com'
      });
    });

    it('deve retornar 404 quando cliente não encontrado', async () => {
      mockPrismaClient.customer.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/customers/${validId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cliente não encontrado');
    });

    it('deve retornar 400 quando ID é inválido', async () => {
      const invalidId = 'id-invalido';

      const response = await request(app)
        .get(`/api/customers/${invalidId}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('ID do cliente inválido');
    });
  });

  describe('DELETE /api/customers/:id', () => {
    const validId = '123e4567-e89b-12d3-a456-426614174000';

    it('deve deletar cliente quando encontrado', async () => {
      const customer = {
        id: validId,
        nome: 'João Silva',
        email: 'joao@example.com',
        documento: '12345678901',
        telefone: '11999999999',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockPrismaClient.customer.findUnique.mockResolvedValue(customer);
      mockPrismaClient.customer.delete.mockResolvedValue(customer);

      const response = await request(app)
        .delete(`/api/customers/${validId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Cliente removido com sucesso');
    });

    it('deve retornar 404 quando cliente não encontrado', async () => {
      mockPrismaClient.customer.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .delete(`/api/customers/${validId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cliente não encontrado');
    });

    it('deve retornar 400 quando ID é inválido', async () => {
      const invalidId = 'id-invalido';

      const response = await request(app)
        .delete(`/api/customers/${invalidId}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('ID do cliente inválido');
    });
  });
});

