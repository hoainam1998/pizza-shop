import { CategoryBody, CategoryPaginationResponse } from '@share/interfaces';
import { IsNumber, IsPositive, IsArray, ArrayNotEmpty, ValidateNested } from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';

export class CategoryPaginationSerializer {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  list: Required<CategoryBody>[];

  @IsNumber()
  @IsPositive()
  total: number;

  constructor(o: CategoryPaginationResponse) {
    Object.assign(this, o);
  }
}

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
  @Type(() => CategoryFormatter)
  list: CategoryFormatter[];

  total: number;
}
