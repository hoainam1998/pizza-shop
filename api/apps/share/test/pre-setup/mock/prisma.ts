export default {
  category: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findFirstOrThrow: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    count: jest.fn(),
  },
  product: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findFirstOrThrow: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    count: jest.fn(),
  },
  ingredient: {
    findMany: jest.fn(),
  },
  product_ingredient: {
    deleteMany: jest.fn(),
  },
  $transaction: jest.fn().mockResolvedValue({}),
};
