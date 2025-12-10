import {
  BadRequestException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { catchError } from 'rxjs';
import { MicroservicesErrorResponse } from '@share/interfaces';
import { createMessage } from '@share/utils';
import messages from '@share/constants/messages';

export default function (target: any, propertyName: string, descriptor: TypedPropertyDescriptor<any>) {
  const originMethod = descriptor.value!;
  descriptor.value = function (...args: any[]) {
    return originMethod.apply(this, args).pipe(
      catchError((error: MicroservicesErrorResponse) => {
        switch (error.status) {
          case HttpStatus.NOT_FOUND:
            throw new NotFoundException(error);
          case HttpStatus.UNAUTHORIZED:
            throw new UnauthorizedException(createMessage(error.message));
          case HttpStatus.BAD_REQUEST: {
            throw new BadRequestException(createMessage(error.message));
          }
          default:
            if (error.code === 'ECONNREFUSED') {
              throw new BadRequestException(createMessage(messages.COMMON.MODULE_DISCONNECT));
            }
            throw new InternalServerErrorException();
        }
      }),
    );
  };
  return descriptor;
}
