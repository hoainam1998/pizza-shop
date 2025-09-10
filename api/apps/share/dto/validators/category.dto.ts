import { Type } from 'class-transformer';
import { IsString, IsNumber, ValidateNested, IsOptional, IsBoolean, Length } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsString()
  @Length(13)
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

export class PaginationCategory {
  @IsNumber()
  pageSize: number;

  @IsNumber()
  pageNumber: number;

  @ValidateNested()
  @Type(() => CategoryQuery)
  query: CategoryQuery;
}

export class CategoryDto {
  @IsString()
  @Length(13)
  categoryId: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  avatar: string;
}

export class GetCategory {
  @IsString()
  @Length(13)
  categoryId: string;

  @ValidateNested()
  @Type(() => CategoryQuery)
  query: CategoryQuery;
}
