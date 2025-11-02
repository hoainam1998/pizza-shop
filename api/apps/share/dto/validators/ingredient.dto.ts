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
  @Transform(({ value, obj }) => (obj.units ? true : value))
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
  @Exclude({ toPlainOnly: true })
  units: boolean;

  @Expose()
  get ingredient_id() {
    return true;
  }

  static plain(target: IngredientSelect): IngredientSelect {
    if (
      Object.entries(target).every(([key, value]) => {
        if (key === 'ingredient_id') {
          return true;
        } else {
          return value === undefined;
        }
      })
    ) {
      target.name = true;
      target.avatar = true;
      target.unit = true;
      target.units = true;
      target.count = true;
      target.expired_time = true;
      target.status = true;
      target.price = true;
      target.units = true;
    }
    return target;
  }
}
