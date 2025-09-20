import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { createMessage } from '@share/utils';
import { Response } from 'express';
import { MessageResponseType } from '@share/interfaces';

@Catch(HttpException)
export default class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const next = ctx.getNext();
    const status = exception.getStatus();
    const exceptionResponse: MessageResponseType = exception.getResponse() as MessageResponseType;

    if (status === HttpStatus.NOT_FOUND) {
      return response.status(status).json(exceptionResponse.message);
    }

    const msg: string = [exceptionResponse.message].flat().reduce((messages, message) => {
      messages += message;
      return messages;
    }, '');

    if (msg.length) {
      return response.status(status).json(createMessage(msg));
    } else {
      return next();
    }
  }
}
