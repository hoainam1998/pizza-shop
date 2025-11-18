jest.mock('redis', () => {
  return {
    createClient: jest.fn().mockImplementation(() => ({
      connect: jest.fn().mockResolvedValue({}),
      json: {
        set: jest.fn(),
        get: jest.fn(),
      },
      hSet: jest.fn(),
      hmGet: jest.fn(),
      exists: jest.fn(),
      del: jest.fn(),
      set: jest.fn(),
    })),
  };
});
