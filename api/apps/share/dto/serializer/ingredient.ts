import { Exclude, Expose } from 'class-transformer';
import { IsInt, IsString, IsNumberString, IsArray } from 'class-validator';
import { ingredient, Status, Unit } from 'generated/prisma';

export class Ingredient implements ingredient {
  @Exclude({ toPlainOnly: true })
  @IsNumberString()
  ingredient_id: string;

  @IsString()
  name: string;

  @IsString()
  avatar: string;

  @Expose({ groups: ['unit'] })
  @IsString()
  unit: Unit;

  @IsInt()
  price: number;

  @IsNumberString()
  expired_time: string;

  @IsString()
  status: Status;

  @IsInt()
  count: number;

  @Expose({ toPlainOnly: true, groups: ['units'] })
  get units() {
    if (this.unit === Unit.KG) {
      return [Unit.KG, Unit.GRAM];
    }
    return [Unit.CAN];
  }

  @Expose()
  get ingredientId() {
    return this.ingredient_id;
  }
}

export class IngredientList {
  @IsArray()
  private _list: Ingredient[];

  constructor(ingredients: Omit<Ingredient, 'units' | 'ingredientId'>[]) {
    Object.assign(this, { _list: ingredients });
  }

  get List() {
    return this._list;
  }
}
