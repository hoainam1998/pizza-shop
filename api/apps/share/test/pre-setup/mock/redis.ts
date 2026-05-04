jest.mock('redis', () => {
  return {
    createClient: jest.fn().mockImplementation(() => ({
      connect: jest.fn().mockResolvedValue({}),
      publish: jest.fn().mockResolvedValue({}),
      subscribe: jest.fn(),
      duplicate: jest.fn(),
      json: {
        set: jest.fn(),
        get: jest.fn(),
      },
      hSet: jest.fn(),
      hGet: jest.fn(),
      hmGet: jest.fn(),
      exists: jest.fn(),
      del: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
      sAdd: jest.fn(),
      sMembers: jest.fn(),
      sRem: jest.fn(),
    })),
  };
});
