import { Exclude, Expose, instanceToPlain, plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsString,
  IsInt,
  IsNumberString,
  IsArray,
  IsBoolean,
  IsOptional,
  IsDefined,
  IsPositive,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { OmitType } from '@nestjs/mapped-types';
import { Status } from 'generated/prisma';
import { Pagination } from './common.dto';

class IngredientSelect {
  @IsOptional()
  @IsBoolean()
  count: boolean;

  @IsOptional()
  @IsBoolean()
  unit: boolean;

  @IsOptional()
  @IsBoolean()
  name: boolean;

  @IsOptional()
  @IsBoolean()
  avatar: boolean;
}

export class ProductCreate {
  @IsDefined()
  @IsNumberString()
  productId: string;

  @IsString()
  name: string;

  @Transform(({ value }) => +value)
  @IsPositive()
  @IsInt()
  count: number;

  @Transform(({ value }) => +value)
  @IsPositive()
  @IsInt()
  price: number;

  @IsOptional()
  avatar: string;

  @Transform(({ value }) => +value)
  @IsPositive()
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

  @Expose({ groups: ['create'] })
  get status() {
    return Status.IN_STOCK;
  }
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
  @Type(() => IngredientSelect)
  @ValidateNested({ each: true })
  ingredients: IngredientSelect;

  @IsOptional()
  @IsBoolean()
  disabled: boolean;

  @IsOptional()
  @IsBoolean()
  bought: boolean;

  @Expose()
  get product_ingredient() {
    type ProductIngredientPrismaSelect = {
      select: {
        ingredient_id: true;
        ingredient?: {
          select: Record<string, boolean>;
        };
      };
    };
    if (this.ingredients) {
      return Object.entries(this.ingredients).reduce<ProductIngredientPrismaSelect>(
        (select, [key, value], index, arr) => {
          if (value !== undefined) {
            if (['name', 'avatar'].includes(key)) {
              Object.assign(select.select.ingredient!.select, { [key]: value });
            } else {
              Object.assign(select.select, { [key]: value });
            }
          }

          if (arr.length - 1 === index) {
            if (Object.keys(select.select.ingredient!.select).length === 0) {
              delete select.select.ingredient;
            }
          }
          return select;
        },
        {
          select: {
            ingredient_id: true,
            ingredient: {
              select: {},
            },
          },
        },
      );
    }
  }

  @Expose()
  get _count() {
    if (this.disabled || this.bought) {
      return {
        select: {
          bill_detail: true,
        },
      };
    }
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

  static plain(target: any): Record<string, any> {
    if (
      Object.entries(target as object).every(([key, value]) => {
        if (key === 'product_id') {
          return true;
        } else {
          return value == undefined;
        }
      })
    ) {
      target.name = true;
      target.count = true;
      target.price = true;
      target.originalPrice = true;
      target.status = true;
      target.expiredTime = true;
      target.category = true;
      target.categoryId = true;
      target.disabled = true;
      target.bought = true;
    }
    const query = instanceToPlain(plainToInstance(ProductQuery, target));
    return instanceToPlain(plainToInstance(ProductQueryTransform, query), {
      exposeUnsetFields: false,
    });
  }
}

export class ProductQueryTransform extends OmitType(ProductQuery, [
  'ingredients',
  'category',
  'originalPrice',
  'expiredTime',
  'categoryId',
  'disabled',
  'bought',
]) {
  @Exclude()
  ingredients: boolean;

  @Exclude()
  disabled: boolean;

  @Exclude()
  bought: boolean;

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

export class ProductPagination extends Pagination {
  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsNumberString()
  categoryId: string;

  @IsDefined()
  @Type(() => ProductQuery)
  @ValidateNested({ each: true })
  query: ProductQuery;
}

export class ProductPaginationForSale {
  @Expose({ toPlainOnly: true })
  get pageSize() {
    return 10;
  }

  @IsNumber()
  @IsPositive()
  pageNumber: number;

  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsNumberString()
  categoryId: string;

  @IsDefined()
  @Type(() => ProductQuery)
  @ValidateNested({ each: true })
  query: ProductQuery;
}

export class GetProduct {
  @IsDefined()
  @Type(() => ProductQuery)
  @ValidateNested({ each: true })
  query: ProductQuery;

  @IsDefined()
  @IsNumberString()
  productId: string;
}
