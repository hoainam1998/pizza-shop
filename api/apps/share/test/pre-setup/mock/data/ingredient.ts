import { Status, Unit } from 'generated/prisma';
import { type ProductIngredientType } from '@share/interfaces';

export const ingredient = {
  ingredient_id: Date.now().toString(),
  name: 'ingredient name',
  price: 10000,
  unit: Unit.GRAM,
  avatar: 'ingredient_avatar',
  count: 10,
  status: Status.IN_STOCK,
  expired_time: (Date.now() + 60 * 1000).toString(),
};

export const createIngredientsJson = (length: number): string[] => {
  return Array.apply(this, Array(length)).map(() => JSON.stringify(ingredient));
};

export const createIngredients = (length: number): (typeof ingredient)[] => {
  return Array.apply(this, Array(length)).map(() => ingredient);
};

export const createProductIngredients = (length: number): ProductIngredientType[] => {
  return Array.apply(this, Array(length)).map((_, index) => ({
    ingredientId: (Date.now() + index).toString(),
    amount: 5,
    unit: Unit.GRAM,
  }));
};

export const createRedisProductIngredients = (length: number): Record<string, string> => {
  return Array.apply(this, Array(length)).reduce<Record<string, string>>((data, _, index) => {
    const ingredientId = +ingredient.ingredient_id * (index * 1000);
    data[ingredientId] = JSON.stringify({ ...ingredient, ingredient_id: ingredientId });
    return data;
  }, {});
};
