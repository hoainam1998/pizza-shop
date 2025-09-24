import { ProductPaginationResponse } from '@share/interfaces';
import { Exclude, Expose, Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

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

  @Expose({ toPlainOnly: true })
  get ingredients() {
    return this.product_ingredient.map((ingredient) => ({
      ingredientId: ingredient.ingredient_id,
      amount: ingredient.count,
      unit: ingredient.unit,
      avatar: ingredient.ingredient.avatar,
      name: ingredient.ingredient.name,
    }));
  }

  @Expose()
  get productId() {
    return this.product_id;
  }

  @Expose()
  get categoryId() {
    return this.category_id;
  }

  @Expose()
  get expiredTime() {
    return this.expired_time;
  }

  @Expose()
  get originalPrice() {
    return this.original_price;
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
