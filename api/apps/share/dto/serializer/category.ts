import {
  IsNumber,
  IsPositive,
  IsArray,
  IsString,
  ArrayNotEmpty,
  IsOptional,
  ValidateNested,
  Matches,
} from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';
import { category } from 'generated/prisma';
import Validator from './validator';
import constants from '@share/constants';

export class CategoryDetail extends Validator {
  @Exclude({ toPlainOnly: true })
  @Matches(constants.ID_PATTERN)
  category_id: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  avatar: string;

  @Expose({ toPlainOnly: true })
  get categoryId() {
    return this.category_id;
  }

  constructor(target: category) {
    super();
    Object.assign(this, target);
  }
}

export class CategoryFormatter extends CategoryDetail {
  @IsOptional()
  @Exclude({ toPlainOnly: true })
  _count: {
    product?: number;
  } = {};

  @Expose()
  @IsOptional()
  get disabled() {
    return Object.hasOwn(this._count, 'product') ? this._count.product! > 0 : undefined;
  }

  constructor(target: CategoryFormatter) {
    super(target);
    Object.assign(this, target);
  }
}

export class CategoryPaginationSerializer extends Validator {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CategoryFormatter)
  list: CategoryFormatter[];

  @IsNumber()
  @IsPositive()
  total: number;

  constructor(target: CategoryPaginationSerializer) {
    super();
    if (target) {
      target.list = target.list.map((category) => new CategoryFormatter(category));
    }
    Object.assign(this, target);
  }
}

export class CategoryDetailSerializer extends CategoryDetail {
  constructor(target: Omit<CategoryDetailSerializer, 'categoryId' | 'validate'>) {
    super(target);
    Object.assign(this, target);
  }
}

export class Categories extends Validator {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryDetailSerializer)
  _list: CategoryDetailSerializer[];

  constructor(list: Omit<CategoryDetailSerializer, 'categoryId' | 'validate'>[]) {
    super();
    Object.assign(this, { _list: list.map((category) => new CategoryDetailSerializer(category)) });
  }

  get List() {
    return this._list;
  }
}
