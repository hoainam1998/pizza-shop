import { BadRequestException, FileTypeValidator, ParseFilePipe, UploadedFile } from '@nestjs/common';
import { ImageTransformPipe } from '@share/pipes';

export default function UploadImage(
  fieldName: string,
  imageTransformPipe: typeof ImageTransformPipe,
): ParameterDecorator {
  return UploadedFile(
    new ParseFilePipe({
      validators: [new FileTypeValidator({ fileType: /image\/(jpeg|png)/ })],
      exceptionFactory: (error) => {
        if (error === 'File is required') {
          throw new BadRequestException({ message: `${fieldName} is missing!` });
        }
        return error;
      },
    }),
    imageTransformPipe,
  );
}
