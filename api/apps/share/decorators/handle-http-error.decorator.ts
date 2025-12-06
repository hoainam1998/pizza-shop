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
            const errorMessage = error.code === 'ECONNREFUSED' ? messages.COMMON.MODULE_DISCONNECT : error.message;
            throw new BadRequestException(createMessage(errorMessage));
          }
          default:
            throw new InternalServerErrorException();
        }
      }),
    );
  };
  return descriptor;
}
