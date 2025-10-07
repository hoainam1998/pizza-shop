import { BadRequestException, FileTypeValidator, ParseFilePipe, UploadedFile } from '@nestjs/common';
import { ImageTransformPipe, FileSizeValidationPipe } from '@share/pipes';
import { createMessage } from '@share/utils';
import messages from '@share/constants/messages';

export default function UploadImage(
  fieldName: string,
  imageTransformPipe: typeof ImageTransformPipe,
): ParameterDecorator {
  return UploadedFile(
    new ParseFilePipe({
      validators: [new FileTypeValidator({ fileType: /image\/(jpeg|jpg|png)/, skipMagicNumbersValidation: true })],
      exceptionFactory: (error) => {
        if (error === 'File is required') {
          throw new BadRequestException(createMessage(`${fieldName} is missing!`));
        } else if (error.includes('Validation failed')) {
          throw new BadRequestException(createMessage(messages.COMMON.FILE_TYPE_INVALID));
        }
        return error;
      },
    }),
    new FileSizeValidationPipe(),
    imageTransformPipe,
  );
}
