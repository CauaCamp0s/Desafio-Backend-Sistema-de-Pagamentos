import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class ChargeRepository {
  async create(chargeData) {
    return await prisma.charge.create({
      data: chargeData,
      include: {
        customer: true
      }
    });
  }

  async findAll() {
    return await prisma.charge.findMany({
      include: {
        customer: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id) {
    return await prisma.charge.findUnique({
      where: { id },
      include: {
        customer: true
      }
    });
  }

  async findByCustomerId(customerId) {
    return await prisma.charge.findMany({
      where: { customerId },
      include: {
        customer: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async disconnect() {
    await prisma.$disconnect();
  }
}

export default new ChargeRepository();

