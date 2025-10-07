import { Exclude, Expose, instanceToPlain, plainToInstance, Type } from 'class-transformer';
import { IsDefined, IsString, IsNumber, IsOptional, IsBoolean, Length } from 'class-validator';

export class CreateCategory {
  @IsDefined()
  @IsString()
  name: string;

  @Exclude({ toPlainOnly: true })
  @IsString()
  @Length(13)
  @IsOptional()
  categoryId: string;

  @Expose({ toPlainOnly: true })
  get category_id() {
    return this.categoryId;
  }
}

export class CategoryQuery {
  @IsBoolean()
  @IsOptional()
  name: boolean;

  @IsBoolean()
  @IsOptional()
  avatar: boolean;

  @Expose({ toPlainOnly: true, groups: ['include_id'] })
  get category_id() {
    return true;
  }

  constructor() {
    if (Object.values(this).every((v) => v === undefined)) {
      this.name = true;
      this.avatar = true;
    }
  }

  static plainWithIncludeId(target: CategoryQuery) {
    return instanceToPlain(plainToInstance(CategoryQuery, target), { groups: ['include_id'] });
  }
}

export class PaginationCategory {
  @IsDefined()
  @IsNumber()
  pageSize: number;

  @IsDefined()
  @IsNumber()
  pageNumber: number;

  @IsDefined()
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

  @IsDefined()
  @Type(() => CategoryQuery)
  query: CategoryQuery;
}

export class CategorySelect {
  @IsOptional()
  @IsBoolean()
  name: boolean;

  @IsOptional()
  @IsBoolean()
  avatar: boolean;
}
