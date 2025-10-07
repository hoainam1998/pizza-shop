import { BadRequestException, HttpStatus, NotFoundException } from '@nestjs/common';
import { MicroservicesErrorResponse } from '@share/interfaces';
import { createMessage } from '@share/utils';
import { catchError } from 'rxjs';

export default function (target: any, propertyName: string, descriptor: TypedPropertyDescriptor<any>) {
  const originMethod = descriptor.value!;
  descriptor.value = function (...args: any[]) {
    return originMethod.apply(this, args).pipe(
      catchError((error: MicroservicesErrorResponse) => {
        switch (error.status) {
          case HttpStatus.NOT_FOUND:
            throw new NotFoundException(error);
          case HttpStatus.INTERNAL_SERVER_ERROR:
            throw error;
          default:
            if (error instanceof BadRequestException) {
              throw error;
            }
            throw new BadRequestException(createMessage(error.message));
        }
      }),
    );
  };
  return descriptor;
}
