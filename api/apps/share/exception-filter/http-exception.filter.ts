import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { createMessage } from '@share/utils';
import { Response } from 'express';
import { MessageResponseType, ValidationCustomErrorType } from '@share/interfaces';

type ExceptionResponseType = MessageResponseType & ValidationCustomErrorType;

@Catch(HttpException)
export default class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const next = ctx.getNext();
    const status = exception.getStatus();
    const exceptionResponse: ExceptionResponseType = exception.getResponse() as ExceptionResponseType;

    if (status === HttpStatus.NOT_FOUND) {
      return response.status(status).json(exceptionResponse.message);
    }

    if (Object.hasOwn(exceptionResponse, 'messages')) {
      return response.status(status).json(exceptionResponse.messages);
    } else {
      const msg: string = [exceptionResponse.message].flat().reduce((messages, message) => {
        messages += message;
        return messages;
      }, '');

      if (msg.trim().length) {
        return response.status(status).json(createMessage(msg));
      } else {
        return next();
      }
    }
  }
}
