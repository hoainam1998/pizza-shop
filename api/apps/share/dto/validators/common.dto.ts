import { IsNumber, IsIn, IsPositive } from 'class-validator';

export abstract class Pagination {
  @IsNumber()
  @IsPositive()
  @IsIn([10, 30, 50])
  pageSize: number;

  @IsNumber()
  @IsPositive()
  pageNumber: number;

  abstract query: unknown;
}
