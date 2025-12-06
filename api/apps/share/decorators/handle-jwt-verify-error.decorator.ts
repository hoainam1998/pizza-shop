import { BadRequestException } from '@nestjs/common';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import messages from '@share/constants/messages';
import { createMessage } from '@share/utils';

export default function (target: any, propertyName: string, descriptor: TypedPropertyDescriptor<any>) {
  const originMethod = descriptor.value!;
  descriptor.value = function (...args: any[]) {
    return originMethod.apply(this, args).catch((error: any) => {
      const isTokenExpiredError = error instanceof TokenExpiredError;
      const isJsonWebTokenError = error instanceof JsonWebTokenError;

      if (isJsonWebTokenError || isTokenExpiredError) {
        let jwtErrorMessage = '';
        switch (error.message) {
          case 'jwt malformed':
            jwtErrorMessage = messages.JWT.MALFORMED;
            break;
          case 'invalid signature':
            jwtErrorMessage = messages.JWT.INVALID;
            break;
          case 'jwt expired':
            jwtErrorMessage = messages.JWT.EXPIRED;
            break;
          default:
            jwtErrorMessage = messages.JWT.UNKNOWN;
            break;
        }
        throw new BadRequestException(createMessage(jwtErrorMessage));
      }
      throw error;
    });
  };
  return descriptor;
}
