import { Type } from 'class-transformer';
import { IsString, IsNumber, ValidateNested, IsOptional, IsBoolean } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  categoryId: string;
}

export class CategoryQuery {
  @IsBoolean()
  @IsOptional()
  name: boolean;

  @IsBoolean()
  @IsOptional()
  avatar: boolean;
}

export class SelectCategory {
  @IsNumber()
  pageSize: number;

  @IsNumber()
  pageNumber: number;

  @ValidateNested()
  @Type(() => CategoryQuery)
  query: CategoryQuery;
}
