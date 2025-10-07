jest.mock('redis', () => {
  return {
    createClient: jest.fn().mockImplementation(() => ({
      connect: jest.fn().mockResolvedValue({}),
      json: {
        set: jest.fn(),
        get: jest.fn(),
      },
      exists: jest.fn(),
    })),
  };
});
