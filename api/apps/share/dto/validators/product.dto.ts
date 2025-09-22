import { Exclude, Expose, Transform } from 'class-transformer';
import { IsString, IsInt, IsNumberString, IsArray } from 'class-validator';
import { OmitType } from '@nestjs/mapped-types';
import { Status } from 'generated/prisma';

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
