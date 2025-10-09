import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { IsString, IsInt, IsNumberString, IsArray, IsBoolean, IsOptional } from 'class-validator';
import { OmitType } from '@nestjs/mapped-types';
import { Status } from 'generated/prisma';
import { Pagination } from './common.dto';

export class ProductCreate {
  @IsString()
  productId: string;

  @IsString()
  name: string;

  @Transform(({ value }) => +value)
  @IsInt()
  count: number;

  @Transform(({ value }) => +value)
  @IsInt()
  price: number;

  @IsOptional()
  avatar: string;

  @Transform(({ value }) => +value)
  @IsInt()
  originalPrice: number;

  @IsNumberString()
  expiredTime: string;

  @IsString()
  category: string;

  @IsArray()
  ingredients: string[];

  @Expose()
  get expired_time() {
    return this.expiredTime;
  }

  @Expose()
  get original_price() {
    return this.originalPrice;
  }

  @Expose()
  get category_id() {
    return this.category;
  }

  @Expose()
  get product_id() {
    return this.productId;
  }

  @Expose()
  get product_ingredient() {
    return {
      create: this.ingredients.map((i) => {
        const ingredient = JSON.parse(i);
        return {
          ingredient_id: ingredient.ingredientId,
          count: ingredient.amount,
          unit: ingredient.unit,
        };
      }),
    };
  }
}

export class ProductCreateTransform extends OmitType(ProductCreate, [
  'originalPrice',
  'expiredTime',
  'ingredients',
  'category',
  'productId',
]) {
  @Exclude()
  ingredients: any[];

  @Expose()
  avatar: string;

  @Exclude()
  originalPrice: number;

  @Exclude()
  expiredTime: number;

  @Exclude()
  category: string;

  @Exclude()
  productId: string;

  status = Status.IN_STOCK;
}

export class ProductQuery {
  @IsOptional()
  @IsBoolean()
  name: boolean;

  @IsOptional()
  @IsBoolean()
  avatar: boolean;

  @IsOptional()
  @IsBoolean()
  count: boolean;

  @IsOptional()
  @IsBoolean()
  price: boolean;

  @IsOptional()
  @IsBoolean()
  original_price: boolean;

  @IsOptional()
  @IsBoolean()
  status: boolean;

  @IsOptional()
  @IsBoolean()
  expired_time: boolean;

  @IsOptional()
  @IsBoolean()
  category: boolean;

  @IsOptional()
  @IsBoolean()
  category_id: boolean;

  @IsOptional()
  @IsBoolean()
  ingredients: boolean;

  @IsOptional()
  @IsBoolean()
  disabled: boolean;

  @Expose()
  get product_ingredient() {
    if (this.ingredients) {
      return {
        select: {
          ingredient_id: true,
          count: true,
          unit: true,
          ingredient: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
      };
    }
  }

  @Expose()
  get _count() {
    if (this.disabled) {
      return {
        select: {
          bill_detail: true,
        },
      };
    }
    return false;
  }

  @Expose()
  get product_id() {
    return true;
  }
}

export class ProductQueryTransform extends OmitType(ProductQuery, ['ingredients', 'category']) {
  @Exclude()
  ingredients: boolean;

  @Exclude()
  disabled: boolean;

  @Expose()
  category: boolean;

  @Expose()
  product_id: boolean;
}

export class ProductSelect extends Pagination {
  @Type(() => ProductQuery)
  query: ProductQuery;

  @IsOptional()
  @IsString()
  search: string;
}
