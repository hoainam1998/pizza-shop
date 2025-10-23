import { Expose, Transform, Exclude } from 'class-transformer';
import { IsString, IsInt, IsNumberString, IsArray, IsBoolean, IsOptional, IsPositive } from 'class-validator';
import { type ProductIngredientType, type IngredientSelectType } from '@share/interfaces';

export class IngredientCreate {
  @IsString()
  name: string;

  @IsString()
  unit: string;

  @IsOptional()
  avatar: string;

  @Transform(({ value }) => +value)
  @IsPositive()
  count: number;

  @Transform(({ value }) => +value)
  @IsPositive()
  price: number;

  @Exclude({ toPlainOnly: true })
  @IsNumberString()
  expiredTime: string;

  @Expose({ toPlainOnly: true })
  get expired_time() {
    return this.expiredTime;
  }
}

export class ProductIngredients implements ProductIngredientType {
  @IsNumberString()
  ingredientId: string;

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

export class IngredientSelect implements IngredientSelectType {
  @IsOptional()
  @IsBoolean()
  name: boolean;

  @IsOptional()
  @IsBoolean()
  avatar: boolean;

  @IsOptional()
  @IsBoolean()
  unit: boolean;

  @IsOptional()
  @IsBoolean()
  count: boolean;

  @IsOptional()
  @IsBoolean()
  expired_time: boolean;

  @IsOptional()
  @IsBoolean()
  status: boolean;

  @IsOptional()
  @IsBoolean()
  price: boolean;

  @IsOptional()
  @IsBoolean()
  units: boolean;
}
