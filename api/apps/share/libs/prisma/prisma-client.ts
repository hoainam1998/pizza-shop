import { PrismaClient, Prisma } from 'generated/prisma';
import user from './extension/user';

const extension = Prisma.defineExtension((prisma) => {
  return prisma.$extends({
    query: {
      user: user(prisma as PrismaClient) as any,
    },
  });
});

export default new PrismaClient().$extends(extension);
