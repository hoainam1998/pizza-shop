import { PrismaClient, Prisma } from 'generated/prisma';
import user from './extension/user';
import ingredient from './extension/ingredient';
import product from './extension/product';

const extension = Prisma.defineExtension((prisma) => {
  return prisma.$extends({
    query: {
      user: user(prisma as PrismaClient) as any,
      ingredient: ingredient(prisma as PrismaClient) as any,
      product: product(prisma as PrismaClient) as any,
    },
  });
});

export default new PrismaClient().$extends(extension);
