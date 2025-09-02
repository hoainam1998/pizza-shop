import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { createMessage } from '@share/utils';
import { Response } from 'express';
import { MessageResponse } from '@share/interfaces';

@Catch(HttpException)
export default class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse: MessageResponse = exception.getResponse() as MessageResponse;

    if (status === HttpStatus.NOT_FOUND) {
      return response.status(status).json(exceptionResponse);
    }

    const msg: string = [exceptionResponse.message].flat().reduce((messages, message) => {
      messages += message;
      return messages;
    }, '');

    response.status(status).json(createMessage(msg));
  }
}
