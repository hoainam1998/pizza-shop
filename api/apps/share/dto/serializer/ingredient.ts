import { Exclude, Expose, Type } from 'class-transformer';
import { IsInt, IsString, IsNumberString, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { ingredient, Status, Unit } from 'generated/prisma';
import Validator from './validator';

export class Ingredient implements ingredient {
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
    return this.unit === Unit.KG ? [Unit.KG, Unit.GRAM] : [Unit.CAN];
  }

  @Expose()
  @IsOptional()
  get ingredientId() {
    return this.ingredient_id;
  }

  constructor(ingredient: Omit<Ingredient, 'units' | 'ingredientId'>) {
    Object.assign(this, ingredient);
  }
}

export class IngredientList extends Validator {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Ingredient)
  private _list: Ingredient[];

  constructor(ingredients: Omit<Ingredient, 'units' | 'ingredientId'>[]) {
    super();
    Object.assign(this, { _list: ingredients.map((ingredient) => new Ingredient(ingredient)) });
  }

  get List() {
    return this._list;
  }
}
