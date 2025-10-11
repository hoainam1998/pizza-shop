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
  $transaction: jest.fn().mockResolvedValue({}),
};
