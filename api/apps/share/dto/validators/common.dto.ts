import { IsNumberString, Length } from 'class-validator';

export class FindOneParam {
  @IsNumberString()
  @Length(13)
  id: string;
}
