import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { IsString, IsInt, IsNumberString, IsArray, IsBoolean, IsOptional, IsDefined } from 'class-validator';
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
  originalPrice: boolean;

  @IsOptional()
  @IsBoolean()
  status: boolean;

  @IsOptional()
  @IsBoolean()
  expiredTime: boolean;

  @IsOptional()
  @IsBoolean()
  category: boolean;

  @IsOptional()
  @IsBoolean()
  categoryId: boolean;

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
    return this.categoryId;
  }

  constructor() {
    if (Object.values(this).every((v) => v === undefined)) {
      this.name = true;
      this.count = true;
      this.price = true;
      this.originalPrice = true;
      this.status = true;
      this.expiredTime = true;
      this.category = true;
      this.categoryId = true;
      this.disabled = true;
    }
  }
}

export class ProductQueryTransform extends OmitType(ProductQuery, [
  'ingredients',
  'category',
  'originalPrice',
  'expiredTime',
  'categoryId',
  'disabled',
]) {
  @Exclude()
  ingredients: boolean;

  @Exclude()
  disabled: boolean;

  @Expose()
  category: boolean;

  @Expose()
  product_id: boolean;

  @Exclude()
  expiredTime: boolean;

  @Exclude()
  originalPrice: boolean;

  @Exclude()
  categoryId: boolean;
}

export class ProductSelect extends Pagination {
  @IsDefined()
  @Type(() => ProductQuery)
  query: ProductQuery;

  @IsOptional()
  @IsString()
  search: string;
}
