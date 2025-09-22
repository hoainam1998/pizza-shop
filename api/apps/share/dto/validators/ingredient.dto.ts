import { Expose, Transform } from 'class-transformer';
import { IsString, IsInt, IsNumberString, IsArray, IsBoolean, IsOptional } from 'class-validator';
import { type ProductIngredientType, type IngredientSelectType } from '@share/interfaces';

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
