import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { createMessage } from '@share/utils';
import { Response } from 'express';
import { MessageResponseType } from '@share/interfaces';
import messages from '@share/constants/messages';

@Catch(HttpException)
export default class PrismaDisconnectExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const next = ctx.getNext();
    const exceptionResponse: MessageResponseType = exception.getResponse() as MessageResponseType;

    if (exceptionResponse.message) {
      if (exceptionResponse.message.includes("Can't reach database server ")) {
        return response.status(HttpStatus.BAD_REQUEST).json(createMessage(messages.COMMON.DATABASE_DISCONNECT));
      }
    }

    return next();
  }
}
