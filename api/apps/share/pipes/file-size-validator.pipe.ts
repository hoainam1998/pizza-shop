import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import messages from '@share/constants/messages';
import { createMessage } from '@share/utils';

@Injectable()
export default class FileSizeValidationPipe implements PipeTransform {
  transform(value: Express.Multer.File) {
    if (value.size > 10) {
      return value;
    }
    throw new BadRequestException(createMessage(messages.COMMON.EMPTY_FILE.replace(/{fieldname}/, value.fieldname)));
  }
}
