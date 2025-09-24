import { IsNumber, IsNumberString, Length } from 'class-validator';

export class FindOneParam {
  @IsNumberString()
  @Length(13)
  id: string;
}

export abstract class Pagination {
  @IsNumber()
  pageSize: number;

  @IsNumber()
  pageNumber: number;

  abstract query: unknown;
}
