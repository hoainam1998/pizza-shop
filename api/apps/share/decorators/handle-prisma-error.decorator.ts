import { BadRequestException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import messages from '@share/constants/messages';
import { PRISMA_ERROR_CODE } from '@share/enums';
import { createMessage } from '@share/utils';
import { Prisma } from 'generated/prisma';

export default function handlePrismaError(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<any>) {
  const originMethod = descriptor.value;
  descriptor.value = function (...args: any[]) {
    return originMethod?.apply(this, args).catch((error: Error) => {
      switch (true) {
        case error instanceof Prisma.PrismaClientInitializationError:
        case error instanceof Prisma.PrismaClientValidationError:
          throw new RpcException(new BadRequestException(createMessage(messages.COMMON.MUTATING_DATABASE_ERROR)));
        case error instanceof Prisma.PrismaClientKnownRequestError:
          if (error.code === PRISMA_ERROR_CODE.ALREADY_EXIST) {
            throw new RpcException(new BadRequestException(createMessage(messages.COMMON.ALREADY_EXIST)));
          }
          throw error;
        default:
          throw error;
      }
    });
  };
}
