import { ProductPaginationResponse } from '@share/interfaces';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { IsArray, IsInt, IsNumberString, IsObject, IsOptional, IsString } from 'class-validator';
import { product } from 'generated/prisma';
import Validator from './validator';

export class ProductSerializer extends Validator {
  @IsOptional()
  @IsArray()
  @Exclude({ toPlainOnly: true })
  product_ingredient: any[];

  @IsOptional()
  @IsString()
  @Exclude({ toPlainOnly: true })
  product_id: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  count: number;

  @IsOptional()
  @IsInt()
  price: number;

  @IsOptional()
  @IsInt()
  @Exclude({ toPlainOnly: true })
  original_price: number;

  @IsOptional()
  @IsString()
  @Exclude({ toPlainOnly: true })
  category_id: number;

  @IsOptional()
  @IsString()
  status: string;

  @IsOptional()
  @IsNumberString()
  @Exclude({ toPlainOnly: true })
  expired_time: number;

  @IsOptional()
  @IsString()
  avatar: string;

  @IsOptional()
  @IsObject()
  @Exclude({ toPlainOnly: true })
  _count: {
    bill_detail: number;
  };

  @Expose({ toPlainOnly: true })
  get ingredients() {
    if (this.product_ingredient) {
      return this.product_ingredient.map((ingredient) => ({
        ingredientId: ingredient.ingredient_id,
        amount: ingredient.count,
        unit: ingredient.unit,
        avatar: ingredient.ingredient.avatar,
        name: ingredient.ingredient.name,
      }));
    }
  }

  @Expose()
  get productId() {
    return this.product_id;
  }

  @IsOptional()
  @IsObject()
  @Expose()
  @Transform(
    ({ value }) => (value ? { name: value.name, categoryId: value.category_id, avatar: value.avatar } : undefined),
    {
      toPlainOnly: true,
    },
  )
  category: object;

  @Expose()
  get expiredTime() {
    return this.expired_time;
  }

  @Expose()
  get originalPrice() {
    return this.original_price;
  }

  @Expose()
  get categoryId() {
    return this.category_id;
  }

  @Expose({ groups: ['disabled'] })
  @Expose()
  get disabled() {
    if (this._count) {
      return Object.values(this._count).some((v) => v > 0);
    }
  }

  @Expose({ groups: ['bought'] })
  get bought() {
    if (this._count) {
      return this._count.bill_detail;
    }
  }

  constructor(target: product) {
    super();
    Object.assign(this, target);
  }
}

export class PaginationProductSerializer extends Validator {
  @IsInt()
  total: number;

  @IsArray()
  @Type(() => ProductSerializer)
  list: ProductPaginationResponse['list'];

  constructor(results: ProductPaginationResponse) {
    super();
    if (results) {
      this.total = results.total;
      this.list = results.list;
    }
  }
}
