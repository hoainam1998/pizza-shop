import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { createMessage } from '@share/utils';
import messages from '@share/constants/messages';

@Injectable()
export default class ValidationPipe implements PipeTransform {
  transform(value: string) {
    if (/\d{13}/.test(value)) {
      return value;
    }
    throw new BadRequestException(createMessage(messages.COMMON.VALIDATE_ID_FAIL));
  }
}
