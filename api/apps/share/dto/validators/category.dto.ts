import { OmitType } from '@nestjs/mapped-types';
import { Exclude, Expose, instanceToPlain, plainToInstance, Transform, Type } from 'class-transformer';
import { IsDefined, IsString, IsNumber, IsOptional, IsBoolean, Length } from 'class-validator';

export class CreateCategory {
  @IsDefined()
  @IsString()
  name: string;

  @Exclude({ toPlainOnly: true })
  @IsString()
  @Length(13)
  @IsOptional()
  @Transform(({ value }) => (value ? value : Date.now().toString()))
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

  @Expose({ toClassOnly: true })
  @IsBoolean()
  @IsOptional()
  disabled: boolean;

  @Expose({ toPlainOnly: true, groups: ['include_id'] })
  get category_id() {
    return true;
  }

  @Expose({ toPlainOnly: true })
  get _count() {
    if (this.disabled) {
      return {
        select: {
          product: true,
        },
      };
    }
    return false;
  }

  constructor() {
    if (Object.values(this).every((v) => v === undefined)) {
      this.name = true;
      this.avatar = true;
    }
  }

  static plainWithIncludeId(target: CategoryQuery) {
    const query = instanceToPlain(plainToInstance(CategoryQuery, target), { groups: ['include_id'] });
    const queryExcludeDisabled = instanceToPlain(plainToInstance(CategoryQueryTransform, query));
    return queryExcludeDisabled;
  }
}

export class CategoryQueryTransform extends OmitType(CategoryQuery, ['disabled']) {
  @Exclude()
  disabled: true;

  @Expose()
  category_id: true;
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
