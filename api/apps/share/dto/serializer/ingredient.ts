import { Exclude, Expose, plainToInstance, Type } from 'class-transformer';
import {
  IsInt,
  IsString,
  IsNumberString,
  IsArray,
  ValidateNested,
  IsOptional,
  IsDefined,
  IsObject,
} from 'class-validator';
import { ingredient, Status, Unit } from 'generated/prisma';
import Validator from './validator';
import type { IngredientPaginationResponse, IngredientPrismaOmitType } from '@share/interfaces';

export class Ingredient extends Validator implements ingredient {
  @Exclude({ toPlainOnly: true })
  @IsNumberString()
  ingredient_id: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  avatar: string;

  @IsOptional()
  @Expose({ groups: ['unit'] })
  @IsString()
  unit: Unit;

  @IsOptional()
  @IsInt()
  price: number;

  @IsOptional()
  @IsNumberString()
  @Exclude({ toPlainOnly: true })
  expired_time: string;

  @IsOptional()
  @IsString()
  status: Status;

  @IsOptional()
  @IsInt()
  count: number;

  @IsOptional()
  @Expose({ toPlainOnly: true, groups: ['units'] })
  get units() {
    if (this.unit !== undefined) {
      return this.unit === Unit.KG ? [Unit.KG, Unit.GRAM] : [Unit.CAN];
    }
  }

  @Expose()
  @IsOptional()
  get ingredientId() {
    return this.ingredient_id;
  }

  @IsOptional()
  @IsObject()
  @Exclude({ toPlainOnly: true })
  _count: any;

  @Expose({ toPlainOnly: true })
  get disabled() {
    return Object.hasOwn(this._count || {}, 'product_ingredient') ? this._count.product_ingredient > 0 : undefined;
  }

  @Expose({ toPlainOnly: true })
  get expiredTime() {
    return this.expired_time;
  }

  constructor(ingredient: IngredientPrismaOmitType) {
    super();
    Object.assign(this, ingredient);
  }
}

export class IngredientList extends Validator {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Ingredient)
  private _list: Ingredient[];

  constructor(ingredients: IngredientPrismaOmitType[]) {
    super();
    Object.assign(this, { _list: ingredients.map((ingredient) => new Ingredient(ingredient)) });
  }

  get List() {
    return this._list;
  }
}

export class PaginationIngredientSerializer extends Validator {
  @IsDefined()
  @IsInt()
  total: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Ingredient)
  list: Ingredient[];

  constructor(results: IngredientPaginationResponse) {
    super();
    if (results) {
      this.total = results.total;
      this.list = results.list.map((ingredient) => plainToInstance(Ingredient, ingredient, { groups: ['unit'] }));
    }
  }
}
