import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { createMessage } from '@share/utils';
import { Response } from 'express';
import { MessageResponse } from '@share/interfaces';
import messages from '@share/messages';

@Catch(HttpException)
export default class PrismaDisconnectExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse: MessageResponse = exception.getResponse() as MessageResponse;

    if (exceptionResponse.message.includes("Can't reach database server ")) {
      return response.status(HttpStatus.BAD_REQUEST).json(createMessage(messages.COMMON.DATABASE_DISCONNECT));
    }

    response.status(status).json(exceptionResponse);
  }
}
