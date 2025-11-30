import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import messages from '@share/constants/messages';
import { createMessages } from '@share/utils';

@Catch(HttpException)
export default class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const next = ctx.getNext();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    if (typeof exceptionResponse === 'string' && exceptionResponse.includes('ThrottlerException')) {
      return response.status(HttpStatus.BAD_REQUEST).json(createMessages(messages.COMMON.THROTTLER_ERROR));
    }

    if (status === HttpStatus.NOT_FOUND) {
      let responseData;
      if (Object.hasOwn(exceptionResponse, 'response')) {
        if (Object.hasOwn(exceptionResponse.response, 'message')) {
          responseData = exceptionResponse.response.message;
        } else {
          responseData = exceptionResponse.response;
        }
      } else if (Object.hasOwn(exceptionResponse || {}, 'message')) {
        responseData = exceptionResponse.message;
      } else {
        responseData = 'Unknown error!';
      }

      if (typeof responseData === 'string') {
        return response.status(status).json(createMessages(responseData));
      }
      return response.status(status).json(responseData);
    }

    if (Object.hasOwn(exceptionResponse, 'messages')) {
      if (Object.keys(exceptionResponse).length > 1) {
        return response.status(status).json(exceptionResponse);
      }
      return response.status(status).json(createMessages(exceptionResponse.messages));
    } else {
      if (exceptionResponse.message.includes("Can't reach database server")) {
        return response.status(HttpStatus.BAD_REQUEST).json(createMessages(messages.COMMON.DATABASE_DISCONNECT));
      } else if (Object.keys(exceptionResponse).length > 1) {
        const messages = [exceptionResponse.message];
        delete exceptionResponse.message;
        delete exceptionResponse.statusCode;
        delete exceptionResponse.error;
        return response.status(status).json({ messages, ...exceptionResponse });
      } else if ([exceptionResponse.message].flat().length) {
        return response.status(status).json(createMessages([exceptionResponse.message].flat()));
      } else {
        return next();
      }
    }
  }
}
