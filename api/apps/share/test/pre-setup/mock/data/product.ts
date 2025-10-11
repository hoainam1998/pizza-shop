import prisma, { Status, Unit } from 'generated/prisma';

export const product: any = {
  product_id: Date.now().toString(),
  name: 'product name',
  avatar: 'avatar',
  count: 1,
  price: 100000,
  original_price: 5000,
  status: Status.IN_STOCK,
  expired_time: (Date.now() + 1000 * 60 * 60).toString(),
  category_id: Date.now().toString(),
  category: {
    category_id: Date.now().toString(),
    name: 'category name',
    avatar: 'avatar',
  },
  ingredients: [
    JSON.stringify({ ingredientId: '1757410124885', amount: 2, unit: 'GRAM' }),
    JSON.stringify({ ingredientId: '1757582086529', amount: 2, unit: 'GRAM' }),
  ],
  product_ingredient: [
    {
      ingredient_id: Date.now().toString(),
      count: 2,
      unit: Unit.GRAM,
      ingredient: {
        name: 'ingredient name',
        avatar: 'ingredient avatar',
      },
    },
  ],
  _count: {
    bill_detail: 0,
  },
};

export const createProductList = (length: number): prisma.product[] => {
  return Array.apply(this, Array(length)).map(() => product);
};
