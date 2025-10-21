import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class CustomerRepository {
  async create(customerData) {
    return await prisma.customer.create({
      data: customerData
    });
  }

  async findAll() {
    return await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id) {
    return await prisma.customer.findUnique({
      where: { id }
    });
  }

  async findByEmail(email) {
    return await prisma.customer.findUnique({
      where: { email }
    });
  }

  async findByDocumento(documento) {
    return await prisma.customer.findUnique({
      where: { documento }
    });
  }

  async delete(id) {
    return await prisma.customer.delete({
      where: { id }
    });
  }

  async disconnect() {
    await prisma.$disconnect();
  }
}

export default new CustomerRepository();

