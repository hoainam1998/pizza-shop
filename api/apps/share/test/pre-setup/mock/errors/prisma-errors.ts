import { PRISMA_ERROR_CODE } from '@share/enums';
import { Prisma } from 'generated/prisma';

const PRISMA_VERSION = 'v1';

export const PrismaNotFoundError = new Prisma.PrismaClientKnownRequestError('Data queried not found!', {
  code: PRISMA_ERROR_CODE.NOT_FOUND,
  clientVersion: PRISMA_VERSION,
});

export const PrismaDisconnectError = new Prisma.PrismaClientInitializationError(
  "Can't reach database server",
  PRISMA_VERSION,
  PRISMA_ERROR_CODE.DATABASE_LOST_CONNECT,
);
