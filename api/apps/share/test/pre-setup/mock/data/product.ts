import { Status } from 'generated/prisma';

export const product = {
  product_id: Date.now().toString(),
  name: 'product name',
  avatar: 'avatar',
  count: 1,
  price: 100000,
  original_price: 5000,
  status: Status.IN_STOCK,
  expired_time: (Date.now() + 1000 * 60 * 60).toString(),
  category_id: Date.now().toString(),
  ingredients: [
    JSON.stringify({ ingredientId: '1757410124885', amount: 2, unit: 'GRAM' }),
    JSON.stringify({ ingredientId: '1757582086529', amount: 2, unit: 'GRAM' }),
  ],
};
