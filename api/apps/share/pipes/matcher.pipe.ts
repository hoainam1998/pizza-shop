import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export default class MatcherPipe implements PipeTransform {
  constructor(private contains: string[]) {}

  transform(value: string) {
    if (this.contains.includes(value)) {
      return value;
    }
    throw new BadRequestException(`"Of" must be include in [${this.contains.join(', ').trim()}]`);
  }
}
