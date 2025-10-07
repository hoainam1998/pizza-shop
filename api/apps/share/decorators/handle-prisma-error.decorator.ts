import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import messages from '@share/constants/messages';
import { PRISMA_ERROR_CODE } from '@share/enums';
import { createMessage } from '@share/utils';
import { Prisma } from 'generated/prisma';

export default (msgs: any) => (target: any, propertyName: string, descriptor: TypedPropertyDescriptor<any>) => {
  const originMethod = descriptor.value;
  descriptor.value = function (...args: any[]) {
    return originMethod?.apply(this, args).catch((error: Error) => {
      switch (true) {
        case error instanceof Prisma.PrismaClientInitializationError:
          if (error.errorCode === PRISMA_ERROR_CODE.DATABASE_LOST_CONNECT) {
            throw new RpcException(new BadRequestException(createMessage(error.message)));
          }
          throw error;
        case error instanceof Prisma.PrismaClientValidationError:
          throw new RpcException(new BadRequestException(createMessage(messages.COMMON.MUTATING_DATABASE_ERROR)));
        case error instanceof Prisma.PrismaClientKnownRequestError:
          if (error.code === PRISMA_ERROR_CODE.ALREADY_EXIST) {
            throw new RpcException(new BadRequestException(createMessage(messages.COMMON.ALREADY_EXIST)));
          } else if (error.code === PRISMA_ERROR_CODE.NOT_FOUND) {
            throw new RpcException(new NotFoundException(msgs.NOT_FOUND));
          }
          throw error;
        default:
          throw error;
      }
    });
  };
};
