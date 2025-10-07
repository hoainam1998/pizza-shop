import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { createMessage } from '@share/utils';
import { Response } from 'express';
import messages from '@share/constants/messages';

@Catch(HttpException)
export default class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const next = ctx.getNext();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    if (status === HttpStatus.NOT_FOUND) {
      const responseData = Object.hasOwn(exceptionResponse.response, 'message')
        ? exceptionResponse.response.message
        : exceptionResponse.response;
      if (typeof responseData === 'string') {
        return response.status(status).json(createMessage(responseData));
      }
      return response.status(status).json(responseData);
    }

    if (Object.hasOwn(exceptionResponse, 'messages')) {
      return response.status(status).json(exceptionResponse.messages);
    } else {
      if (exceptionResponse.message.includes("Can't reach database server")) {
        return response.status(HttpStatus.BAD_REQUEST).json(createMessage(messages.COMMON.DATABASE_DISCONNECT));
      }

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
