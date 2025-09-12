import { Expose, Transform } from 'class-transformer';
import { IsString, IsInt, IsNumberString, IsArray } from 'class-validator';
import { type ProductIngredient } from '@share/interfaces';

export class IngredientCreate {
  @IsString()
  name: string;

  @IsString()
  unit: string;

  @IsInt()
  @Transform(({ value }) => +value)
  count: number;

  @IsInt()
  @Transform(({ value }) => +value)
  price: number;

  @IsString()
  expiredTime: string;

  @Expose({ toPlainOnly: true })
  get expired_time() {
    return this.expiredTime;
  }
}

export class ProductIngredients implements ProductIngredient {
  @IsNumberString()
  id: string;

  @IsInt()
  amount: number;

  @IsString()
  unit: string;
}

export class ComputeProductPrice {
  @IsNumberString()
  temporaryProductId: string;

  @IsArray()
  productIngredients: ProductIngredients[];
}
