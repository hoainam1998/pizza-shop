import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import messages from '@share/constants/messages';
import { createMessage } from '@share/utils';

export default function (target: any, propertyName: string, descriptor: TypedPropertyDescriptor<any>) {
  const originMethod = descriptor.value!;
  descriptor.value = function (...args: any[]) {
    return originMethod.apply(this, args).catch((error: any) => {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw new RpcException(error);
      }

      this.logger.error(error.message, propertyName);
      if (error instanceof RpcException) {
        throw error;
      } else if (error instanceof HttpException) {
        throw new RpcException(error);
      }
      throw new RpcException(new BadRequestException(createMessage(messages.COMMON.COMMON_ERROR)));
    });
  };
  return descriptor;
}
