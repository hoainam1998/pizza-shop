import { ProductPaginationResponse } from '@share/interfaces';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { IsArray, IsInt, IsObject, IsOptional, IsString } from 'class-validator';

export class ProductSerializer {
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
  @IsInt()
  @Exclude({ toPlainOnly: true })
  expired_time: number;

  @IsOptional()
  @IsString()
  avatar: string;

  @IsObject()
  @IsString()
  @Exclude({ toPlainOnly: true })
  _count: object;

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

  @Expose()
  @Transform(({ value }) => ({ name: value.name, categoryId: value.category_id, avatar: value.avatar }), {
    toPlainOnly: true,
  })
  category: any;

  @Expose()
  get expiredTime() {
    return this.expired_time;
  }

  @Expose()
  get originalPrice() {
    return this.original_price;
  }

  @Expose()
  get disabled() {
    if (this._count) {
      return Object.values(this._count).some((v) => v > 0);
    }
  }
}

export class PaginationProductSerializer {
  @IsInt()
  total: number;

  @IsArray()
  @Type(() => ProductSerializer)
  list: ProductPaginationResponse['list'];

  constructor(results: ProductPaginationResponse) {
    if (results) {
      this.total = results.total;
      this.list = results.list;
    }
  }
}
