import { IsNumber, IsPositive, IsArray, IsString, ArrayNotEmpty, IsOptional } from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';

export class CategoryFormatter {
  @Exclude({ toPlainOnly: true })
  _count: {
    product: 0;
  };

  @Exclude({ toPlainOnly: true })
  category_id: string;

  @Expose()
  get categoryId() {
    return this.category_id;
  }

  @Expose()
  get disabled() {
    return this._count.product > 0;
  }
}

export class CategoryPaginationFormatter {
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => CategoryFormatter)
  list: CategoryFormatter[];

  @IsNumber()
  @IsPositive()
  total: number;

  constructor(target: CategoryPaginationFormatter) {
    Object.assign(this, target);
  }
}

export class CategoryDetailSerializer {
  @Exclude({ toPlainOnly: true })
  @IsOptional()
  @IsString()
  category_id: string;

  @IsString()
  name: string;

  @IsString()
  avatar: string;

  constructor(target: CategoryDetailSerializer) {
    Object.assign(this, target);
  }

  @Expose({ toPlainOnly: true })
  get categoryId() {
    return this.category_id;
  }
}

export class Categories {
  @IsArray()
  _list: CategoryDetailSerializer[];

  constructor(list: Omit<CategoryDetailSerializer, 'categoryId'>[]) {
    Object.assign(this, { _list: list });
  }

  get List() {
    return this._list;
  }
}
