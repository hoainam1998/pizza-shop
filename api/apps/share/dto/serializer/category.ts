import {
  IsNumber,
  IsPositive,
  IsArray,
  IsString,
  ArrayNotEmpty,
  IsOptional,
  ValidateNested,
  IsNumberString,
} from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';
import Validator from './validator';

export class CategoryDetail extends Validator {
  @Exclude({ toPlainOnly: true })
  @IsNumberString()
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
}

export class CategoryFormatter extends CategoryDetail {
  @IsOptional()
  @Exclude({ toPlainOnly: true })
  _count: any = {};

  @Expose()
  @IsOptional()
  get disabled() {
    return Object.hasOwn(this._count, 'product') ? this._count.product > 0 : undefined;
  }

  constructor(target: any) {
    super();
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
    super();
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
