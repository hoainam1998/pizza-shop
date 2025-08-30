import { PipeTransform, Injectable } from '@nestjs/common';
import { convertFileToBase64 } from '@share/utils';

@Injectable()
export default class ImageTransformPipe implements PipeTransform {
  transform(value: Express.Multer.File) {
    return convertFileToBase64(value);
  }
}
