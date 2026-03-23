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
    deleteMany: jest.fn(),
    findFirstOrThrow: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    count: jest.fn(),
  },
  ingredient: {
    findMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    findUniqueOrThrow: jest.fn(),
  },
  product_ingredient: {
    deleteMany: jest.fn(),
    findMany: jest.fn(),
  },
  user: {
    findUniqueOrThrow: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  bill: {
    findMany: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
  bill_detail: {
    findMany: jest.fn(),
  },
  $transaction: jest.fn().mockResolvedValue({}),
};
