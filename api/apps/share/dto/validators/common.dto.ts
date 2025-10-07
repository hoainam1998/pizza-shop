import { IsNumber } from 'class-validator';

export abstract class Pagination {
  @IsNumber()
  pageSize: number;

  @IsNumber()
  pageNumber: number;

  abstract query: unknown;
}
