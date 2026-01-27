import { Status } from 'generated/prisma';
import messages from '@share/constants/messages';
import ErrorCode from '@share/error-code';
import { user } from '@share/test/pre-setup/mock/data/user';

export const total = 10000;

export const products = [
  {
    price: 10000,
    count: 10,
    status: Status.IN_STOCK,
  },
  {
    price: 10000,
    count: 10,
    status: Status.IN_STOCK,
  },
  {
    price: 10000,
    count: 10,
    status: Status.EXPIRED,
  },
  {
    price: 10000,
    count: 10,
    status: Status.IN_STOCK,
  },
  null,
];

export const carts = [
  // price not consistent
  {
    productId: Date.now().toString(),
    price: 200000,
    quantity: 2,
    total: 200000 * 2,
  },
  // overcome limit
  {
    productId: (Date.now() + 1).toString(),
    price: products[1]!.price,
    quantity: 20,
    total: products[1]!.price * 20,
  },
  // disabled
  {
    productId: (Date.now() + 2).toString(),
    price: products[2]!.price,
    quantity: 2,
    total: products[2]!.price * 2,
  },
  // total not consistent
  {
    productId: (Date.now() + 3).toString(),
    price: products[3]!.price,
    quantity: 2,
    total: 1000 * 2,
  },
  // not exist
  {
    productId: (Date.now() + 4).toString(),
    price: 10000,
    quantity: 2,
    total: 10000 * 2,
  },
];

export const errors = [
  {
    productId: carts[0].productId,
    messages: [messages.BILL.PRICE_NOT_CONSISTENT, messages.BILL.TOTAL_NOT_CONSISTENT],
    errorCode: ErrorCode.REFRESH_PRODUCT,
  },
  {
    productId: carts[1].productId,
    messages: [messages.BILL.OVERCOME_LIMIT],
    errorCode: ErrorCode.REFRESH_PRODUCT,
  },
  {
    productId: carts[2].productId,
    messages: [messages.BILL.PRODUCT_EXPIRED],
    errorCode: ErrorCode.DISABLED_PRODUCT,
  },
  {
    productId: carts[3].productId,
    messages: [messages.BILL.TOTAL_NOT_CONSISTENT],
    errorCode: ErrorCode.REFRESH_PRODUCT,
  },
  {
    productId: carts[4].productId,
    messages: [messages.PRODUCT.PRODUCT_DID_NOT_EXIST],
    errorCode: ErrorCode.DISABLED_PRODUCT,
  },
];

export const selects = carts.map((cart) => [
  {
    where: {
      product_id: cart.productId,
    },
    select: {
      price: true,
      count: true,
      status: true,
    },
  },
]);

export const errorObject = {
  errors,
  totalErrorMessage: messages.BILL.FINISH_TOTAL_NOT_CONSISTENT,
  validateResult: false,
};

export const errorObjectWithValidateOk = {
  errors: [],
  totalErrorMessage: null,
  validateResult: true,
};

export const bill = {
  bill_id: Date.now().toString(),
  user_id: user.user_id,
  complete_total: 100000,
  created_at: Date.now().toString(),
};

export const billDetail = carts.map((cart) => {
  return {
    product_id: cart.productId,
    count: cart.quantity,
    total: cart.total,
  };
});
